# ZKSync Era Integration with Avail DA

This project aims to export data from [ZKSync Era](https://github.com/matter-labs/zksync-era) to [AvailDA](https://www.availproject.org/da).

## Project Structure

[TODO]

## Requirements

- [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/) are required to `avail-da` containers.
- [Deno](https://deno.com/) for running `validium` script.
- [Rust](https://www.rust-lang.org/tools/install) to run the `da-getter` and `da-sender` scripts.

## Running Avail DA locally

To set up and run Avail DA, execute the following command:
```sh
make avail-da
```
This command will handle the necessary setup and execution steps for Avail DA.

# Sending ZKSync Era Pubdata to AvailDA

To send pubdata from ZKSync Era to AvailDA, follow these steps:

## Prerequisites

- Ensure that AvailDA is running on your system.

```sh
make avail-da
```

- Clone [ZKSync Era](https://github.com/lambdaclass/zksync-era) repository and switch to the `validium-demo-new-main` branch.

## Sending Pubdata

### Step 1: Generate Pubdata

Navigate to the `zksync-era` directory and run the following command:

```sh
zk && zk clean --all && zk env dev_validium && zk init --validium-mode && zk server
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


## Send Custom Pubdata to AvailDA

After updating the `da-sender/data/pubdata_storage.json`, run the following command:

```sh
make send-custom-data
```

## Format

Run the following command:
```sh
make format
```
