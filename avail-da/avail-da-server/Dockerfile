FROM golang:latest

WORKDIR /app

RUN git clone https://github.com/rollkit/avail-da.git .

CMD ["go", "run", "cmd/avail-da/main.go"]
