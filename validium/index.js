import Keyring from "@polkadot/keyring";
import { createApi } from "./common.js";
import { generateAccount, getDataRoot, submitData } from "./submitData.js";
import { ethers, hexlify } from "ethers";
import { checkProof, getProof } from "./submitProof.js";

const availApi = await createApi("ws://127.0.0.1:9944");
const blockHash = "0xef43e13a88b8968837dba31b637c389ddda84fcc674d0de24e73bcd64e02cfc0"
const dataRoot = await getDataRoot(
    availApi,
    blockHash
);

const { block } = JSON.parse(await availApi.rpc.chain.getBlock(blockHash));
const transactionIndex = block.header.extension.v2.appLookup.index[0].appId;
const blockNumber = block.header.number;

console.log(`Block = ${JSON.stringify(block)}`)

const sepoliaApi = new ethers.getDefaultProvider("sepolia");
console.log(
    `Getting proof for data index ${transactionIndex} block number ${blockNumber} and block hash ${blockHash}`,
);
const daHeader = await getProof(
    availApi,
    blockHash,
    transactionIndex,
);

console.log(`Da Header: ${JSON.stringify(daHeader)}`);

// console.log(`Data Root: ${hexlify(daHeader.root)}`);
// console.log(`Proof: ${daHeader.proof}`);
// console.log(`Leaf to prove: ${hexlify(daHeader.leaf)}`);
// console.log(`Leaf index : ${daHeader.leaf_index}`);
// console.log(`Number of leaves: ${daHeader.numberOfLeaves}`);

const isDataAccepted = await checkProof(
    sepoliaApi,
    blockNumber,
    daHeader.dataProof.proof,
    daHeader.dataProof.numberOfLeaves,
    daHeader.dataProof.leafIndex,
    daHeader.dataProof.leaf,
);
console.log("Data is: " + (isDataAccepted ? "available" : "not available"));

await availApi.disconnect();
