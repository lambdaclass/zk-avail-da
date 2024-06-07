import { initializeAvailApi } from "./helpers.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

const AVAIL_RPC = env["AVAIL_RPC"];

function writeJson(path: string, data: object): string {
    try {
      Deno.writeTextFileSync(path, JSON.stringify(data));
      return "Written to " + path;
    } catch (e) {
      return e.message;
    }
}

export async function getPubdata(hash: string) {
    const availApi = await initializeAvailApi(AVAIL_RPC);
    const rows = await availApi.rpc.kate.queryRows([0], hash);
    const data = rows.toHuman();
    const fileName = `./pubdata/${hash}.json`;
    console.log(writeJson(fileName, data));
    await availApi.disconnect();
}

getPubdata(Deno.args[0]);
