.PHONY: avail-da clean build avail-da-full avail-da-testnet send-data get-data

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
	cd deno && \
	deno fmt
