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

async function generateAccount() {
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
 * Submitting data to Avail as a transaction.
 *
 * @param availApi api instance
 * @param data payload to send
 * @param account that is sending transaction
 * @returns {Promise<unknown>}
 */
async function submitData(availApi, data, account) {
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
        console.error("Error in submitData:", error);
        throw error;
    }
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
async function getDataRoot(availApi, blockHash) {
    const header = JSON.parse(await availApi.rpc.chain.getHeader(blockHash));
    return [header.extension.v1.commitment.dataRoot, header.number];
}

/**
 * Dispatching data root will trigger an optimistic bridge which will bridge the data root to the Ethereum network.
 * Since the bridge is optimistic, it is necessary to wait for 30 minutes before the data root is available on Ethereum.
 */
(async function dataRootDispatch() {
    try {
        const availApi = await createApi(process.env.AVAIL_RPC);
        // const keyring = new Keyring({
        //     type: "sr25519",
        // });
        // const account = keyring.addFromMnemonic(process.env.SURI);
        // console.log("Submitting data to Avail...");
        const account = await generateAccount();

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
})()
    .then(() => {
        console.log("Done");
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
