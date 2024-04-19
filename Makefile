.PHONY: run-avail-da clean build

run-avail-da:
	@echo "Starting Avail services..."
	docker-compose up -d

clean:
	docker-compose down --remove-orphans

build:
	docker-compose build
