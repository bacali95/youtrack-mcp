import { timingSafeEqual } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools } from "../tool.ts";
import type { YouTrackClient } from "../youtrack/client.ts";
import { allTools } from "../youtrack/tools/index.ts";

export interface HttpServerOptions {
  port: number;
  /** Bearer token clients must send; this endpoint has no auth of its own otherwise. */
  authToken: string;
  /** Path the MCP endpoint is served on. */
  path?: string;
}

function isAuthorized(request: Request, expectedToken: string): boolean {
  const [scheme, token] = (request.headers.get("authorization") ?? "").split(" ");
  if (scheme !== "Bearer" || !token) return false;
  const received = Buffer.from(token);
  const expected = Buffer.from(expectedToken);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

/**
 * One MCP server + transport per client session, keyed by the session ID the transport
 * generates. Each tool call in this codebase is a self-contained YouTrack API request, so
 * there's no session state to share beyond what the MCP SDK itself tracks per connection.
 */
async function createSession(
  client: YouTrackClient,
  sessions: Map<string, WebStandardStreamableHTTPServerTransport>,
): Promise<WebStandardStreamableHTTPServerTransport> {
  const server = new McpServer({ name: "youtrack-mcp", version: "1.0.0" });
  registerTools(server, client, allTools);

  const transport: WebStandardStreamableHTTPServerTransport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    onsessioninitialized: (sessionId) => {
      sessions.set(sessionId, transport);
    },
    onsessionclosed: (sessionId) => {
      sessions.delete(sessionId);
    },
  });
  await server.connect(transport);
  return transport;
}

export function startHttpServer(client: YouTrackClient, options: HttpServerOptions): void {
  const path = options.path ?? "/mcp";
  const sessions = new Map<string, WebStandardStreamableHTTPServerTransport>();

  Bun.serve({
    port: options.port,
    async fetch(request) {
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/health") {
        return new Response("ok");
      }
      if (url.pathname !== path) {
        return new Response("Not found", { status: 404 });
      }
      if (!isAuthorized(request, options.authToken)) {
        return new Response("Unauthorized", { status: 401 });
      }

      const sessionId = request.headers.get("mcp-session-id");
      const transport = sessionId ? sessions.get(sessionId) : await createSession(client, sessions);
      if (!transport) {
        return new Response("Session not found", { status: 404 });
      }
      return transport.handleRequest(request);
    },
  });

  console.log(`youtrack-mcp listening on :${options.port}${path} (health check: GET /health)`);
}
