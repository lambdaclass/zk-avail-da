# ZKSync Era Integration with Avail DA

## Integration of ZKSync Era with Avail DA

This project aims to export data from [ZKSync Era](https://github.com/matter-labs/zksync-era) to [AvailDA](https://www.availproject.org/da).

## 🚀 Project Structure

This project contains different subprojects:

- **[deno](./deno/)**: A Deno script to submit pubdata from [ZKSync Era](https://github.com/matter-labs/zksync-era) to Turing Avail DA and verify it (using Sepolia).
- **[avail-da](./avail-da/)**: Docker containers to run an Avail DA node locally.
- **[da-sender](./da-sender/)**: A Rust script to submit pubdata from [ZKSync Era](https://github.com/matter-labs/zksync-era) to the local Avail DA node.
- **[da-getter](./da-getter/)**: A Rust script to retrieve data from the local Avail DA node.

## 🛠 Requirements

To run this project, you need to have installed:

- [Docker and Docker Compose](https://www.docker.com/products/docker-desktop/).
- [Deno](https://deno.com/).
- [Rust](https://www.rust-lang.org/tools/install).

## Usage

### Testnet

#### Sending and Verifying Pubdata Using Avail DA Turing Testnet

[TODO]

### Local
#### Running Avail DA Locally

To set up and run Avail DA locally, execute the following command:
```sh
make avail-da
```

#### Sending Pubdata to the Local Avail DA Node

With the `da-sender` script, after following the [steps](./da-sender/README.md), you can send pubdata from **ZKSync Era** to the local Avail DA by running this command:

```sh
make send-data
```

## 🧞 Commands

[TODO]
