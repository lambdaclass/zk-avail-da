FROM rust:latest

WORKDIR /app

RUN git clone https://github.com/availproject/avail-light.git .

RUN git fetch && git checkout v1.7.8

COPY config.yaml .

RUN cargo run --release -- --network local -c config.yaml --clean
