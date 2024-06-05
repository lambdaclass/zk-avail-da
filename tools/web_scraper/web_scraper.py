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

while (True):
    try:
        wait = WebDriverWait(driver, 10)
        address_input = wait.until(EC.visibility_of_element_located((By.ID, ADDRESS_INPUT_TAG)))
        address_input.send_keys(address)

        button = wait.until(EC.element_to_be_clickable((By.XPATH, f"//button[text()='{BUTTON_TEXT}']")))
        button.click()
        print(f"Successfully Get AVAIL!")
        time.sleep(86400) # Wait a day
    finally:
        driver.quit()
