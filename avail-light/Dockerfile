FROM rust:latest

RUN apt-get update && apt-get install -y \
    build-essential \
    clang \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN git clone https://github.com/availproject/avail-light.git .

RUN git fetch && git checkout v1.7.8

COPY config.yaml .

RUN cargo run --release -- --network local -c config.yaml --clean
