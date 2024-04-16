.PHONY: run-avail-da clean

run-avail-da:
	@echo "Starting Avail services..."
	docker-compose up -d

clean:
	docker-compose down --remove-orphans
