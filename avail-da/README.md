# Running Avail DA locally

This part of the project aims to run Avail DA blockchain locally.

## How it Works

To achieve interoperability, the project requires setting up three nodes and a DA server:

- **Avail DA node**: Official client for the Avail blockchain.
- **Avail light node**: DA light client which listens on Avail network for finalized blocks.
- **Avail light Bootstrap node**: Bootstrap node for Avail light client.
- **Avail DA server**

## Requirements

Docker and Docker Compose are required to run the services. Ensure you have Docker installed on your system before proceeding.

## Running Avail DA

To set up and run Avail DA, execute the following command from the root directory:
```sh
make avail-da
```
This command will handle the necessary setup and execution steps for Avail DA.

## Running Avail DA Testnet

To configure and run Avail DA with Goldberg's Testnet, run the following command from the root directory:
```sh
make avail-da-testnet
```
This command will create a single Light Node docker with the necessary configuration to use this testnet. Unlike the local Avail DA, it will listen on port 8002.

## Using the API Light Node

After setting up Avail DA, you can interact with the API Light Node by sending requests to port 8001. Here are a couple of example requests:

### Get Latest Block
```sh
curl http://127.0.0.1:8001/v1/latest_block
```
Response:
```json
{"latest_block":168}
```

### Get Block Status
```sh
curl http://127.0.0.1:8001/v2/blocks/158
```
Response:
```json
{"status":"finished","confidence":93.75}
```

### Explorer

You can use [this explorer](https://explorer.avail.so/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/explorer).


## References

This project is based on the following articles and resources:

- [Medium article](https://medium.com/vitwit/unlocking-the-power-of-rollups-using-rollkit-and-avail-da-86018d4e84d6)
- [Avail's Documentation](https://docs.availproject.org/docs/operate-a-node/node-types)
