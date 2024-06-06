.PHONY: avail-da clean build avail-da-full avail-da-testnet send-data get-data validium validium-test web-scraper web-scraper-install web-scraper-run web-scraper-venv web-scraper-clean

avail-da: clean build
	@echo "Starting Avail services..."
	cd avail-da && \
	docker-compose up -d && docker-compose logs -f

clean:
	cd avail-da && \
	docker-compose down --remove-orphans

build:
	cd avail-da && \
	docker-compose build

avail-da-full:
	cd avail-da && \
	cd avail-da-full && \
	docker build -t avail-da-full . && \
	docker run -p 9944:9944 -p 3000:3000 -p 7700:7700 -p 39000:39000 -p 8000:8000 -p 8001:8001 -it --name avail-da-full avail-da-full

avail-da-testnet:
	cd avail-da && \
	cd avail-da-testnet && \
	docker build -t avail-da-testnet . && \
	docker run -p 8002:8001 -it --name avail-da-testnet avail-da-testnet

send-data:
	cd da-sender && \
	cargo build --release && \
	cargo run --release

send-custom-data:
	cd da-sender && \
	cargo build --release && \
	cargo run --release -- --custom-pubdata true

get-data:
	cd da-getter && \
	cargo build --release && \
	cargo run --release

format:
	cd da-sender && \
	cargo fmt
	cd da-getter && \
	cargo fmt
	cd validium && \
	deno fmt
	cd tools/web_scraper && source venv/bin/activate && autopep8 --recursive --exclude venv --in-place .

validium:
	cd validium && \
	deno task validium

validium-test:
	cd validium && \
	deno task test

VENV_DIR = tools/web_scraper/venv
ACTIVATE = source $(VENV_DIR)/bin/activate
PYTHON = $(VENV_DIR)/bin/python
PIP = $(VENV_DIR)/bin/pip
REQUIREMENTS = tools/web_scraper/requirements.txt
SCRIPT = tools/web_scraper/web_scraper.py

web-scraper: web-scraper-install web-scraper-run

web-scraper-install: web-scraper-venv
	$(ACTIVATE) && $(PIP) install -r $(REQUIREMENTS)

web-scraper-run: web-scraper-install
	$(ACTIVATE) && $(PYTHON) $(SCRIPT)

web-scraper-venv:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		python3 -m venv $(VENV_DIR); \
	fi

web-scraper-clean:
	rm -rf $(VENV_DIR)
	find . -type d -name "__pycache__" -exec rm -r {} +

web-scraper-clean-logs:
	rm -rf tools/web_scraper/logs
