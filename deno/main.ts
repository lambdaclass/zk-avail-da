import { getPubdata } from "./da_manager.ts";
import { submitDataAndVerify } from "./validium.ts";

const RETRIES = 0;
const L2_URL = "http://localhost:3050";
const data = Deno.args[0];

if (data) {
  await submitDataAndVerify(data);
} else {
  console.error("Getting pubdata from ZKSync Era...");
  getPubdata(L2_URL, RETRIES).then(async (result) => {
    for (const batch of result) {
      await submitDataAndVerify(batch);
    }
  }).catch((error) => {
    console.error(error);
  });
}
