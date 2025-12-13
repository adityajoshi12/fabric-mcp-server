# Hyperledger Fabric MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with Hyperledger Fabric blockchain networks.

## Features

- **Query Chaincode** - Execute read-only queries on smart contracts
- **Invoke Chaincode** - Submit transactions to the blockchain
- **Get Block Info** - Retrieve detailed information about specific blocks
- **Get Blockchain Info** - Get network statistics (block height, hashes)
- **Get Transaction History** - View history for specific assets
- **List Enrolled Identities** - View wallet identities
- **Multiple Transport Modes** - Supports both stdio and HTTP/SSE (for web clients)

## Prerequisites

- Node.js v18+
- A running Hyperledger Fabric network
- Valid connection profile JSON
- Enrolled user identity (certificate + private key)

## Installation

```bash
npm install
```

## Configuration

### Option 1: Environment Variables

Copy the template and configure:

```bash
cp env.template .env
```

Edit `.env` with your settings:

```env
# Fabric Network Configuration
FABRIC_CHANNEL=mychannel
FABRIC_CHAINCODE=basic
FABRIC_MSP_ID=Org1MSP
FABRIC_WALLET_PATH=./wallet
FABRIC_CONNECTION_PROFILE=./connection-profile.json
FABRIC_USER_ID=appUser

# Transport Configuration (optional)
MCP_TRANSPORT=stdio    # "stdio" or "http"
MCP_PORT=3000          # HTTP port (only used when MCP_TRANSPORT=http)
```

### Option 2: Claude Desktop Config

Add environment variables directly in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hyperledger-fabric": {
      "command": "npx",
      "args": ["-y", "@adityajoshi12/fabric-mcp-server"],
      "env": {
        "FABRIC_CHANNEL": "mychannel",
        "FABRIC_CHAINCODE": "basic",
        "FABRIC_MSP_ID": "Org1MSP",
        "FABRIC_WALLET_PATH": "/path/to/wallet",
        "FABRIC_CONNECTION_PROFILE": "/path/to/connection-profile.json",
        "FABRIC_USER_ID": "appUser"
      }
    }
  }
}
```

## Wallet Setup

Create a wallet from your certificate and private key:

```bash
npm run create-wallet -- ./path/to/private.key ./path/to/cert.pem Org1MSP appUser
```

Or set environment variables and run:

```bash
export PRIVATE_KEY_PATH=./path/to/private.key
export CERTIFICATE_PATH=./path/to/cert.pem
npm run create-wallet
```

## Build & Run

### Stdio Mode (Default)

```bash
# Build TypeScript
npm run build

# Run the server
npm start

# Or build and run together
npm run dev
```

### HTTP Mode (for Web Clients)

Run the MCP server as an HTTP server with SSE support:

```bash
MCP_TRANSPORT=http MCP_PORT=8080 npm start
```

## Available Tools

### 1. `invoke_chaincode`
Submit a transaction to the blockchain.

**Parameters:**
- `function` (string): Chaincode function name
- `args` (array): Arguments to pass

**Example:**
```
CreateAsset with args: ["asset1", "blue", "20", "john", "500"]
```

### 2. `query_chaincode`
Query the blockchain (read-only).

**Parameters:**
- `function` (string): Chaincode function name
- `args` (array): Arguments to pass

**Example:**
```
GetAllAssets with args: []
ReadAsset with args: ["asset1"]
```

### 3. `get_block_info`
Get information about a specific block.

**Parameters:**
- `blockNumber` (number): The block number to retrieve

### 4. `get_blockchain_info`
Get blockchain statistics including total blocks and hashes.

**Parameters:** None

### 5. `get_transaction_history`
Get transaction history for an asset (requires chaincode support).

**Parameters:**
- `assetId` (string): The asset ID

### 6. `list_enrolled_identities`
List all identities in the wallet.

**Parameters:** None

## Example Usage with AI Assistant

```
"How many blocks are in the network?"
→ Uses get_blockchain_info

"List all assets"
→ Uses query_chaincode with GetAllAssets

"Create an asset with ID 1001, color red, size 20, owner john, value 500"
→ Uses invoke_chaincode with CreateAsset

"Show me block 10"
→ Uses get_block_info with blockNumber 10
```

## Project Structure

```
fabric-mcp-server/
├── app.ts              # Main MCP server
├── create-wallet.ts    # Wallet creation utility
├── dist/               # Compiled JavaScript
├── wallet/             # Identity wallet
├── env.template        # Environment template
├── tsconfig.json       # TypeScript config
└── package.json        # Dependencies
```

## Troubleshooting

### "Identity not found in wallet"
Run `npm run create-wallet` with your credentials.

### "Cannot find module" error
Ensure you've run `npm run build` and the path in config is absolute.

### Connection errors
Verify your connection profile paths and that the Fabric network is running.

## Usage


### Using npx (without installing)

```json
{
  "mcpServers": {
    "hyperledger-fabric": {
      "command": "npx",
      "args": ["-y", "fabric-mcp-server"],
      "env": {
        "FABRIC_CHANNEL": "mychannel",
        "FABRIC_CHAINCODE": "basic",
        "FABRIC_MSP_ID": "Org1MSP",
        "FABRIC_WALLET_PATH": "/path/to/wallet",
        "FABRIC_CONNECTION_PROFILE": "/path/to/connection-profile.json",
        "FABRIC_USER_ID": "appUser"
      }
    }
  }
}
```

### Installing locally
```bash
npm install -g fabric-mcp-server
```

```json
{
  "mcpServers": {
    "hyperledger-fabric": {
      "command": "fabric-mcp-server",
      "env": {
        "FABRIC_CHANNEL": "mychannel",
        "FABRIC_CHAINCODE": "basic",
        "FABRIC_MSP_ID": "Org1MSP",
        "FABRIC_WALLET_PATH": "/path/to/wallet",
        "FABRIC_CONNECTION_PROFILE": "/path/to/connection-profile.json",
        "FABRIC_USER_ID": "appUser"
      }
    }
  }
}
```

### Using SSE

```json
{
  "mcpServers": {
    "hyperledger-fabric": {
      "url": "http://localhost:3000/mcp",
    }
  }
}
```

## License

ISC

