export async function getBatchPubdata(
  url: string,
  batchNumber: number,
): Promise<string> {
  const headers = { "Content-Type": "application/json" };
  const data = {
    jsonrpc: "2.0",
    id: 1,
    method: "zks_getBatchPubdata",
    params: [batchNumber],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.result;
  } catch (error) {
    console.error("Error fetching batch pubdata:", error);
    throw error;
  }
}

export async function getPubdata(
  url: string,
  retries: number,
): Promise<string[]> {
  const storedPubdata: Record<number, string> = {};
  let numRetries = 0;
  let startingBatchId = 1;

  console.log(`Starting from batch #${startingBatchId}`);

  while (true) {
    try {
      const l1BatchPubdata = await getBatchPubdata(url, startingBatchId);
      if (l1BatchPubdata.length <= 2) {
        if (numRetries >= retries) break;
        console.log(`Failed to get batch #${startingBatchId} pubdata`);
        console.log("Retrying in 60 seconds");
        await new Promise((resolve) => setTimeout(resolve, 60000));
        numRetries += 1;
        continue;
      } else {
        storedPubdata[startingBatchId] = l1BatchPubdata;
        console.log(`Got batch #${startingBatchId} pubdata`);
        startingBatchId += 1;
        numRetries = 0; // Reset retries counter on success
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error("Error in main loop:", error);
      break;
    }
  }

  return Object.values(storedPubdata);
}
