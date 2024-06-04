# ZKSync Era Integration with Avail DA

## Introduction

This project aims to export data from [ZKSync Era](https://github.com/matter-labs/zksync-era) to [AvailDA](https://www.availproject.org/da).

## 🚀 Project Structure

This project contains different subprojects:

- **[deno](./deno/)**: A Deno script to submit pubdata from [ZKSync Era](https://github.com/matter-labs/zksync-era) to Turing Avail DA and verify it (using Sepolia).
- **[avail-da](./avail-da/)**: Docker containers to run an Avail DA node locally.
- **[da-sender](./da-sender/)**: A Rust script to submit pubdata from [ZKSync Era](https://github.com/matter-labs/zksync-era) to the local Avail DA node.
- **[da-getter](./da-getter/)**: A Rust script to retrieve data from the local Avail DA node.

## 🛠 Requirements

To run this project, you need to have installed:

- [Docker and Docker Compose](https://www.docker.com/products/docker-desktop).
- [Deno](https://deno.com).
- [Rust](https://www.rust-lang.org/tools/install).

## Usage

The usage of this project is divided into two main scenarios:

- Using the Avail DA Turing Testnet
- Running Avail DA locally.

Each scenario provides different ways to interact with the data availability layer, either through a public testnet or a local setup.

### Testnet

#### Sending and Verifying Pubdata Using Avail DA Turing Testnet

*Documentation pending.*

### Local
#### Running Avail DA Locally

To set up and run Avail DA locally, execute the following command:
```sh
make avail-da
```
This command builds and starts the Docker containers necessary for running Avail DA on your local machine.

#### Sending Pubdata to the Local Avail DA Node

With the `da-sender` script, after following the [steps](./da-sender/README.md), you can send pubdata from **ZKSync Era** to the local Avail DA by running this command:

```sh
make send-data
```
This command uses the da-sender script to submit the pubdata to your locally running Avail DA node.

## 🧞 Commands

*Documentation pending.*
