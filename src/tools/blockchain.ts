import { FabricClient } from "../fabric-client.js";

export async function getBlockInfo(client: FabricClient, args: any) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract("qscc");

  const result = await contract.evaluateTransaction(
    "GetBlockByNumber",
    config.channelName,
    args.blockNumber.toString()
  );

  return {
    content: [
      {
        type: "text" as const,
        text: `Block ${args.blockNumber} data (${result.length} bytes): ${result.toString("base64")}`,
      },
    ],
  };
}

export async function getBlockchainInfo(client: FabricClient) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract("qscc");

  const result = await contract.evaluateTransaction("GetChainInfo", config.channelName);

  return {
    content: [
      {
        type: "text" as const,
        text: `Blockchain info (${result.length} bytes): ${result.toString("base64")}`,
      },
    ],
  };
}

