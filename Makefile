install:
    @echo "Cloning Avail DA..."
    git clone https://github.com/availproject/avail.git avail
    cd avail && git fetch && git checkout v1.10.0.0 && cargo build --locked --release -- --dev --enable-kate-rpc

    @echo "Cloning Avail Light Bootstrap..."
    git clone https://github.com/availproject/avail-light-bootstrap.git avail-light-bootstrap
    cd avail-light-bootstrap && cargo build --release

    @echo "Cloning Avail Light..."
    git clone https://github.com/availproject/avail-light.git avail-light
    cd avail-light && git fetch && git checkout v1.7.8 && cargo build --release

    @echo "Cloning Avail DA Server..."
    git clone https://github.com/rollkit/avail-da.git avail-da
    cd avail-da && go build -o avail-da cmd/avail-da/main.go

run:
    @echo "Starting Avail DA..."
    cd avail-da && ./avail-da &

    @echo "Starting Avail Light Bootstrap Node..."
    cd avail-light-bootstrap && cargo run --release &

    @echo "Starting Avail Light Node..."
    cd avail-light && cargo run --release -- --network local -c config.yaml --clean &
