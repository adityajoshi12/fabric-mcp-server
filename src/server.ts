import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";
import { FabricClient } from "./fabric-client.js";
import {
  invokeChaincode,
  queryChaincode,
  getTransactionHistory,
  getBlockInfo,
  getBlockchainInfo,
  getInstalledChaincodes,
  getApprovedChaincode,
  getCommittedChaincode,
  checkCommitReadiness,
  listChannels,
  getChannelInfo,
  listEnrolledIdentities,
} from "./tools/index.js";

export function createMCPServer(fabricClient: FabricClient): McpServer {
  const server = new McpServer(
    {
      name: "hyperledger-fabric-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register invoke_chaincode tool
  server.registerTool(
    "invoke_chaincode",
    {
      description: "Invoke a transaction on the Hyperledger Fabric chaincode",
      inputSchema: {
        function: z.string().describe("The chaincode function to invoke"),
        args: z.array(z.string()).describe("Arguments to pass to the chaincode function"),
      },
    },
    async ({ function: fn, args }) => {
      await fabricClient.connect();
      return await invokeChaincode(fabricClient, { function: fn, args });
    }
  );

  // Register query_chaincode tool
  server.registerTool(
    "query_chaincode",
    {
      description: "Query the Hyperledger Fabric chaincode (read-only)",
      inputSchema: {
        function: z.string().describe("The chaincode function to query"),
        args: z.array(z.string()).describe("Arguments to pass to the chaincode function"),
      },
    },
    async ({ function: fn, args }) => {
      await fabricClient.connect();
      return await queryChaincode(fabricClient, { function: fn, args });
    }
  );

  // Register get_transaction_history tool
  server.registerTool(
    "get_transaction_history",
    {
      description: "Get the transaction history for a specific asset",
      inputSchema: {
        assetId: z.string().describe("The ID of the asset to get history for"),
      },
    },
    async ({ assetId }) => {
      await fabricClient.connect();
      return await getTransactionHistory(fabricClient, { assetId });
    }
  );

  // Register get_block_info tool
  server.registerTool(
    "get_block_info",
    {
      description: "Get information about a specific block",
      inputSchema: {
        blockNumber: z.number().describe("The block number to retrieve"),
      },
    },
    async ({ blockNumber }) => {
      await fabricClient.connect();
      return await getBlockInfo(fabricClient, { blockNumber });
    }
  );

  // Register get_blockchain_info tool
  server.registerTool(
    "get_blockchain_info",
    {
      description: "Get blockchain information including total block count, current block hash, and previous block hash",
      inputSchema: {},
    },
    async () => {
      await fabricClient.connect();
      return await getBlockchainInfo(fabricClient);
    }
  );

  // Register list_enrolled_identities tool
  server.registerTool(
    "list_enrolled_identities",
    {
      description: "List all identities enrolled in the wallet",
      inputSchema: {},
    },
    async () => {
      await fabricClient.connect();
      return await listEnrolledIdentities(fabricClient);
    }
  );

  // Register get_installed_chaincodes tool
  server.registerTool(
    "get_installed_chaincodes",
    {
      description: "Get list of chaincodes installed on the peer",
      inputSchema: {},
    },
    async () => {
      await fabricClient.connect();
      return await getInstalledChaincodes(fabricClient);
    }
  );

  // Register get_approved_chaincode tool
  server.registerTool(
    "get_approved_chaincode",
    {
      description: "Get the approved chaincode definition for an organization",
      inputSchema: {
        chaincodeName: z.string().describe("The name of the chaincode to query"),
      },
    },
    async ({ chaincodeName }) => {
      await fabricClient.connect();
      return await getApprovedChaincode(fabricClient, { chaincodeName });
    }
  );

  // Register get_committed_chaincode tool
  server.registerTool(
    "get_committed_chaincode",
    {
      description: "Get the committed chaincode definition on the channel",
      inputSchema: {
        chaincodeName: z.string().describe("The name of the chaincode to query"),
      },
    },
    async ({ chaincodeName }) => {
      await fabricClient.connect();
      return await getCommittedChaincode(fabricClient, { chaincodeName });
    }
  );

  // Register check_commit_readiness tool
  server.registerTool(
    "check_commit_readiness",
    {
      description: "Check if a chaincode definition is ready to be committed",
      inputSchema: {
        chaincodeName: z.string().describe("The name of the chaincode"),
        sequence: z.number().describe("The sequence number of the chaincode definition"),
        version: z.string().describe("The version of the chaincode"),
      },
    },
    async ({ chaincodeName, sequence, version }) => {
      await fabricClient.connect();
      return await checkCommitReadiness(fabricClient, { chaincodeName, sequence, version });
    }
  );

  // Register list_channels tool
  server.registerTool(
    "list_channels",
    {
      description: "List all channels the peer has joined",
      inputSchema: {},
    },
    async () => {
      await fabricClient.connect();
      return await listChannels(fabricClient);
    }
  );

  // Register get_channel_info tool
  server.registerTool(
    "get_channel_info",
    {
      description: "Get information about a specific channel",
      inputSchema: {
        channelName: z.string().describe("The name of the channel"),
      },
    },
    async ({ channelName }) => {
      await fabricClient.connect();
      return await getChannelInfo(fabricClient, { channelName });
    }
  );

  return server;
}
