import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import {
  getPubdata,
  ProofData,
  submitDataAndVerify,
  SubmitDataHash,
  verifyProof,
} from "./validium.ts";
import { pubdataTest } from "./pubdata_test.ts";

const env = await load();

Deno.test("Load environment variables", () => {
  assert(env["AVAIL_RPC"], "AVAIL_RPC should be defined");
  assert(env["SURI"], "SURI should be defined");
  assert(env["DA_BRIDGE_ADDRESS"], "DA_BRIDGE_ADDRESS should be defined");
  assert(env["BRIDGE_API_URL"], "BRIDGE_API_URL should be defined");
  assert(env["ETH_PROVIDER_URL"], "ETH_PROVIDER_URL should be defined");
});

Deno.test("verifyBlobLeaf function should return expected result", async () => {
  const proof = {
    blobRoot:
      "0xe882a0dd840cc7b99d5f9ff05216be547c7b7d84a61d474353c4d9cb90cb2cdd",
    blockHash:
      "0x098913259fd804a4fc099bca18a282aa3b4acdcf8595f046c88ad2c32a39c5cd",
    bridgeRoot:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    dataRoot:
      "0xc594c597a49d7d608046468659a620e95c40f468aa66a8f710f92d20354e516e",
    dataRootCommitment:
      "0xb18829981dcd52b8be89ef98710c368e42df8b8b0c40f6821a7d6664df95c7b1",
    dataRootIndex: 330,
    dataRootProof: [
      "0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5",
      "0x51f84e7279cdf6acb81af77aec64f618f71029b7d9c6d37c035c37134e517af2",
      "0x69c8458dd62d27ea9abd40586ce53e5220d43b626c27f76468a57e94347f0d6b",
      "0x5a021e65ea5c6b76469b68db28c7a390836e22c21c6f95cdef4d3408eb6b8050",
      "0xa1429d3a87eb7256ed951754887563a0d64860c488541a6e9d4fab2687e30658",
      "0x581917d68bc08c4bda58fd492853042405b7d8eed3d2a7ab1ce3f0fb809d5628",
      "0x5b3c944f3400756edc1240bab5697868f66286991d7d247f1e3aa34db112a1a8",
      "0x87eb0ddba57e35f6d286673802a4af5975e22506c7cf4c64bb6be5ee11527f2c",
      "0xd93c5dfd527804b9d15c90e01c8c1296ad6d30fd1b5d1ce5afd197f3e9b9c061",
    ],
    leaf: "0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb",
    leafIndex: 0,
    leafProof: [],
    message: null,
    rangeHash:
      "0xfbab0eb809f03a99ee5dcca7f4131b6b8a8b56eccbee8f439cd33145d2d14e1d",
  };

  const proofData: ProofData = {
    dataRootProof: proof.dataRootProof,
    leafProof: proof.leafProof,
    rangeHash: proof.rangeHash,
    dataRootIndex: proof.dataRootIndex,
    blobRoot: proof.blobRoot,
    bridgeRoot: proof.bridgeRoot,
    leaf: proof.leaf,
    leafIndex: proof.leafIndex,
  };
  const isVerified = await verifyProof(proofData);
  const expectedValue = true;
  assertEquals(isVerified, expectedValue);
});

const resultHashes: SubmitDataHash[] = [];
let isSubmitDataAndVerifyDone = false;

Deno.test({
  name: "submitDataAndVerify",
  async fn() {
    for (const batch of pubdataTest) {
      resultHashes.push(await submitDataAndVerify(batch));
    }
    console.log(resultHashes);
    isSubmitDataAndVerifyDone = true;
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "getPubdata function should return expected pubdata",
  async fn() {
    while (!isSubmitDataAndVerifyDone) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    let index = 0;
    for (const hash of resultHashes) {
      const result = await getPubdata(hash.txHash, hash.blockHash);
      assertEquals(result, pubdataTest[index]);
      index++;
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
