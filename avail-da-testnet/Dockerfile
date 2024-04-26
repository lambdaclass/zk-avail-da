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

COPY config.yaml .

COPY nginx.conf /etc/nginx/nginx.conf

RUN nginx -g 'daemon off;' -c /etc/nginx/nginx.conf &

EXPOSE 8001

CMD ["cargo", "run", "--release", "--", "-c", "config.yaml",  "--clean"]
