import os
import time
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from dotenv import load_dotenv

def load_address():
    """Load environment variable address from the .env file."""
    load_dotenv()
    return os.getenv('ADDRESS')

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
    address_input = wait.until(EC.visibility_of_element_located((By.ID, ADDRESS_INPUT_TAG)))
    address_input.send_keys(address)

    button = wait.until(EC.element_to_be_clickable((By.XPATH, f"//button[text()='{BUTTON_TEXT}']")))
    button.click()

    # Wait a moment for the toast message to appear
    time.sleep(2)

    page_source = driver.page_source
    return page_source

def check_for_errors(page_source):
    """Check if there are error messages on the page."""
    if "You have already claimed in the last 24 hours." in page_source:
        print("Error: You have already claimed in the last 24 hours.")
        logging.info("Error: You have already claimed in the last 24 hours.")
    elif "Something went wrong." in page_source:
        print("Error: Something went wrong. Unknown Error.")
        logging.info("Error: Something went wrong. Unknown Error.")
    else:
        logging.info("Successfully claimed AVAIL!")

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
    address = load_address()
    driver = setup_webdriver()

    try:
        while True:
            logging.info("Starting claim process.")
            page_source = claim_avail(driver, address)
            check_for_errors(page_source)
            logging.info("Claim process completed. Waiting for 24 hours.")
            # Wait a day before trying again
            time.sleep(86400)
    finally:
        driver.quit()
        logging.info("Driver quit successfully.")

if __name__ == "__main__":
    main()
