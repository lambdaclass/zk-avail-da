#!/bin/bash
sh -c "redir --lport=9944 --laddr=0.0.0.0 --cport=9944 --caddr=avail-da-node &"
sh -c "redir --lport=39000 --laddr=0.0.0.0 --cport=39000 --caddr=avail-light-bootstrap &"
sh -c "nginx -g 'daemon off;' -c /etc/nginx/nginx.conf &"

while ! curl -s avail-da-node:9944 > /dev/null; do
    echo "Waiting for avail-da-node to start..."
    sleep 1
done
echo "avail-da-node is now running."
sh -c "cargo run --release -- --network local -c config.yaml --clean"
