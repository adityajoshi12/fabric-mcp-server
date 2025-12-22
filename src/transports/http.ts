import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Request, Response, Express } from "express";

export async function runHttpTransport(
  serverFactory: () => McpServer,
  port: number = 3000
): Promise<Express> {
  const app = createMcpExpressApp();


  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      mode: "http",
    });
  });

  app.post("/mcp", async (req: Request, res: Response) => {
    const server = serverFactory();
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        console.error("Request closed");
        transport.close();
        server.close();
      });
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", async (_req: Request, res: Response) => {
    console.error("Received GET MCP request");
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      })
    );
  });

  app.delete("/mcp", async (_req: Request, res: Response) => {
    console.error("Received DELETE MCP request");
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      })
    );
  });

  app.listen(port, (error?: Error) => {
    if (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
    console.error(`Hyperledger Fabric MCP server running on http://localhost:${port}`);
    console.error(`  MCP endpoint: http://localhost:${port}/mcp`);
    console.error(`  Health check: http://localhost:${port}/health`);
  });

  return app;
}
