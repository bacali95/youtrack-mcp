import { z } from "zod";
import { defineTool } from "../../tool.ts";
import { FIELDS } from "../fields.ts";
import { entityId, fieldsParam, pagination } from "../params.ts";

export const tagTools = [
  defineTool({
    name: "list_tags",
    title: "List tags",
    description: "List all tags visible to the current user.",
    inputSchema: { fields: fieldsParam(FIELDS.tag), ...pagination },
    handler: (client, { fields, $top, $skip }) => client.get("/tags", { fields: fields ?? FIELDS.tag, $top, $skip }),
  }),

  defineTool({
    name: "create_tag",
    title: "Create a tag",
    description: "Create a new tag.",
    inputSchema: {
      name: z.string().describe("Tag name."),
      fields: fieldsParam(FIELDS.tag),
    },
    handler: (client, { name, fields }) => client.post("/tags", { name }, { fields: fields ?? FIELDS.tag }),
  }),

  defineTool({
    name: "list_issue_tags",
    title: "List an issue's tags",
    description: "List the tags applied to an issue.",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      fields: fieldsParam(FIELDS.tag),
    },
    handler: (client, { issueId, fields }) => client.get(`/issues/${issueId}/tags`, { fields: fields ?? FIELDS.tag }),
  }),

  defineTool({
    name: "add_issue_tag",
    title: "Add a tag to an issue",
    description: "Attach an existing tag (by ID) to an issue. To create and attach in one step, use `execute_command` with a command like \"tag urgent\".",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      tagId: entityId("ID of an existing tag, from `list_tags`."),
      fields: fieldsParam(FIELDS.tag),
    },
    handler: (client, { issueId, tagId, fields }) =>
      client.post(`/issues/${issueId}/tags`, { id: tagId }, { fields: fields ?? FIELDS.tag }),
  }),

  defineTool({
    name: "remove_issue_tag",
    title: "Remove a tag from an issue",
    description: "Detach a tag from an issue.",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      tagId: entityId("Tag ID to remove."),
    },
    handler: (client, { issueId, tagId }) => client.delete(`/issues/${issueId}/tags/${tagId}`),
  }),
];
