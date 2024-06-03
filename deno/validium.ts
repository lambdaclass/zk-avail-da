import { ApiPromise } from "https://deno.land/x/polkadot@0.2.45/api/mod.ts";
import { ISubmittableResult } from "https://deno.land/x/polkadot@0.2.45/types/types/extrinsic.ts";
import { ethers } from "npm:ethers@5.4";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import ABI from "./abi/availbridge.json" with { type: "json" };
import { KeyringPair } from "https://deno.land/x/polkadot@0.2.45/keyring/types.ts";
import { createAccount, initializeAvailApi } from "./helpers.ts";

const env = await load();

const AVAIL_RPC = env["AVAIL_RPC"];
const SURI = env["SURI"];
const BRIDGE_ADDRESS = env["DA_BRIDGE_ADDRESS"]; // deployed bridge address
const BRIDGE_API_URL = env["BRIDGE_API_URL"]; // bridge api url
const ETH_PROVIDER_URL = env["ETH_PROVIDER_URL"]; // eth provider url

/**
 *  ProofData represents a response from the api that holds proof for
 *  the blob verification.
 */
export class ProofData {
  // proof of inclusion for the data root
  dataRootProof: Array<string> | undefined;
  // proof of inclusion of leaf within blob/bridge root
  leafProof: Array<string> | undefined;
  // abi.encodePacked(startBlock, endBlock) of header range commitment on VectorX
  rangeHash: string | undefined;
  // index of the data root in the commitment tree
  dataRootIndex: number | undefined;
  // blob root to check proof against, or reconstruct the data root
  blobRoot: string | undefined;
  // bridge root to check proof against, or reconstruct the data root
  bridgeRoot: string | undefined;
  // leaf being proven
  leaf: string | undefined;
  // index of the leaf in the blob/bridge root tree
  leafIndex: number | undefined;
}

interface SubmitDataResult extends ISubmittableResult {
  blockNumber: string;
}

/**
 * Submitting data to Avail as a transaction.
 *
 * @param availApi api instance
 * @param data payload to send
 * @param account that is sending transaction
 * @returns {Promise<SubmitDataResult>}
 */
export function submitData(
  availApi: ApiPromise,
  data: string,
  account: KeyringPair,
): Promise<SubmitDataResult> {
  return new Promise<SubmitDataResult>((res) => {
    console.log("Sending transaction...");
    availApi.tx.dataAvailability.submitData(data).signAndSend(account, {
      nonce: -1,
    }, (result: ISubmittableResult) => {
      console.log(`Tx status: ${result.status}`);
      if (result.isError) {
        console.log(`Tx failed!`);
        res(result as any);
      }
      if (result.isInBlock) {
        console.log("Transaction in block, waiting for block finalization...");
      }
      if (result.isFinalized) {
        console.log(`Tx finalized.`);
        res(result as any);
      }
    });
  });
}

export async function getLastCommittedBlock(
  result: SubmitDataResult,
): Promise<number> {
  const getHeadRsp = await fetch(BRIDGE_API_URL + "/avl/head");
  if (getHeadRsp.status != 200) {
    console.log("Something went wrong fetching the head.");
    console.log("Status:", getHeadRsp.status);
    console.log("Status Text:", getHeadRsp.statusText);
    console.log("Headers:", Array.from(getHeadRsp.headers.entries()));
    const responseBody = await getHeadRsp.text();
    console.log("Response Body:", responseBody);
    Deno.exit(0);
  }
  const headRsp = await getHeadRsp.json();
  const blockNumber: number = Number(result.blockNumber);
  const lastCommittedBlock: number = headRsp.data.end;
  console.log(
    `lastCommittedBlock = ${lastCommittedBlock}, blockNumber = ${blockNumber} => ${
      blockNumber - lastCommittedBlock
    } blocks left`,
  );
  return lastCommittedBlock;
}

export async function getProof(result: SubmitDataResult): Promise<ProofData> {
  console.log("Fetching the blob proof.");
  const proofResponse = await fetch(
    BRIDGE_API_URL + "/eth/proof/" + result.status.asFinalized + "?index=" +
      result.txIndex,
  );
  console.log(proofResponse.url);
  if (proofResponse.status != 200) {
    console.log("Something went wrong fetching the proof.");
    console.log(proofResponse);
    Deno.exit(0);
  }
  const proof: ProofData = await proofResponse.json();
  console.log("Proof fetched:");
  console.log(proof);
  return proof;
}

export async function verifyProof(proof: ProofData): Promise<boolean> {
  // call the deployed contract verification function with the inclusion proof.
  const provider = new ethers.providers.JsonRpcProvider(ETH_PROVIDER_URL);
  const contractInstance = new ethers.Contract(
    BRIDGE_ADDRESS,
    ABI,
    provider,
  );
  const isVerified = await contractInstance.verifyBlobLeaf([
    proof.dataRootProof,
    proof.leafProof,
    proof.rangeHash,
    proof.dataRootIndex,
    proof.blobRoot,
    proof.bridgeRoot,
    proof.leaf,
    proof.leafIndex,
  ]);
  console.log(`Blob validation is: ${isVerified}`);
  return isVerified;
}

export async function proofAndVerify(result: SubmitDataResult) {
  // wait until the chain head on the Ethereum network is updated with the block range
  // in which the Avail DA transaction is included.
  const blockNumber: number = Number(result.blockNumber);
  let lastCommittedBlock: number = await getLastCommittedBlock(result);
  while (lastCommittedBlock < blockNumber) {
    console.log(
      "Waiting to bridge inclusion commitment. This can take a while...",
    );
    await new Promise((f) => setTimeout(f, 60 * 1000)); // wait for 1 minute to check again
    lastCommittedBlock = await getLastCommittedBlock(result);
  }
  const proof = await getProof(result);
  await verifyProof(proof);
}

export async function submitDataAndVerify(data: string) {
  const availApi = await initializeAvailApi(AVAIL_RPC);
  const account = createAccount(SURI);
  const result: SubmitDataResult = await submitData(availApi, data, account);
  if (result.isFinalized) {
    console.log(
      `DA transaction in finalized block: ${result.blockNumber}, transaction index: ${result.txIndex}`,
    );
    console.log(`result submitData = ${JSON.stringify(result)}`);
  }
  await proofAndVerify(result);
  Deno.exit(0);
}
