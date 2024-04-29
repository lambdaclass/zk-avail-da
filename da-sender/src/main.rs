use std::fs;
use base64;

fn main() {
    // Read the content of the file pubdata_storage.json
    let file_content = match fs::read_to_string("data/pubdata_storage.json") {
        Ok(content) => content,
        Err(e) => {
            eprintln!("Error reading file: {}", e);
            return;
        }
    };

    // Convert the content to Base64
    let base64_content = base64::encode(file_content);

    // Send the data using curl
    let curl_command = format!(
        "curl -XPOST 127.0.0.1:8001/v2/submit --header \"Content-Type: application/json\" --data '{{\"data\":\"{}\"}}'",
        base64_content
    );

    let output = std::process::Command::new("sh")
        .arg("-c")
        .arg(&curl_command)
        .output()
        .expect("Error executing curl command");

    if output.status.success() {
        println!("Data sent successfully");
    } else {
        eprintln!(
            "Error sending data: {}",
            String::from_utf8_lossy(&output.stderr)
        );
    }
}
