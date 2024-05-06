use std::error::Error;
use std::fs;
use std::io::{self};
use base64::prelude::*;

const FILE_PATH: &str = "data/retrieved_data.json";
const ENDPOINT_URL: &str = "http://127.0.0.1:8001/v1/appdata/";

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    println!("Enter the block number:");
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    let block_number = input.trim();

    let url = format!("{}{}?decode=true", ENDPOINT_URL, block_number);

    let response = reqwest::get(&url).await?;

    if response.status().is_success() {
        let body: serde_json::Value = response.json().await?;


        if let Some(extrinsics) = body["extrinsics"].as_array() {
            // Check if the array has at least one element
            if !extrinsics.is_empty() {
                // Get the first element of the array (a string)
                if let Some(first_extrinsic) = extrinsics[0].as_str() {
                    let decoded = BASE64_STANDARD.decode(first_extrinsic);
                    fs::write(FILE_PATH, decoded.unwrap())?;
                    println!("Data successfully retrieved and saved to '{}'", FILE_PATH);

                } else {
                    println!("The first element of the array is not a string.");
                }
            } else {
                println!("The array of extrinsics is empty.");
            }
        } else {
            println!("The value of 'extrinsics' is not an array.");
        }

    } else {
        eprintln!("Failed to retrieve data. HTTP status code: {}", response.status());
    }

    Ok(())
}
