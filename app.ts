#!/usr/bin/env node
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Gateway, Wallets, X509Identity } from "fabric-network";
import * as path from "path";
import * as fs from "fs";

interface FabricConfig {
  channelName: string;
  chaincodeName: string;
  mspId: string;
  walletPath: string;
  connectionProfilePath: string;
  userId: string;
}

class FabricMCPServer {
  private server: Server;
  private config: FabricConfig;
  private gateway: Gateway | null = null;

  constructor() {
    this.server = new Server(
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

    this.config = this.loadConfig();
    this.setupHandlers();
  }

  private loadConfig(): FabricConfig {
    return {
      channelName: process.env.FABRIC_CHANNEL || "mychannel",
      chaincodeName: process.env.FABRIC_CHAINCODE || "basic",
      mspId: process.env.FABRIC_MSP_ID || "Org1MSP",
      walletPath: process.env.FABRIC_WALLET_PATH || path.join(__dirname, "wallet"),
      connectionProfilePath: process.env.FABRIC_CONNECTION_PROFILE || path.join(__dirname, "connection-profile.json"),
      userId: process.env.FABRIC_USER_ID || "appUser",
    };
  }

  private async connectToFabric(): Promise<void> {
    if (this.gateway) return;

    try {
      const wallet = await Wallets.newFileSystemWallet(this.config.walletPath);
      const identity = await wallet.get(this.config.userId);

      if (!identity) {
        throw new Error(`Identity ${this.config.userId} not found in wallet`);
      }

      const connectionProfile = JSON.parse(
        fs.readFileSync(this.config.connectionProfilePath, "utf8")
      );

      this.gateway = new Gateway();
      await this.gateway.connect(connectionProfile, {
        wallet,
        identity: this.config.userId,
        discovery: { enabled: true, asLocalhost: true },
      });
    } catch (error) {
      throw new Error(`Failed to connect to Fabric: ${error}`);
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "invoke_chaincode",
          description: "Invoke a transaction on the Hyperledger Fabric chaincode",
          inputSchema: {
            type: "object",
            properties: {
              function: {
                type: "string",
                description: "The chaincode function to invoke",
              },
              args: {
                type: "array",
                items: { type: "string" },
                description: "Arguments to pass to the chaincode function",
              },
            },
            required: ["function", "args"],
          },
        },
        {
          name: "query_chaincode",
          description: "Query the Hyperledger Fabric chaincode (read-only)",
          inputSchema: {
            type: "object",
            properties: {
              function: {
                type: "string",
                description: "The chaincode function to query",
              },
              args: {
                type: "array",
                items: { type: "string" },
                description: "Arguments to pass to the chaincode function",
              },
            },
            required: ["function", "args"],
          },
        },
        {
          name: "get_transaction_history",
          description: "Get the transaction history for a specific asset",
          inputSchema: {
            type: "object",
            properties: {
              assetId: {
                type: "string",
                description: "The ID of the asset to get history for",
              },
            },
            required: ["assetId"],
          },
        },
        {
          name: "get_block_info",
          description: "Get information about a specific block",
          inputSchema: {
            type: "object",
            properties: {
              blockNumber: {
                type: "number",
                description: "The block number to retrieve",
              },
            },
            required: ["blockNumber"],
          },
        },
        {
          name: "get_blockchain_info",
          description: "Get blockchain information including total block count, current block hash, and previous block hash",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "list_enrolled_identities",
          description: "List all identities enrolled in the wallet",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        await this.connectToFabric();

        switch (request.params.name) {
          case "invoke_chaincode":
            return await this.invokeChaincode(request.params.arguments);

          case "query_chaincode":
            return await this.queryChaincode(request.params.arguments);

          case "get_transaction_history":
            return await this.getTransactionHistory(request.params.arguments);

          case "get_block_info":
            return await this.getBlockInfo(request.params.arguments);

          case "get_blockchain_info":
            return await this.getBlockchainInfo();

          case "list_enrolled_identities":
            return await this.listEnrolledIdentities();

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async invokeChaincode(args: any) {
    if (!this.gateway) throw new Error("Not connected to Fabric");

    const network = await this.gateway.getNetwork(this.config.channelName);
    const contract = network.getContract(this.config.chaincodeName);

    const result = await contract.submitTransaction(
      args.function,
      ...args.args
    );

    return {
      content: [
        {
          type: "text",
          text: `Transaction submitted successfully. Result: ${result.toString()}`,
        },
      ],
    };
  }

  private async queryChaincode(args: any) {
    if (!this.gateway) throw new Error("Not connected to Fabric");

    const network = await this.gateway.getNetwork(this.config.channelName);
    const contract = network.getContract(this.config.chaincodeName);

    const result = await contract.evaluateTransaction(
      args.function,
      ...args.args
    );

    return {
      content: [
        {
          type: "text",
          text: result.toString(),
        },
      ],
    };
  }

  private async getTransactionHistory(args: any) {
    if (!this.gateway) throw new Error("Not connected to Fabric");

    const network = await this.gateway.getNetwork(this.config.channelName);
    const contract = network.getContract(this.config.chaincodeName);

    const result = await contract.evaluateTransaction(
      "GetAssetHistory",
      args.assetId
    );

    return {
      content: [
        {
          type: "text",
          text: result.toString(),
        },
      ],
    };
  }

  private async getBlockInfo(args: any) {
    if (!this.gateway) throw new Error("Not connected to Fabric");

    const network = await this.gateway.getNetwork(this.config.channelName);
    // Use QSCC (Query System Chaincode) to query block information
    const contract = network.getContract("qscc");
    
    const result = await contract.evaluateTransaction(
      "GetBlockByNumber",
      this.config.channelName,
      args.blockNumber.toString()
    );

    return {
      content: [
        {
          type: "text",
          text: `Block ${args.blockNumber} data (${result.length} bytes): ${result.toString("base64")}`,
        },
      ],
    };
  }

  private async getBlockchainInfo() {
    if (!this.gateway) throw new Error("Not connected to Fabric");

    const network = await this.gateway.getNetwork(this.config.channelName);
    // Use QSCC (Query System Chaincode) to get chain info
    const contract = network.getContract("qscc");

    const result = await contract.evaluateTransaction(
      "GetChainInfo",
      this.config.channelName
    );

    return {
      content: [
        {
          type: "text",
          text: `Blockchain info (${result.length} bytes): ${result.toString("base64")}`,
        },
      ],
    };
  }

  private async listEnrolledIdentities() {
    const wallet = await Wallets.newFileSystemWallet(this.config.walletPath);
    const identities = await wallet.list();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(identities, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Hyperledger Fabric MCP server running on stdio");
  }

  async cleanup() {
    if (this.gateway) {
      this.gateway.disconnect();
    }
  }
}

const server = new FabricMCPServer();

process.on("SIGINT", async () => {
  await server.cleanup();
  process.exit(0);
});

server.run().catch(console.error);