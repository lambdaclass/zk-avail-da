# AVAIL Faucet Web Scraper

This project is a web scraper designed to automate the process of claiming AVAIL tokens from the [AVAIL Faucet](https://faucet.avail.tools/) once a day.

The script uses Selenium to interact with the web page, log the events, and send email notifications about the success or failure of the claim process.

## Features

- Automates the AVAIL token claim process.
- Logs important events to a log file with a unique identifier for each run.
- Sends email notifications upon success or failure of the claim process.

## Prerequisites

- Python 3
- `dotenv` for environment variable management
- `smtplib` for sending emails

## Installation

1. **Install Dependencies**:
    ```sh
    pip install -r requirements.txt
    ```

2. **Set Up Environment Variables**:

    Create a `.env` file in the root directory of the project and add the following variables:
    ```
    ADDRESS=your_avail_address
    EMAIL=your_email@example.com
    SMTP_SERVER=smtp.example.com
    SMTP_PORT=587
    SMTP_USER=your_smtp_username
    SMTP_PASSWORD=your_smtp_password
    ```

## Usage

1. **Ensure ChromeDriver is installed and in your PATH**.

2. **Run the Script**:

    ```sh
    python web_scraper.py
    ```
    The script will attempt to claim AVAIL tokens once a day, log the events, and send email notifications about the success or failure of each attempt.

## Project Structure

```
.
├── logs                    # Directory where log files are stored
├── venv                    # Virtual environment directory
├── .env                    # Environment variables file
├── web_scraper.py          # Web Scraper script
├── requirements.txt        # Python dependencies
└── README.md               # Project README file
```

## Logging

The script creates a log file in a `logs` directory with a unique identifier for each run. The log file name follows the pattern `<timestamp>.log`, where `<timestamp>` is the date and time the script was executed.

## Email Notifications

The script sends email notifications for the following events:
- Successful claim of AVAIL tokens.
- Error indicating that AVAIL tokens have already been claimed in the last 24 hours.
- Unknown errors during the claim process.

## Format

Run the following command to format the code:
```sh
autopep8 --recursive --exclude venv --diff .
```
