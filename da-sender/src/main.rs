use base64;
use owo_colors::OwoColorize;
use std::collections::HashMap;
use std::error::Error;
use std::fs;
use tokio;
use base64::prelude::*;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    run().await
}

async fn run() -> Result<(), Box<dyn Error>> {
    // Read the content of the file pubdata_storage.json
    let file_content = match fs::read_to_string("data/pubdata_storage.json") {
        Ok(content) => content,
        Err(e) => {
            eprintln!("Error reading file: {}", e);
            return Err(Box::new(e));
        }
    };

    // Convert the content to Base64
    let base64_content = BASE64_STANDARD.encode(file_content);

    let mut map = HashMap::new();
    map.insert("data", base64_content);

    let client = reqwest::Client::new();
    let res = client
        .post("http://127.0.0.1:8001/v2/submit")
        .json(&map)
        .send()
        .await;

    let body: serde_json::Value  = res?.json().await?;
    print!("{:#}","Block hash: ".green());
    println!("{:#}", body["block_hash"]);
    print!("{:#}","Block number: ".cyan());
    println!("{:#}", body["block_number"]);
    print!("{:#}", "Hash: ".magenta());
    println!("{:#}", body["hash"]);
    print!("{:#}", "Index: ".yellow());
    println!("{:#}", body["index"]);
    Ok(())
}
