# ZKSync Era Integration with Avail DA

This project aims to export data from [ZKSync Era](https://github.com/matter-labs/zksync-era) to [AvailDA](https://www.availproject.org/da), facilitating interoperability between the two blockchain ecosystems.

## How it works?

We need to run three nodes and the DA server:
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

To set up and run Avail DA, follow these steps:

1. **Clone Repositories and Compile Projects**:
    - This command clones the necessary repositories and compiles the projects:

    ```sh
    make install
    ```

2. **Start Avail DA Nodes and Server**:
    - This command initializes the Avail DA nodes and server:

    ```sh
    make run
    ```
