# ZKSync Era Integration with Avail DA

This project aims to export data from [ZKSync Era](https://github.com/matter-labs/zksync-era) to [AvailDA](https://www.availproject.org/da).

## How it Works

To achieve interoperability, the project requires setting up three nodes and a DA server:

- **Avail DA node**: Official client for the Avail blockchain.
- **Avail light node**: DA light client which listens on Avail network for finalized blocks.
- **Avail light Bootstrap node**: Bootstrap node for Avail light client.
- **Avail DA server**

## Requirements

Docker and Docker Compose are required to run the services. Ensure you have Docker installed on your system before proceeding.

## Running Avail DA

To set up and run Avail DA, execute the following command:
```sh
make avail-da
```
This command will handle the necessary setup and execution steps for Avail DA.

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
