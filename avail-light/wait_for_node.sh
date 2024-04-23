#!/bin/bash
sh -c "socat TCP-LISTEN:9944,fork TCP:avail-da-node:9944 &"
sh -c "socat TCP-LISTEN:39000,fork TCP:avail-light-bootstrap:39000 &"
sh -c "nginx -g 'daemon off;' -c /etc/nginx/nginx.conf &"

while ! curl -s avail-da-node:9944 > /dev/null; do
    echo "Waiting for avail-da-node to start..."
    sleep 1
done
echo "avail-da-node is now running."
sh -c "cargo run --release -- --network local -c config.yaml --clean"
