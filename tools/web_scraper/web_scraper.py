from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from dotenv import load_dotenv
import os
import time

load_dotenv()

URL = "https://faucet.avail.tools/"
ADDRESS_INPUT_TAG = "address"
BUTTON_TEXT = "Get AVAIL"
address = os.getenv('ADDRESS')

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(options=chrome_options)
driver.get(URL)

try:
    while (True):
        wait = WebDriverWait(driver, 10)
        address_input = wait.until(EC.visibility_of_element_located((By.ID, ADDRESS_INPUT_TAG)))
        address_input.send_keys(address)

        button = wait.until(EC.element_to_be_clickable((By.XPATH, f"//button[text()='{BUTTON_TEXT}']")))
        button.click()
        time.sleep(2)
        page_source = driver.page_source
        if "You have already claimed in the last 24 hours." in page_source:
            print("Error: You have already claimed in the last 24 hours.")
        elif "Something went wrong." in page_source:
            print("Error: Something went wrong. Unknown Error.")
        else:
            print("Successfully claimed AVAIL!")
        time.sleep(86400) # Wait a day
finally:
    driver.quit()
