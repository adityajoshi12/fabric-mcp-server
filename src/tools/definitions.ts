export const toolDefinitions = [
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
  {
    name: "get_installed_chaincodes",
    description: "Get list of chaincodes installed on the peer",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_approved_chaincode",
    description: "Get the approved chaincode definition for an organization",
    inputSchema: {
      type: "object",
      properties: {
        chaincodeName: {
          type: "string",
          description: "The name of the chaincode to query",
        },
      },
      required: ["chaincodeName"],
    },
  },
  {
    name: "get_committed_chaincode",
    description: "Get the committed chaincode definition on the channel",
    inputSchema: {
      type: "object",
      properties: {
        chaincodeName: {
          type: "string",
          description: "The name of the chaincode to query",
        },
      },
      required: ["chaincodeName"],
    },
  },
  {
    name: "check_commit_readiness",
    description: "Check if a chaincode definition is ready to be committed",
    inputSchema: {
      type: "object",
      properties: {
        chaincodeName: {
          type: "string",
          description: "The name of the chaincode",
        },
        sequence: {
          type: "number",
          description: "The sequence number of the chaincode definition",
        },
        version: {
          type: "string",
          description: "The version of the chaincode",
        },
      },
      required: ["chaincodeName", "sequence", "version"],
    },
  },
  {
    name: "list_channels",
    description: "List all channels the peer has joined",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_channel_info",
    description: "Get information about a specific channel",
    inputSchema: {
      type: "object",
      properties: {
        channelName: {
          type: "string",
          description: "The name of the channel",
        },
      },
      required: ["channelName"],
    },
  },
];

