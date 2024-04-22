.PHONY: run-avail-da clean build run-avail-da-full

run-avail-da:
	@echo "Starting Avail services..."
	docker-compose up -d

clean:
	docker-compose down --remove-orphans

build:
	docker-compose build

run-avail-da-full:
	cd avail-da-full && \
	docker build -t avail-da-full . && \
	docker run -p 9944:9944 -p 3000:3000 -p 7700:7700 -p 39000:39000 -p 8000:8000 -it --name avail-da-full avail-da-full
