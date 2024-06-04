from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from dotenv import load_dotenv
import os

load_dotenv()

URL = "https://faucet.avail.tools/"
ADDRESS_INPUT_TAG = "address"
BUTTON_TEXT = "Get AVAIL"
address = os.getenv('ADDRESS')

driver = webdriver.Chrome()
driver.maximize_window()
driver.get(URL)

wait = WebDriverWait(driver, 10)
wait.until(EC.visibility_of_element_located((By.ID, ADDRESS_INPUT_TAG))).send_keys(address + Keys.ENTER)
wait.until(EC.element_to_be_clickable((By.XPATH, f"//button[text()='{BUTTON_TEXT}']"))).click()
driver.implicitly_wait(10)
driver.quit()
