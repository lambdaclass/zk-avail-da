import Keyring from "@polkadot/keyring";
import { createApi } from "./common.js";
import { generateAccount, getDataRoot, submitData } from "./submitData.js";
import { ethers, hexlify } from "ethers";
import { checkProof, getProof } from "./submitProof.js";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();

const availApi = await createApi("wss://turing-rpc.avail.so/ws");
const sepoliaApi = new ethers.getDefaultProvider("sepolia");
const contractSepolia = "0x67044689F7e274a4aC7b818FDea64Cb4604c6875";
const contractAbiPath = "abi/ValidiumContract.json";

console.log("Submitting data to Testnet...");
const keyring = new Keyring({
    type: "sr25519",
});
// const password = process.env.ACCOUNT_PASSWORD;
// const accountJson = JSON.parse(readFileSync(`account.json`, 'utf8'));
// console.log('Account JSON:', accountJson);
// const account = keyring.addFromJson(accountJson);
// account.unlock(password);
const account = keyring.addFromMnemonic(process.env.SURI);
let result = await submitData(availApi, "0", account);
consol.log(`result = ${JSON.stringify(result)}`);

const { block } = JSON.parse(await availApi.rpc.chain.getBlock(blockHash));
const transactionIndex = block.header.extension.v2.appLookup.index[0].appId;
const blockNumber = block.header.number;

console.log(`Block = ${JSON.stringify(block)}`)

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
    contractSepolia,
    contractAbiPath,
    blockNumber,
    daHeader.dataProof.proof,
    daHeader.dataProof.numberOfLeaves,
    daHeader.dataProof.leafIndex,
    daHeader.dataProof.leaf,
);
console.log("Data is: " + (isDataAccepted ? "available" : "not available"));

await availApi.disconnect();
