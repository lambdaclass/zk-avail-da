import {
  ApiPromise,
  Keyring,
  WsProvider,
} from "https://deno.land/x/polkadot@0.2.45/api/mod.ts";
import { API_EXTENSIONS, API_RPC, API_TYPES } from "./api_options.ts";
import { KeyringPair } from "https://deno.land/x/polkadot@0.2.45/keyring/types.ts";

export function initializeAvailApi(availRpc: string): Promise<ApiPromise> {
  return ApiPromise.create({
    provider: new WsProvider(availRpc),
    rpc: API_RPC,
    types: API_TYPES,
    signedExtensions: API_EXTENSIONS,
  });
}

export function createAccount(suri: string): KeyringPair {
  return new Keyring({ type: "sr25519" }).addFromUri(suri);
}

export function writeJson(path: string, data: string): string {
  try {
    Deno.writeTextFileSync(path, JSON.stringify(data));
    return "Written to " + path;
  } catch (e) {
    return e.message;
  }
}
