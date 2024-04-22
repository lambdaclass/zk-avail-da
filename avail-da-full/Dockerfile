FROM rust:latest

RUN apt-get update && apt-get install -y \
    build-essential \
    clang \
    protobuf-compiler \
    socat \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y golang \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/avail-da-node
RUN git clone https://github.com/availproject/avail.git . \
    && git fetch && git checkout v1.10.0.0
RUN cargo build --release

WORKDIR /app/avail-da-server
RUN git clone https://github.com/rollkit/avail-da.git .

WORKDIR /app/avail-light-bootstrap
RUN git clone https://github.com/availproject/avail-light-bootstrap.git .
RUN cargo build --release

WORKDIR /app/avail-light
RUN git clone https://github.com/availproject/avail-light.git .
RUN git fetch && git checkout v1.7.8
RUN cargo build --release

COPY wait_for_node.sh /app/avail-light/wait_for_node.sh
COPY config.yaml /app/avail-light/config.yaml

EXPOSE 9944 3000 7700 39000 8000

CMD sh -c "\
    cd /app/avail-da-node && \
    cargo run --locked --release -- --dev --enable-kate-rpc --rpc-external --rpc-port 9944 --rpc-cors all & \
    cd /app/avail-da-server && \
    go run cmd/avail-da/main.go & \
    cd /app/avail-light-bootstrap && \
    cargo run --release & \
    cd /app/avail-light && \
    sh wait_for_node.sh"
