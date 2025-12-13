import { FabricClient } from "../fabric-client.js";

export async function listChannels(client: FabricClient) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract("cscc");

  const result = await contract.evaluateTransaction("GetChannels");

  return {
    content: [
      {
        type: "text" as const,
        text: `Channels: ${result.toString() || "No channels found"}`,
      },
    ],
  };
}

export async function getChannelInfo(client: FabricClient, args: any) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const channelName = args.channelName || config.channelName;
  const network = await gateway.getNetwork(channelName);
  const contract = network.getContract("qscc");

  const result = await contract.evaluateTransaction("GetChainInfo", channelName);

  return {
    content: [
      {
        type: "text" as const,
        text: `Channel "${channelName}" info (${result.length} bytes): ${result.toString("base64")}`,
      },
    ],
  };
}

