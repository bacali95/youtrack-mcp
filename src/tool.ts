import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z, ZodRawShape } from "zod";
import { YouTrackClient, YouTrackError } from "./youtrack/client.ts";

export interface ToolDefinition<Shape extends ZodRawShape> {
  name: string;
  title: string;
  description: string;
  inputSchema: Shape;
  handler: (client: YouTrackClient, args: z.infer<z.ZodObject<Shape>>) => Promise<unknown>;
}

/** Identity helper that gives the tool's handler argument type inference. */
export function defineTool<Shape extends ZodRawShape>(definition: ToolDefinition<Shape>): ToolDefinition<Shape> {
  return definition;
}

/**
 * Registers every tool against the MCP server, wiring in the shared client and
 * a single place for turning results/errors into MCP tool responses.
 */
export function registerTools(
  server: McpServer,
  client: YouTrackClient,
  tools: ToolDefinition<any>[],
): void {
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      { title: tool.title, description: tool.description, inputSchema: tool.inputSchema },
      async (args: Record<string, unknown>) => {
        try {
          const result = await tool.handler(client, args);
          return {
            content: [
              { type: "text" as const, text: result === undefined ? "OK" : JSON.stringify(result, null, 2) },
            ],
          };
        } catch (error) {
          const message =
            error instanceof YouTrackError || error instanceof Error ? error.message : String(error);
          return { content: [{ type: "text" as const, text: message }], isError: true };
        }
      },
    );
  }
}
