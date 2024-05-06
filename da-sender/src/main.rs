use owo_colors::OwoColorize;
use std::collections::HashMap;
use std::error::Error;
use std::fs;
use base64::prelude::*;
use std::{thread, time};
use std::env;

const FILE_PATH: &str = "da_manager_example/data/pubdata_storage.json";
const SUBMIT_URL: &str = "http://127.0.0.1:8001/v2/submit";
const BLOCK_URL: &str = "http://127.0.0.1:8001/v2/blocks/";

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    if let Err(err) = run().await {
        eprintln!("Error: {}", err);
    }
    Ok(())
}

async fn run() -> Result<(), Box<dyn Error>> {
    // Read the content of the file pubdata_storage.json
    let file_content = read_pubdata().await?;

    // Convert the content to Base64
    let base64_content = BASE64_STANDARD.encode(file_content);

    let mut map = HashMap::new();
    map.insert("data", base64_content);

    let client = reqwest::Client::new();
    let res = client.post(SUBMIT_URL).json(&map).send().await?;

    if res.status().is_success() {
        let body: serde_json::Value = res.json().await?;
        print_results(&body);

        let ten_millis = time::Duration::from_secs(60);

        thread::sleep(ten_millis);
        // Perform GET request for block header information
        let block_header_url = BLOCK_URL.to_owned() + &body["block_number"].to_string() + "/header";
        println!("{:#}", block_header_url.red());
        let header_res = client.get(block_header_url).send().await?;
        if header_res.status().is_success() {
            let header_body: serde_json::Value = header_res.json().await?;
            print_block_header(&header_body);
        } else {
            eprintln!("HTTP request for block header failed with status code: {}", header_res.status());
        }
    } else {
        eprintln!("HTTP request failed with status code: {}", res.status());
    }

    // Close the client to prevent resource leaks
    drop(client);

    Ok(())
}

async fn read_pubdata() -> Result<String, Box<dyn Error>> {
    let zksync_home = env::var("ZKSYNC_HOME")
        .map_err(|_| "The ZKSYNC_HOME environment variable is not defined.")?;

    let file_path = format!("{}/{}", zksync_home, FILE_PATH);

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
}

fn print_block_header(body: &serde_json::Value) {
    println!();
    println!("Block Header Information:");
    print!("{:#}", "Hash: ".magenta());
    println!("{:#}", body["hash"]);
    print!("{:#}", "Parent Hash: ".cyan());
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
        print!("{}", "  Rows: ".yellow());
        println!("{}", extension["rows"]);
        print!("{}", "  Cols: ".yellow());
        println!("{}", extension["cols"]);
        print!("{}", "Data Root: ".magenta());
        println!("{}", extension["data_root"]);

        if let Some(commitments) = extension["commitments"].as_array() {
            println!("{}","Commitments:".green());
            for commitment in commitments {
                println!("  {}", commitment);
            }
        }

        if let Some(app_lookup) = extension["app_lookup"].as_object() {
            println!("{}","App Lookup Information:".cyan());
            print!("{}","Size: ".magenta());
            println!("{}", app_lookup["size"]);

            if let Some(index) = app_lookup["index"].as_array() {
                println!("{}","Index:".yellow());
                for item in index {
                    if let Some(app_id) = item["appId"].as_u64() {
                        println!("  App ID: {}", app_id);
                    }
                    if let Some(start) = item["start"].as_u64() {
                        println!("  Start: {}", start);
                    }
                }
            }
        }
    }
}
