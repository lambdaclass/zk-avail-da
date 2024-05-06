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

## Running Avail DA Testnet

To configure and run Avail DA with Goldberg's Testnet, run the following command:
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

# Sending ZKSync Era Pubdata to AvailDA

To send pubdata from ZKSync Era to AvailDA, follow these steps:

## Prerequisites

- Ensure that AvailDA is running on your system.

```sh
make avail-da
```

- Clone [ZKSync Era](https://github.com/lambdaclass/zksync-era) repository and switch to the `validium_demo` branch.

## Sending Pubdata

### Step 1: Generate Pubdata

Navigate to the `zksync-era` directory and run one of the following commands based on your preferred Validium mode:

For Validium with Calldata:
```sh
make demo_validium_calldata
```
For Validium with Blobs:
```sh
make demo_validium_blobs
```

### Step 2: Run Demo Scenario

In another terminal, execute the following command to run the basic scenario of the demo:

```sh
cargo run --package validium_mode_example --bin validium_mode_example
```

Please be patient as it may take some time to retrieve the pubdata.

### Step 3: Retrieve Pubdata

Once the pubdata retrieval process is complete, run the DA manager to retrieve the pubdata:

```sh
python da_manager_example/main.py
```

You should see a message confirming the retrieval of the pubdata, along with the batch number.

```
Starting from batch #1
Got batch #1 pubdata
```

You can see the retrieved data in `da_manager_example/data/pubdata_storage.json`.

### Step 4: Send Pubdata to AvailDA

Now, going back to the directory of this project, you can send the retrieved pubdata to your local AvailDA using the Light Node by executing the following command:

```sh
make send-data
```

This command will trigger the sending of the pubdata to AvailDA. If the send is successful, you should receive information such as the block hash, block number, hash and index in AvailDA.

## Get Block Data from AvailDA

If you want to get block data from AvailDA, you can use the following command:

```sh
make get-data
```

You will be prompted to enter the block number and you will get your original decoded data in `da-getter/data/retrieved_data.json`.
