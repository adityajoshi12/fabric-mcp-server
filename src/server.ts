import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { FabricClient } from "./fabric-client.js";
import {
  toolDefinitions,
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

export function createMCPServer(fabricClient: FabricClient): Server {
  const server = new Server(
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

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolDefinitions,
  }));

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
    try {
      await fabricClient.connect();

      switch (request.params.name) {
        case "invoke_chaincode":
          return await invokeChaincode(fabricClient, request.params.arguments);

        case "query_chaincode":
          return await queryChaincode(fabricClient, request.params.arguments);

        case "get_transaction_history":
          return await getTransactionHistory(fabricClient, request.params.arguments);

        case "get_block_info":
          return await getBlockInfo(fabricClient, request.params.arguments);

        case "get_blockchain_info":
          return await getBlockchainInfo(fabricClient);

        case "list_enrolled_identities":
          return await listEnrolledIdentities(fabricClient);

        case "get_installed_chaincodes":
          return await getInstalledChaincodes(fabricClient);

        case "get_approved_chaincode":
          return await getApprovedChaincode(fabricClient, request.params.arguments);

        case "get_committed_chaincode":
          return await getCommittedChaincode(fabricClient, request.params.arguments);

        case "check_commit_readiness":
          return await checkCommitReadiness(fabricClient, request.params.arguments);

        case "list_channels":
          return await listChannels(fabricClient);

        case "get_channel_info":
          return await getChannelInfo(fabricClient, request.params.arguments);

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  });

  return server;
}

