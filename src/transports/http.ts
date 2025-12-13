import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response, Express } from "express";
import cors from "cors";
import { randomUUID } from "crypto";

export async function runHttpTransport(server: Server, port: number = 3000): Promise<Express> {
  const app = express();
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // Middleware
  app.use(cors({
    exposedHeaders: ["mcp-session-id"],
  }));

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      mode: "http",
      activeSessions: transports.size,
    });
  });

  // MCP endpoint - handles all MCP protocol requests
  app.all("/mcp", express.json(), async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports.has(sessionId)) {
      // Reuse existing transport for this session
      transport = transports.get(sessionId)!;
    } else if (!sessionId && req.method === "POST") {
      // New session - create transport
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports.set(id, transport);
          console.error(`Session initialized: ${id}`);
        },
        onsessionclosed: (id) => {
          transports.delete(id);
          console.error(`Session closed: ${id}`);
        },
      });

      // Connect to the MCP server
      await server.connect(transport);
    } else {
      res.status(400).json({ error: "Invalid session or request" });
      return;
    }

    // Handle the request - pass parsed body to avoid stream consumption issue
    await transport.handleRequest(req, res, req.body);
  });

  // Start server
  app.listen(port, () => {
    console.error(`Hyperledger Fabric MCP server running on http://localhost:${port}`);
    console.error(`  MCP endpoint: http://localhost:${port}/mcp`);
    console.error(`  Health check: http://localhost:${port}/health`);
  });

  return app;
}

