FROM rust:latest

RUN apt-get update && apt-get install -y \
    build-essential \
    clang \
    redir \
    nginx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN git clone https://github.com/availproject/avail-light.git .

RUN git fetch && git checkout v1.7.8

COPY wait_for_node.sh .

RUN chmod +x wait_for_node.sh

COPY config.yaml .

COPY nginx.conf /etc/nginx/nginx.conf
