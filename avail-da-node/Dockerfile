FROM rust:latest

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    clang \
    protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/availproject/avail.git .

RUN git fetch && git checkout v1.10.0.0

CMD ["cargo", "run", "--locked", "--release", "--", "--dev", "--enable-kate-rpc", "--rpc-external", "--rpc-port",  "9944", "--rpc-cors", "all"]