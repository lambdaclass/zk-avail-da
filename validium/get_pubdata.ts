import { getPubdata } from "./validium.ts";

await getPubdata(Deno.args[0], Deno.args[1]);
