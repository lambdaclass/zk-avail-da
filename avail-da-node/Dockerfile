FROM rust:latest

WORKDIR /app

RUN git clone https://github.com/availproject/avail.git .

RUN git fetch && git checkout v1.10.0.0

RUN cargo run --locked --release -- --dev --enable-kate-rpc
