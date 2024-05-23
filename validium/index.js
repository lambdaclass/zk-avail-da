import Keyring from "@polkadot/keyring";
import { createApi } from "./common.js";
import { generateAccount, getDataRoot, submitData } from "./submitData.js";
import { ethers, hexlify } from "ethers";
import { checkProof, getProof } from "./submitProof.js";
import * as dotenv from "dotenv";

dotenv.config();

const availApi = await createApi("ws://127.0.0.1:9944");
const blockHash = process.argv[2];
const blockNumber = +process.argv[3];
const transactionIndex = +process.argv[4];
const contractAddress = process.argv[5];
const contractAbiPath = process.argv[6];
const sepoliaApi = new ethers.getDefaultProvider("sepolia");

console.log(
    `Getting proof for data index ${transactionIndex} block number ${blockNumber} and block hash ${blockHash}`,
);
const daHeader = await getProof(availApi, blockHash, transactionIndex);

console.log(`Da Header: ${JSON.stringify(daHeader)}`);

// console.log(`Data Root: ${hexlify(daHeader.root)}`);
// console.log(`Proof: ${daHeader.proof}`);
// console.log(`Leaf to prove: ${hexlify(daHeader.leaf)}`);
// console.log(`Leaf index : ${daHeader.leaf_index}`);
// console.log(`Number of leaves: ${daHeader.numberOfLeaves}`);

const isDataAccepted = await checkProof(
    sepoliaApi,
    contractAddress,
    contractAbiPath,
    blockNumber,
    daHeader.dataProof.proof,
    daHeader.dataProof.numberOfLeaves,
    daHeader.dataProof.leafIndex,
    daHeader.dataProof.leaf,
);
console.log("Data is: " + (isDataAccepted ? "available" : "not available"));

await availApi.disconnect();
