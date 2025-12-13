#!/usr/bin/env node
import "dotenv/config";
import { loadConfig } from "./config.js";
import { FabricClient } from "./fabric-client.js";
import { createMCPServer } from "./server.js";
import { runStdioTransport, runHttpTransport } from "./transports/index.js";

async function main() {
  // Load configuration
  const config = loadConfig();

  // Create Fabric client
  const fabricClient = new FabricClient(config);

  // Create MCP server
  const server = createMCPServer(fabricClient);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const mode = process.env.MCP_TRANSPORT || (args.includes("--http") || args.includes("--sse") ? "http" : "stdio");
  const portArg = args.find(arg => arg.startsWith("--port="));
  const port = portArg ? parseInt(portArg.split("=")[1]) : parseInt(process.env.MCP_PORT || "3000");

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await fabricClient.disconnect();
    process.exit(0);
  });

  // Start the appropriate transport
  if (mode === "http" || mode === "sse") {
    await runHttpTransport(server, port);
  } else {
    await runStdioTransport(server);
  }
}

main().catch(console.error);

