import { ethers, hexlify } from "ethers";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { createApi } from "./common.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Returns Merkle proof for the particular data.
 *
 * @param availApi Api instance
 * @param hashBlock Hash of the block
 * @param transactionIndex Index of the transaction in the block
 * @returns {Promise<*>}
 */
export async function getProof(availApi, hashBlock, transactionIndex) {
    const daHeader = await availApi.rpc.kate.queryDataProofV2(transactionIndex, hashBlock);
    console.log(
        `Fetched proof from Avail for txn index ${transactionIndex} inside block ${hashBlock}`,
    );
    return daHeader;
}

/**
 * Checks if the provided Merkle proof is valid by checking on the Ethereum deployed validation contract.
 *
 * @param sepoliaApi Sepolia network api instance
 * @param blockNumber Avail block number
 * @param proof Merkle proof fot the leaf
 * @param numberOfLeaves Number of leaves in the original tree
 * @param leafIndex Index of the leaf in the Merkle tree
 * @param leafHash Hash of the leaf in the Merkle tree
 * @returns {Promise<*>}
 */
export async function checkProof(
    sepoliaApi,
    contractAddress,
    contractAbiPath,
    blockNumber,
    proof,
    numberOfLeaves,
    leafIndex,
    leafHash,
) {
    console.log(`Contract Address = ${contractAddress}`);
    console.log(`Contract Abi Path = ${contractAddress}`);
    console.log(`Current Path = ${__dirname}`);
    const abi = JSON.parse(readFileSync(`${__dirname}/${contractAbiPath}`).toString());
    const availContract = new ethers.Contract(contractAddress, abi, sepoliaApi);
    return await availContract.checkDataRootMembership(
        BigInt(blockNumber),
        proof,
        BigInt(numberOfLeaves),
        BigInt(leafIndex),
        leafHash,
    );
}

export async function submitProof() {
    // connect to Sepolia through Infura but can be used any other available provider
    const sepoliaApi = new ethers.providers.getDefaultProvider("sepolia");
    const availApi = await createApi(process.env.AVAIL_RPC);

    console.log(
        `Getting proof for data index ${process.env.TRANSACTION_INDEX} block number ${process.env.BLOCK_NUMBER} and block hash ${process.env.BLOCK_HASH}`,
    );
    const daHeader = await getProof(
        availApi,
        process.env.BLOCK_HASH,
        process.env.TRANSACTION_INDEX,
    );

    console.log(`Data Root: ${hexlify(daHeader.root)}`);
    console.log(`Proof: ${daHeader.proof}`);
    console.log(`Leaf to prove: ${hexlify(daHeader.leaf)}`);
    console.log(`Leaf index : ${daHeader.leaf_index}`);
    console.log(`Number of leaves: ${daHeader.numberOfLeaves}`);

    // const isDataAccepted = await checkProof(
    //     sepoliaApi,
    //     process.env.BLOCK_NUMBER,
    //     daHeader.proof,
    //     daHeader.numberOfLeaves,
    //     daHeader.leaf_index,
    //     daHeader.leaf,
    // );
    // console.log("Data is: " + (isDataAccepted ? "available" : "not available"));

    await availApi.disconnect();
}
