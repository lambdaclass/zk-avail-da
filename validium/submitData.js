import { Keyring } from "@polkadot/api";
import * as dotenv from "dotenv";
import { createApi, sendTx } from "./common.js";

dotenv.config();

/**
 * Submitting data to Avail as a transaction.
 *
 * @param availApi api instance
 * @param data payload to send
 * @param account that is sending transaction
 * @returns {Promise<unknown>}
 */
async function submitData(availApi, data, account) {
    console.log("Submitting Data...");
    // Retrieve the chain name
    const chain = await availApi.rpc.system.chain();
    console.log(`rpc chain = ${chain}`);
    // Retrieve the latest header
    const lastHeader = await availApi.rpc.chain.getHeader();

    // Log the information
    console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
    let submit = await availApi.tx.dataAvailability.submitData(data);
    return await sendTx(availApi, account, submit);
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
    const availApi = await createApi(process.env.AVAIL_RPC);
    const keyring = new Keyring({
        type: "sr25519",
    });
    const account = keyring.addFromMnemonic(process.env.SURI);
    console.log("Submitting data to Avail...");

    let result = await submitData(availApi, "0", account);
    console.log("Data Submitted!");

    const txIndex = JSON.parse(result.events[0].phase).applyExtrinsic;
    const blockHash = result.status.asInBlock;
    console.log(
        `Transaction: ${result.txHash}. Block hash: ${blockHash}. Transaction index: ${txIndex}.`,
    );

    console.log("Triggering Home...");
    result = await dispatchDataRoot(availApi, blockHash, account);
    console.log(`Sent txn on Avail. Txn Hash: ${result.txHash}.`);
    let [root, blockNum] = await getDataRoot(availApi, blockHash);
    console.log("Data Root:" + root + " and Block number: " + blockNum);

    await availApi.disconnect();
})()
    .then(() => {
        console.log("Done");
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
