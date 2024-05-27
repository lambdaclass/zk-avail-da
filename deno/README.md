# Validium Deno Script

A Deno script that uses PolkadotSDK to submit data and get proof of its availability in AvailDA. Using Turing testnet.

## Requirements

- [Deno](https://deno.com/)
- A `.env` file:
```
# avail rpc endpoint devnet/testnet
AVAIL_RPC=wss://turing-rpc.avail.so/ws # ws://127.0.0.1:9944
# mnemonic of the account to sign transactions on Avail network
SURI='your phrase'
# main devnet DA contract address
DA_BRIDGE_ADDRESS=
```

## Run

```sh
deno task validium
```

## Output

```txt
Tx status: {"inBlock":"0x434ee27ff5a2d9260054f26f0ec9d8d1327df7447fd2bfbb43599d36b3aaabf0"}
Transaction in block, waiting for block finalization...
Tx status: {"finalized":"0x434ee27ff5a2d9260054f26f0ec9d8d1327df7447fd2bfbb43599d36b3aaabf0"}
Tx finalized.
DA transaction in finalized block: 258736, transaction index: 2
```

You can check the block using [Subscan](https://avail-turing.subscan.io/) or [Avail's Explorer](https://explorer.avail.so).
