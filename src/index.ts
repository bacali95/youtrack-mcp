#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig, loadTransportConfig } from "./config.ts";
import { registerTools } from "./tool.ts";
import { startHttpServer } from "./transport/http.ts";
import { YouTrackClient } from "./youtrack/client.ts";
import { allTools } from "./youtrack/tools/index.ts";

async function main() {
  const client = new YouTrackClient(loadConfig());
  const transport = loadTransportConfig();

  if (transport.kind === "http") {
    startHttpServer(client, { port: transport.port, authToken: transport.authToken });
    return;
  }

  const server = new McpServer({ name: "youtrack-mcp", version: "1.0.0" });
  registerTools(server, client, allTools);
  await server.connect(new StdioServerTransport());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
