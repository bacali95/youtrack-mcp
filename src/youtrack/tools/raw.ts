import { z } from "zod";
import { defineTool } from "../../tool.ts";

/**
 * Generic escape hatch giving access to any YouTrack REST API endpoint, for the
 * long tail of operations (admin settings, custom field bundles, VCS changes,
 * article attachments, etc.) that don't have a dedicated tool. See the
 * YouTrack REST API reference for available paths and payloads.
 */
export const rawTools = [
  defineTool({
    name: "youtrack_raw_request",
    title: "Raw YouTrack API request",
    description:
      "Call any YouTrack REST API endpoint directly. `path` is relative to the API base URL, e.g. " +
      '"/issues/DEMO-1" or "/admin/projects". Use this for endpoints not covered by the other tools.',
    inputSchema: {
      method: z.enum(["GET", "POST", "DELETE"]).describe("HTTP method to use."),
      path: z.string().describe('API path relative to the base URL, e.g. "/issues" or "/admin/projects/{id}".'),
      query: z
        .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
        .optional()
        .describe("Query string parameters, e.g. { fields: \"id,summary\", $top: 10 }."),
      body: z.record(z.string(), z.unknown()).optional().describe("JSON request body, for POST requests."),
    },
    handler: (client, { method, path, query, body }) => client.request(method, path, { query, body }),
  }),
];
