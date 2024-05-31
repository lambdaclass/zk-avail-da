import { submitDataAndVerify } from "./validium.ts";

const data = Deno.args[0];

if (data) {
  await submitDataAndVerify(data);
} else {
  console.error("No data provided");
  Deno.exit(1);
}
