# ZKSync Era Integration with Avail DA

This project aims to export data from [ZKSync Era](https://github.com/matter-labs/zksync-era) to [AvailDA](https://www.availproject.org/da).

## How it Works

To achieve interoperability, the project requires setting up three nodes and a DA server:

- **Avail DA node**: Official client for the Avail blockchain.
- **Avail light node**: DA light client which listens on Avail network for finalized blocks.
- **Avail light Bootstrap node**: Bootstrap node for Avail light client.
- **Avail DA server**

## Requirements

Ensure you have the following dependencies installed:

- Rust
- Go
- Protocol Buffers

You can install Protocol Buffers using Homebrew with the following command:

```sh
brew install protobuf
```

## Running Avail DA

To set up and run Avail DA, execute the following command:
```sh
make run-avail-da
```
This command will handle the necessary setup and execution steps for Avail DA.
