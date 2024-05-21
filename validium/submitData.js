import { Keyring } from "@polkadot/api";
import {
    mnemonicGenerate,
    mnemonicToMiniSecret,
    mnemonicValidate,
    ed25519PairFromSeed,
} from "@polkadot/util-crypto";
import * as dotenv from "dotenv";
import { createApi, sendTx } from "./common.js";

dotenv.config();

export async function generateAccount() {
    // const mnemonic = mnemonicGenerate();
    // console.log(`Generated Mnemonic: ${mnemonic}`);
    // const keyring = new Keyring({ type: "sr25519" });
    // const account = keyring.addFromUri(mnemonic);
    // console.log(`Account Address: ${account.address}`);

    // Create mnemonic string for Alice using BIP39
    const mnemonicAlice = mnemonicGenerate();

    console.log(`Generated mnemonic: ${mnemonicAlice}`);

    // Validate the mnemonic string that was generated
    const isValidMnemonic = mnemonicValidate(mnemonicAlice);

    console.log(`isValidMnemonic: ${isValidMnemonic}`);

    // Create valid Substrate-compatible seed from mnemonic
    const seedAlice = mnemonicToMiniSecret(mnemonicAlice);

    // Generate new public/secret keypair for Alice from the supplied seed
    const { publicKey, secretKey } = ed25519PairFromSeed(seedAlice);
    const keyring = new Keyring({ type: "sr25519" });
    const account = keyring.addFromUri(mnemonicAlice);
    console.log(`Account Address: ${account.address}`);

    return account;
}

/**
 * Submitting data to Avail as a transaction with retry logic.
 *
 * @param availApi api instance
 * @param data payload to send
 * @param account that is sending transaction
 * @param maxRetries maximum number of retries
 * @returns {Promise&lt;unknown&gt;}
 */
export async function submitData(availApi, data, account, maxRetries = 3) {
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
        try {
            console.log("Submitting Data...");
            const chain = await availApi.rpc.system.chain();
            const lastHeader = await availApi.rpc.chain.getHeader();
            console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);

            let submit = await availApi.tx.dataAvailability.submitData(data);
            console.log(`Submit = ${submit}`);

            console.log("Send Tx...");
            const result = await sendTx(availApi, account, submit);
            return result;
        } catch (error) {
            lastError = error;
            console.error(`Error in submitData attempt ${attempt + 1}:`, error);

            // Check if the error is related to BadProof and should be retried
            if (error.message.includes("Invalid Transaction: Transaction has a bad signature")) {
                console.log("Bad signature detected, retrying...");
                attempt++;
                await new Promise((resolve) => setTimeout(resolve, 2000)); // wait for 2 seconds before retrying
            } else {
                throw error; // rethrow if the error is not related to BadProof
            }
        }
    }

    throw new Error(`Failed to submit data after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Sending dispatch data root transaction.
 *
 * @param availApi api instance
 * @param blockHash hash of the block
 * @param account sending transaction
 * @returns {Promise<unknown>}
 */
async function dispatchDataRoot(availApi, blockHash, account) {
    const destinationDomain = process.env.DESTINATION_DOMAIN;
    const bridgeRouterEthAddress = process.env.DA_BRIDGE_ADDRESS;
    const header = await availApi.rpc.chain.getHeader(blockHash);
    console.log(`Block Number: ${header.number}`);
    console.log(`State Root: ${header.stateRoot}`);
    let tx = await availApi.tx.nomadDABridge.tryDispatchDataRoot(
        destinationDomain,
        bridgeRouterEthAddress,
        header,
    );
    return await sendTx(availApi, account, tx);
}

/**
 * Returns data root for the particular block.
 *
 * @param availApi api instance
 * @param blockHash hash of the block
 * @returns {Promise<(*)[]>}
 */
export async function getDataRoot(availApi, blockHash) {
    const header = JSON.parse(await availApi.rpc.chain.getHeader(blockHash));
    console.log(`dataRoot = ${JSON.stringify(header)}`);
    return [header.extension.v2.commitment.dataRoot, header.number];
}

/**
 * Dispatching data root will trigger an optimistic bridge which will bridge the data root to the Ethereum network.
 * Since the bridge is optimistic, it is necessary to wait for 30 minutes before the data root is available on Ethereum.
 */
export async function dataRootDispatch() {
    try {
        const availApi = await createApi(process.env.AVAIL_RPC);
        const keyring = new Keyring({
            type: "sr25519",
        });
        const account = keyring.addFromMnemonic(process.env.SURI);
        //const account = await generateAccount();

        console.log(`Account address: ${account.address}`);
        console.log(`Account details: ${JSON.stringify(account)}`);

        console.log("Submitting data to Avail...");
        let result = await submitData(availApi, "0", account);

        console.log("Data Submitted!");
        const txIndex = result.events[0].phase.toHuman().applyExtrinsic;
        const blockHash = result.status.asInBlock;

        console.log(
            `Transaction: ${result.txHash}. Block hash: ${blockHash}. Transaction index: ${txIndex}.`,
        );

        await availApi.disconnect();
    } catch (error) {
        console.error("Error in dataRootDispatch:", error);
        process.exit(1);
    }
}
