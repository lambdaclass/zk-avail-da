import os
import time
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from dotenv import load_dotenv


def load_environment_variables():
    """Load environment variables from the .env file."""
    load_dotenv()
    return {
        'address': os.getenv('ADDRESS'),
        'email': os.getenv('EMAIL'),
        'smtp_server': os.getenv('SMTP_SERVER'),
        'smtp_port': os.getenv('SMTP_PORT'),
        'smtp_user': os.getenv('SMTP_USER'),
        'smtp_password': os.getenv('SMTP_PASSWORD')
    }


def setup_webdriver():
    """Configure the Selenium driver to work in headless mode."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    return webdriver.Chrome(options=chrome_options)


def claim_avail(driver, address):
    """Perform the request to claim AVAIL."""
    URL = "https://faucet.avail.tools/"
    ADDRESS_INPUT_TAG = "address"
    BUTTON_TEXT = "Get AVAIL"

    driver.get(URL)

    wait = WebDriverWait(driver, 10)
    address_input = wait.until(
        EC.visibility_of_element_located((By.ID, ADDRESS_INPUT_TAG)))
    address_input.send_keys(address)

    button = wait.until(EC.element_to_be_clickable(
        (By.XPATH, f"//button[text()='{BUTTON_TEXT}']")))
    button.click()

    # Wait a moment for the toast message to appear
    time.sleep(2)

    page_source = driver.page_source
    return page_source


def check_for_errors(page_source):
    """Check if there are error messages on the page."""
    message = "Successfully claimed AVAIL!"
    if "You have already claimed in the last 24 hours." in page_source:
        message = "Error: You have already claimed in the last 24 hours."
    elif "Something went wrong." in page_source:
        message = "Error: Something went wrong. Unknown Error."
    logging.info(message)
    return message


def send_email(subject, body, config):
    """Send an email with the given subject and body."""
    msg = MIMEMultipart()
    msg['From'] = config['smtp_user']
    msg['To'] = config['email']
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
        server.ehlo()
        server.starttls()
        server.login(config['smtp_user'], config['smtp_password'])
        text = msg.as_string()
        server.sendmail(config['smtp_user'], config['email'], text)
        server.quit()
        logging.info("Email sent successfully.")
    except Exception as e:
        logging.error(f"Failed to send email: {e}")


def setup_logging():
    """Set up logging to log events to a file."""
    if not os.path.exists('logs'):
        os.makedirs('logs')

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_filename = f'logs/{timestamp}.log'

    logging.basicConfig(
        filename=log_filename,
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )


def main():
    setup_logging()
    config = load_environment_variables()
    address = config['address']
    driver = setup_webdriver()

    try:
        while True:
            logging.info("Starting claim process.")
            page_source = claim_avail(driver, address)
            message = check_for_errors(page_source)
            send_email("AVAIL Faucet Claim Status", message, config)
            logging.info("Claim process completed. Waiting for 24 hours.")
            # Wait a day before trying again
            time.sleep(86400)
    finally:
        driver.quit()
        logging.info("Driver quit successfully.")


if __name__ == "__main__":
    main()
