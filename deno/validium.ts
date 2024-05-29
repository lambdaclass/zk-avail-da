import {ApiPromise, Keyring, WsProvider} from "https://deno.land/x/polkadot@0.2.45/api/mod.ts";
import {API_EXTENSIONS, API_RPC, API_TYPES} from "./api_options.ts";
import {ISubmittableResult} from "https://deno.land/x/polkadot@0.2.45/types/types/extrinsic.ts";
import {ethers} from "npm:ethers@5.4";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import ABI from './abi/availbridge.json' with {type: "json"};
import { KeyringPair } from "https://deno.land/x/polkadot@0.2.45/keyring/types.ts";

const env = await load();

const AVAIL_RPC = env["AVAIL_RPC"];
const SURI = env["SURI"];
const BRIDGE_ADDRESS = env["DA_BRIDGE_ADDRESS"]; // deployed bridge address
const DATA = "a"; // data to send
const BRIDGE_API_URL = env["BRIDGE_API_URL"]; // bridge api url
const ETH_PROVIDER_URL = ""; // eth provider url
const availApi = await ApiPromise.create({
    provider: new WsProvider(AVAIL_RPC),
    rpc: API_RPC,
    types: API_TYPES,
    signedExtensions: API_EXTENSIONS,
});
const account = new Keyring({type: "sr25519"}).addFromUri(SURI);

/**
 *  ProofData represents a response from the api that holds proof for
 *  the blob verification.
 */
class ProofData {
    dataRootProof: Array<string> | undefined
    leafProof: string | undefined
    rangeHash: string | undefined
    dataRootIndex: number | undefined
    blobRoot: string | undefined
    bridgeRoot: string | undefined
    leaf: string | undefined
    leafIndex: number | undefined
}

interface Event {
    phase: { applyExtrinsic: number };
    event: { index: string; data: Array<string | { weight: { refTime: number; proofSize: number }; class: string; paysFee: string }> };
    topics: Array<any>;
}

interface DispatchInfo {
    weight: { refTime: number; proofSize: number };
    class: string;
    paysFee: string;
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
async function submitData(availApi: ApiPromise, data: string, account: KeyringPair): Promise<SubmitDataResult> {
    return new Promise<SubmitDataResult>((res) => {
        console.log("Sending transaction...");
        availApi.tx.dataAvailability.submitData(data).signAndSend(account, { nonce: -1 }, (result: ISubmittableResult) => {
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


let result: SubmitDataResult = await submitData(availApi, DATA, account);
if (result.isFinalized) {
    console.log(`DA transaction in finalized block: ${result.blockNumber}, transaction index: ${result.txIndex}`);
    console.log(`result submitData = ${JSON.stringify(result)}`);
}

// wait until the chain head on the Ethereum network is updated with the block range
// in which the Avail DA transaction is included.
while (true) {
    let getHeadRsp = await fetch(BRIDGE_API_URL + "/avl/head");
    if (getHeadRsp.status != 200) {
        console.log("Something went wrong fetching the head.");
        console.log("Status:", getHeadRsp.status);
        console.log("Status Text:", getHeadRsp.statusText);
        console.log("Headers:", Array.from(getHeadRsp.headers.entries()));
        const responseBody = await getHeadRsp.text();
        console.log("Response Body:", responseBody);
        break;
    }
    let headRsp = await getHeadRsp.json();
    let blockNumber: number = result.blockNumber.toNumber();
    let lastCommittedBlock: number = headRsp.data.end;
    console.log(`lastCommittedBlock = ${lastCommittedBlock}, blockNumber = ${blockNumber} => ${blockNumber - lastCommittedBlock} blocks left`);
    if (lastCommittedBlock >= blockNumber) {
        console.log("Fetching the blob proof.")
        const proofResponse = await fetch(BRIDGE_API_URL + "/eth/proof/" + result.status.asFinalized + "?index=" + result.txIndex);
        console.log(proofResponse.url)
        if (proofResponse.status != 200) {
            console.log("Something went wrong fetching the proof.")
            console.log(proofResponse)
            break;
        }
        let proof: ProofData = await proofResponse.json();
        console.log("Proof fetched:")
        console.log(proof);
        // call the deployed contract verification function with the inclusion proof.
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
        console.log(`Blob validation is: ${isVerified}`)
        break;
    }

    console.log("Waiting to bridge inclusion commitment. This can take a while...")
    // wait for 1 minute to check again
    await new Promise(f => setTimeout(f, 60*1000));
}

Deno.exit(0);
