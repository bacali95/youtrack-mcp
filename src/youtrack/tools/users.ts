import { z } from "zod";
import { defineTool } from "../../tool.ts";
import { FIELDS } from "../fields.ts";
import { entityId, fieldsParam, pagination } from "../params.ts";

export const userTools = [
  defineTool({
    name: "get_current_user",
    title: "Get the current user",
    description: "Fetch the profile of the user identified by the configured token.",
    inputSchema: { fields: fieldsParam(FIELDS.user) },
    handler: (client, { fields }) => client.get("/users/me", { fields: fields ?? FIELDS.user }),
  }),

  defineTool({
    name: "list_users",
    title: "List / search users",
    description: 'List users, optionally filtered with `query` (matches login, name, or email substrings).',
    inputSchema: {
      query: z.string().optional().describe("Free-text filter on login, name, or email."),
      fields: fieldsParam(FIELDS.user),
      ...pagination,
    },
    handler: (client, { query, fields, $top, $skip }) =>
      client.get("/users", { query, fields: fields ?? FIELDS.user, $top, $skip }),
  }),

  defineTool({
    name: "get_user",
    title: "Get a user",
    description: 'Fetch a single user by database ID or login, e.g. "john.doe".',
    inputSchema: {
      id: entityId("User database ID or login."),
      fields: fieldsParam(FIELDS.user),
    },
    handler: (client, { id, fields }) => client.get(`/users/${id}`, { fields: fields ?? FIELDS.user }),
  }),

  defineTool({
    name: "list_groups",
    title: "List user groups",
    description: "List user groups defined in the YouTrack instance.",
    inputSchema: { fields: fieldsParam(FIELDS.group), ...pagination },
    handler: (client, { fields, $top, $skip }) => client.get("/groups", { fields: fields ?? FIELDS.group, $top, $skip }),
  }),
];
