use base64::prelude::*;
use clap::{Arg, Command};
use owo_colors::OwoColorize;
use reqwest::{Client, ClientBuilder};
use spinners::{Spinner, Spinners};
use std::collections::{BTreeMap, HashMap};
use std::env;
use std::error::Error;
use std::fs;
use std::time::Duration;
use tokio_retry::strategy::{jitter, ExponentialBackoff};
use tokio_retry::Retry;

const FILE_PATH: &str = "data/pubdata_storage.json";
const SUBMIT_URL: &str = "http://127.0.0.1:8001/v2/submit";
const BLOCK_URL: &str = "http://127.0.0.1:8001/v2/blocks/";
const RETRY_COUNT: usize = 6;

#[derive(Debug)]
struct ServerError(reqwest::Error);

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let matches = Command::new("Pubdata Submitter for AvailDA")
        .arg(
            Arg::new("custom-pubdata")
                .short('c')
                .long("custom-pubdata")
                .help("Use da-sender/data/pubdata_storage.json file"),
        )
        .get_matches();
    let use_custom_pubdata = matches.args_present();
    if let Err(err) = run(use_custom_pubdata).await {
        eprintln!("Error: {}", err);
    }
    Ok(())
}

async fn run(use_custom_pubdata: bool) -> Result<(), Box<dyn Error>> {
    let file_content = read_pubdata(use_custom_pubdata).await?;
    let batches: BTreeMap<u32, String> = serde_json::from_str(&file_content)?;
    let client = ClientBuilder::new()
        .timeout(Duration::from_secs(60))
        .build()?;
    for (batch_number, pubdata) in batches {
        process_batch(batch_number, pubdata, &client).await?;
    }
    Ok(())
}

async fn process_batch(
    batch_number: u32,
    pubdata: String,
    client: &Client,
) -> Result<(), Box<dyn Error>> {
    println!();
    let mut sp = Spinner::new(
        Spinners::Aesthetic,
        format!("Sending pubdata from batch #{}...", batch_number),
    );
    let json_string = format!(
        r#"
    {{
        "{}": "{}"
    }}"#,
        batch_number, pubdata
    );
    let base64_content = BASE64_STANDARD.encode(json_string);
    let mut map = HashMap::new();
    map.insert("data", base64_content);

    let retry_strategy = ExponentialBackoff::from_millis(10)
        .map(jitter)
        .take(RETRY_COUNT);

    let result = Retry::spawn(retry_strategy, || client.post(SUBMIT_URL).json(&map).send()).await;
    sp.stop();
    println!();

    match result {
        Ok(res) => {
            if res.status().is_success() {
                let body: serde_json::Value = res.json().await?;
                print_results(&body);
                retrieve_block_header(&body["block_number"], &body["index"], client).await?;
            }
        }
        Err(e) => {
            eprintln!("HTTP request failed after retries: {}", e);
        }
    }
    Ok(())
}

async fn retrieve_block_header(
    block_number: &serde_json::Value,
    index: &serde_json::Value,
    client: &Client,
) -> Result<(), Box<dyn Error>> {
    let mut sp = Spinner::new(
        Spinners::Aesthetic,
        format!("Retrieving more data from the block {}...", block_number),
    );
    let block_header_url = BLOCK_URL.to_owned() + &block_number.to_string() + "/header";

    let retry_strategy = ExponentialBackoff::from_millis(10)
        .map(jitter)
        .take(RETRY_COUNT);

    let header_result = Retry::spawn(retry_strategy, {
        let client = client.clone();
        let block_header_url = block_header_url.clone();
        move || {
            let client = client.clone();
            let block_header_url = block_header_url.clone();
            async move {
                let res = client.get(&block_header_url).send().await;
                match res {
                    Ok(response) => {
                        if response.status().is_server_error() {
                            Err(ServerError(response.error_for_status().unwrap_err()))
                        } else {
                            Ok(response)
                        }
                    }
                    Err(err) => Err(ServerError(err)),
                }
            }
        }
    })
    .await;
    sp.stop();
    println!();

    match header_result {
        Ok(header_res) => {
            if header_res.status().is_success() {
                let header_body: serde_json::Value = header_res.json().await?;
                print_block_header(&header_body);
                submit_validium(&header_body, index)?;
            } else {
                eprintln!(
                    "HTTP request for block header failed with status code: {}",
                    header_res.status()
                );
            }
        }
        Err(e) => {
            eprintln!("HTTP request failed after retries: {:?}", e);
        }
    }
    Ok(())
}

