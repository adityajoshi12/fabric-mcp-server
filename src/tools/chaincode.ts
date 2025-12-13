import { FabricClient } from "../fabric-client.js";

export async function invokeChaincode(client: FabricClient, args: any) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract(config.chaincodeName);

  const result = await contract.submitTransaction(args.function, ...args.args);

  return {
    content: [
      {
        type: "text" as const,
        text: `Transaction submitted successfully. Result: ${result.toString()}`,
      },
    ],
  };
}

export async function queryChaincode(client: FabricClient, args: any) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract(config.chaincodeName);

  const result = await contract.evaluateTransaction(args.function, ...args.args);

  return {
    content: [
      {
        type: "text" as const,
        text: result.toString(),
      },
    ],
  };
}

export async function getTransactionHistory(client: FabricClient, args: any) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract(config.chaincodeName);

  const result = await contract.evaluateTransaction("GetAssetHistory", args.assetId);

  return {
    content: [
      {
        type: "text" as const,
        text: result.toString(),
      },
    ],
  };
}

