import Keyring from "@polkadot/keyring";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";

async function main() {
    dotenv.config();
    const wsProvider = new WsProvider("wss://turing-rpc.avail.so/ws");
    const api = await ApiPromise.create({ provider: wsProvider });

    const keyring = new Keyring({ type: "sr25519" });
    const accountJson = JSON.parse(readFileSync(`account.json`, "utf8"));
    const password = process.env.ACCOUNT_PASSWORD;
    const account = keyring.addFromJson(accountJson);
    account.unlock(password);

    const transfer = api.tx.balances.transfer(
        "5CK5iPZwjuos9szMbqP3RPSfeHxGJ7SCUe4FkWovH4EHy852",
        1,
    );
    const hash = await transfer.signAndSend(account);

    console.log("Transfer sent with hash", hash.toHex());

    await api.disconnect();
}

main().catch(console.error);
