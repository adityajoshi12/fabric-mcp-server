import { FabricClient } from "../fabric-client.js";

export async function getInstalledChaincodes(client: FabricClient) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract("lscc");

  const result = await contract.evaluateTransaction("getchaincodes");

  return {
    content: [
      {
        type: "text" as const,
        text: `Chaincodes on channel (${result.length} bytes): ${result.toString("base64")}`,
      },
    ],
  };
}

export async function getApprovedChaincode(client: FabricClient, args: any) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract("lscc");

  const result = await contract.evaluateTransaction(
    "getccdata",
    config.channelName,
    args.chaincodeName
  );

  return {
    content: [
      {
        type: "text" as const,
        text: `Chaincode data for "${args.chaincodeName}" (${result.length} bytes): ${result.toString("base64") || "Not found"}`,
      },
    ],
  };
}

export async function getCommittedChaincode(client: FabricClient, args: any) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract("qscc");

  const result = await contract.evaluateTransaction(
    "GetChaincodeDefinitionResult",
    config.channelName,
    args.chaincodeName
  );

  return {
    content: [
      {
        type: "text" as const,
        text: `Committed chaincode "${args.chaincodeName}" (${result.length} bytes): ${result.toString("base64") || "Not found"}`,
      },
    ],
  };
}

export async function checkCommitReadiness(client: FabricClient, args: any) {
  const gateway = client.getGateway();
  if (!gateway) throw new Error("Not connected to Fabric");

  const config = client.getConfig();
  const network = await gateway.getNetwork(config.channelName);
  const contract = network.getContract("lscc");

  try {
    const result = await contract.evaluateTransaction(
      "getccdata",
      config.channelName,
      args.chaincodeName
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Chaincode "${args.chaincodeName}" exists on channel. Data (${result.length} bytes): ${result.toString("base64")}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Chaincode "${args.chaincodeName}" v${args.version} (sequence ${args.sequence}): Not found or not committed`,
        },
      ],
    };
  }
}