fn submit_validium(
    header_body: &serde_json::Value,
    index: &serde_json::Value,
) -> Result<(), Box<dyn Error>> {
    let current_dir = env::current_dir()?;
    let nodejs_app_path = current_dir
        .parent()
        .expect("zk-avail-da")
        .join("validium/index.js");
    let nodejs_app_path_str = nodejs_app_path.to_str().ok_or("Invalid path")?;
    let block_hash = header_body["hash"].as_str().unwrap_or("");
    let block_number = header_body["number"].as_u64().unwrap_or(0).to_string(); // Converted to String
    let block_index = index.as_u64().unwrap_or(0).to_string();
    let contract_address = "0xA06386C65B1f56De57CE6aB9CeEB2552fa811529";
    let contract_abi_path = "abi/ValidiumContract.json";

    println!();
    let mut sp = Spinner::new(
        Spinners::Aesthetic,
        "Getting Proof from Validium Contract...".to_string(),
    );

    // println!(
    //     "DEBUG {:#} {:#} {:#}",
    //     &block_number, block_hash, &block_index
    // );

    let output = std::process::Command::new("node")
        .arg(nodejs_app_path_str)
        .arg(block_hash)
        .arg(&block_number)
        .arg(block_index)
        .arg(contract_address)
        .arg(contract_abi_path)
        .output()?;

    if !output.status.success() {
        println!("\nNodeJS app failed with status: {}", output.status);
        println!(
            "stderr: {:#}",
            String::from_utf8_lossy(&output.stderr).to_string().red()
        );
    }
    println!("\n\n{:#}", "NodeJS app output:".cyan());
    println!("{}", String::from_utf8_lossy(&output.stdout));
    sp.stop();
    println!();
    Ok(())
}

async fn read_pubdata(use_custom_pubdata: bool) -> Result<String, Box<dyn Error>> {
    let zksync_home = env::var("ZKSYNC_HOME")
        .map_err(|_| "The ZKSYNC_HOME environment variable is not defined.")?;
    let file_path = if use_custom_pubdata {
        // Use FILE_PATH directly if --pubdata-storage flag is present
        FILE_PATH.to_string()
    } else {
        format!("{}/da_manager_example/{}", zksync_home, FILE_PATH)
    };
    let file_content = fs::read_to_string(file_path)?;
    Ok(file_content)
}

fn print_results(body: &serde_json::Value) {
    println!();
    print!("{:#}", "Block hash: ".green());
    println!("{:#}", body["block_hash"]);
    print!("{:#}", "Block number: ".cyan());
    println!("{:#}", body["block_number"]);
    print!("{:#}", "Hash: ".magenta());
    println!("{:#}", body["hash"]);
    print!("{:#}", "Index: ".yellow());
    println!("{:#}", body["index"]);
    println!();
    println!("{:#}", "Data successfully submitted!".green());
    println!();
}

fn print_block_header(body: &serde_json::Value) {
    println!();
    println!("{:#}", "Block Information".underline().bold());
    println!();
    print!("{:#}", "Block Hash: ".green());
    println!("{:#}", body["hash"]);
    print!("{:#}", "Parent Hash: ".magenta());
    println!("{:#}", body["parent_hash"]);
    print!("{:#}", "Block Number: ".cyan());
    println!("{:#}", body["number"]);
    print!("{:#}", "State Root: ".magenta());
    println!("{:#}", body["state_root"]);
    print!("{:#}", "Extrinsics Root: ".yellow());
    println!("{:#}", body["extrinsics_root"]);

    // Additional data
    if let Some(extension) = body["extension"].as_object() {
        println!("Extension Information:");
        print!("{}", "  Rows: ".white());
        println!("{}", extension["rows"]);
        print!("{}", "  Cols: ".white());
        println!("{}", extension["cols"]);
        print!("{}", "  Data Root: ".white());
        println!("{}", extension["data_root"]);
        if let Some(commitments) = extension["commitments"].as_array() {
            println!("{}", "  Commitments:".white());
            for commitment in commitments {
                println!("    {}", commitment);
            }
        }
        if let Some(app_lookup) = extension["app_lookup"].as_object() {
            println!("{}", "  App Lookup Information:".white());
            print!("{}", "    Size: ".white());
            println!("{}", app_lookup["size"]);
            if let Some(index) = app_lookup["index"].as_array() {
                println!("{}", "    Index:".white());
                for item in index {
                    if let Some(app_id) = item["appId"].as_u64() {
                        println!("      App ID: {}", app_id);
                    }
                    if let Some(start) = item["start"].as_u64() {
                        println!("      Start: {}", start);
                    }
                }
            }
        }
    }
}
