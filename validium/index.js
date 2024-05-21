import Keyring from "@polkadot/keyring";
import { createApi } from "./common.js";
import { generateAccount, getDataRoot, submitData } from "./submitData.js";

const availApi = await createApi("ws://127.0.0.1:9944");
const dataRoot = await getDataRoot(availApi, "0xc768531d0dd3003ecea3a9668bd2e792daacf45f24210a238fe879d2b995267a")
//console.log(dataRoot)

console.log("Submitting data to Avail...");
const keyring = new Keyring({
    type: "sr25519",
});
// const account = keyring.addFromMnemonic(process.env.SURI);
const account = await generateAccount();
let result = await submitData(availApi, "0", account);

await availApi.disconnect();
