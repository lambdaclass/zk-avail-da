use owo_colors::OwoColorize;
use std::collections::HashMap;
use std::error::Error;
use std::fs;
use base64::prelude::*;

const FILE_PATH: &str = "data/pubdata_storage.json";
const SUBMIT_URL: &str = "http://127.0.0.1:8001/v2/submit";

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    if let Err(err) = run().await {
        eprintln!("Error: {}", err);
    }
    Ok(())
}

async fn run() -> Result<(), Box<dyn Error>> {
    // Read the content of the file pubdata_storage.json
    let file_content = fs::read_to_string(FILE_PATH)?;

    // Convert the content to Base64
    let base64_content = BASE64_STANDARD.encode(file_content);

    let mut map = HashMap::new();
    map.insert("data", base64_content);

    let client = reqwest::Client::new();
    let res = client.post(SUBMIT_URL).json(&map).send().await?;

    if res.status().is_success() {
        let body: serde_json::Value = res.json().await?;
        print_results(&body);
    } else {
        eprintln!("HTTP request failed with status code: {}", res.status());
    }

    // Close the client to prevent resource leaks
    drop(client);

    Ok(())
}

fn print_results(body: &serde_json::Value) {
    print!("{:#}", "Block hash: ".green());
    println!("{:#}", body["block_hash"]);
    print!("{:#}", "Block number: ".cyan());
    println!("{:#}", body["block_number"]);
    print!("{:#}", "Hash: ".magenta());
    println!("{:#}", body["hash"]);
    print!("{:#}", "Index: ".yellow());
    println!("{:#}", body["index"]);
}
