# Validium Deno Script

A Deno script that uses PolkadotSDK to submit data and get proof of its availability in AvailDA.

Using the [Avail's Bridge API](https://github.com/availproject/bridge-api) (running locally) and [Vector X's contracts](https://github.com/succinctlabs/vectorx?tab=readme-ov-file) of [Succinct](https://blog.succinct.xyz/vector-x/) with Turing Testnet.

## Requirements

- [Deno](https://deno.com/)
- [Avail's Bridge API](https://github.com/availproject/bridge-api) running locally and configured with the following `.env` into his project:
```
AVAIL_CLIENT_URL=https://turing-rpc.avail.so/rpc
SUCCINCT_URL=https://beaconapi.succinct.xyz/api/integrations/vectorx
AVAIL_CHAIN_NAME=turing
CONTRACT_CHAIN_ID=11155111
VECTORX_CONTRACT_ADDRESS=0xe542db219a7e2b29c7aeaeace242c9a2cd528f96
BRIDGE_CONTRACT_ADDRESS=0x1369a4c9391cf90d393b40faead521b0f7019dc5 # Currently failing
ETHEREUM_CLIENT_URL=https://ethereum-sepolia.publicnode.com
BEACONCHAIN_URL=https://sepolia.beaconcha.in/api/v1/slot
HOST=0.0.0.0
PORT=8080
```
- A `.env` file:
```
# avail rpc endpoint devnet/testnet
AVAIL_RPC=wss://turing-rpc.avail.so/ws # ws://127.0.0.1:9944
# mnemonic of the account to sign transactions on Avail network
SURI='your phrase'
# main devnet DA contract address
DA_BRIDGE_ADDRESS=
BRIDGE_API_URL=http://localhost:8080
```

## Run

```sh
deno task validium
```

## What do?

Submit the data to the Turing Testnet DA:
```ts
const result: SubmitDataResult = await submitData(availApi, DATA, account);
```
When finished, makes requests to the Bridge API asking for the [Sepolia block range](https://beaconapi.succinct.xyz/api/integrations/vectorx/range?contractChainId=11155111&contractAddress=0xe542db219a7e2b29c7aeaeace242c9a2cd528f96) using [this](https://sepolia.etherscan.io/address/0xe542db219a7e2b29c7aeaeace242c9a2cd528f96) using this contract to get the proof of our submitted block.
```ts
const getHeadRsp = await fetch(BRIDGE_API_URL + "/avl/head");
const headRsp = await getHeadRsp.json();
const lastCommittedBlock: number = headRsp.data.end;
if (lastCommittedBlock >= result.blockNumber) {
    // NEXT STEP
} else {
    // Wait one minute and try again
}
```
Once our block is in Sepolia's range. We can get the proof:
```ts
const proofResponse = await fetch(BRIDGE_API_URL + "/eth/proof/" + result.status.asFinalized + "?index=" + result.txIndex);
```
And call the Bridge contract verification function:
```ts
const provider = new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL);
const contractInstance = new ethers.Contract(BRIDGE_ADDRESS, ABI, provider);
const isVerified = await contractInstance.verifyBlobLeaf([
    proof.dataRootProof,
    proof.leafProof,
    proof.rangeHash,
    proof.dataRootIndex,
    proof.blobRoot,
    proof.bridgeRoot,
    proof.leaf,
    proof.leafIndex]
);
```

## Faucet

Use the [Polkadot extension](https://polkadot.js.org/extension/) to manage your accounts.

You can retrieve AVAIL tokens from [this website](https://faucet.avail.tools/).


## Explorer

You can check the block using [Subscan](https://avail-turing.subscan.io/) or [Avail Explorer](https://explorer.avail.so).
