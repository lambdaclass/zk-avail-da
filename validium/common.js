import { ApiPromise, WsProvider } from "@polkadot/api";

/**
 * Creates api instance.
 *
 * @param url websocket address
 */
export async function createApi(url) {
    const provider = new WsProvider(url);
    return ApiPromise.create({
        provider,
        rpc: {
            kate: {
                blockLength: {
                    description: "Get Block Length",
                    params: [
                        {
                            name: "at",
                            type: "Hash",
                            isOptional: true,
                        },
                    ],
                    type: "BlockLength",
                },
                queryProof: {
                    description: "Generate the kate proof for the given `cells`",
                    params: [
                        {
                            name: "cells",
                            type: "Vec<Cell>",
                        },
                        {
                            name: "at",
                            type: "Hash",
                            isOptional: true,
                        },
                    ],
                    type: "Vec<u8>",
                },
                queryDataProof: {
                    description: "Generate the data proof for the given `index`",
                    params: [
                        {
                            name: "data_index",
                            type: "u32",
                        },
                        {
                            name: "at",
                            type: "Hash",
                            isOptional: true,
                        },
                    ],
                    type: "DataProof",
                },
                queryDataProofV2: {
                    description: "Generate the data proof for the given `transaction_index`",
                    params: [
                        {
                            name: "transaction_index",
                            type: "u32",
                        },
                        {
                            name: "at",
                            type: "Hash",
                            isOptional: true,
                        },
                    ],
                    type: "ProofResponse",
                },
                queryAppData: {
                    description: "Fetches app data rows for the given app",
                    params: [
                        {
                            name: "app_id",
                            type: "AppId",
                        },
                        {
                            name: "at",
                            type: "Hash",
                            isOptional: true,
                        },
                    ],
                    type: "Vec<Option<Vec<u8>>>",
                },
                queryRows: {
                    description: "Query rows based on their indices",
                    params: [
                        {
                            name: "rows",
                            type: "Vec<u32>",
                        },
                        {
                            name: "at",
                            type: "Hash",
                            isOptional: true,
                        },
                    ],
                    type: "Vec<Vec<u8>>",
                },
            },
        },
        types: {
            AppId: "Compact<u32>",
            DataProofV2: {
                dataRoot: "H256",
                blobRoot: "H256",
                bridgeRoot: "H256",
                proof: "Vec<H256>",
                numberOfLeaves: "Compact<u32>",
                leafIndex: "Compact<u32>",
                leaf: "H256",
            },
            DaHeader: {
                parentHash: "Hash",
                number: "Compact<BlockNumber>",
                stateRoot: "Hash",
                extrinsicsRoot: "Hash",
                digest: "Digest",
                extension: "HeaderExtension",
            },
            Message: {
                messageType: "MessageType",
                from: "H256",
                to: "H256",
                originDomain: "u32",
                destinationDomain: "u32",
                data: "Vec<u8>",
                id: "u64",
            },
            MessageType: {
                _enum: ["ArbitraryMessage", "FungibleToken"],
            },
            ProofResponse: {
                dataProof: "DataProofV2",
                message: "Option<Message>",
            },
            DataLookupIndexItem: {
                appId: "AppId",
                start: "Compact<u32>",
            },
            DataLookup: {
                size: "Compact<u32>",
                index: "Vec<DataLookupIndexItem>",
            },
            KateCommitment: {
                rows: "Compact<u16>",
                cols: "Compact<u16>",
                dataRoot: "H256",
                commitment: "Vec<u8>",
            },
            V1HeaderExtension: {
                commitment: "KateCommitment",
                appLookup: "DataLookup",
            },
            VTHeaderExtension: {
                newField: "Vec<u8>",
                commitment: "KateCommitment",
                appLookup: "DataLookup",
            },
            HeaderExtension: {
                _enum: {
                    V1: "V1HeaderExtension",
                    V2: "V1HeaderExtension",
                    V3: "V1HeaderExtension",
                    VTest: "VTHeaderExtension",
                },
            },
            DaHeader: {
                parentHash: "Hash",
                number: "Compact<BlockNumber>",
                stateRoot: "Hash",
                extrinsicsRoot: "Hash",
                digest: "Digest",
                extension: "HeaderExtension",
            },
            Header: "DaHeader",
            CheckAppIdExtra: {
                appId: "AppId",
            },
            CheckAppIdTypes: {},
            CheckAppId: {
                extra: "CheckAppIdExtra",
                types: "CheckAppIdTypes",
            },
            DataProof: {
                root: "H256",
                proof: "Vec<H256>",
                numberOfLeaves: "Compact<u32>",
                leaf_index: "Compact<u32>",
                leaf: "H256",
            },
            Cell: {
                row: "u32",
                col: "u32",
            },
        },
        BlockLength: {
            max: "PerDispatchClass",
            cols: "Compact<u32>",
            rows: "Compact<u32>",
            chunkSize: "Compact<u32>",
        },
        PerDispatchClass: {
            normal: "u32",
            operational: "u32",
            mandatory: "u32",
        },
        signedExtensions: {
            CheckAppId: {
                extrinsic: {
                    appId: "AppId",
                },
                payload: {},
            },
        },
    });
}

/**
 * Sends transaction to Avail.
 *
 * @param api instance of the api
 * @param account sending the transaction
 * @param tx transaction
 */
export async function sendTx(api, sender, tx) {
    return new Promise(async (resolve) => {
        try {
            const res = await tx.signAndSend(sender, (result) => {
                if (result.status.isReady) {
                    console.log(`Txn has been sent to the mempool`);
                }
                if (result.status.isInBlock) {
                    console.log(`Tx hash: ${result.txHash} is in block ${result.status.asInBlock}`);
                    res();
                    resolve(result);
                }
            });
        } catch (e) {
            console.log(e);
            process.exit(1);
        }
    });
}
