#!/bin/bash

while ! curl -s avail-da-node:9944 > /dev/null; do
    echo "Waiting for avail-da-node to start..."
    sleep 10
done
echo "avail-da-node is now running."
sh -c "cargo run --release -- --network local -c config.yaml --clean"
