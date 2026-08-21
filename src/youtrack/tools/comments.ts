import { z } from "zod";
import { defineTool } from "../../tool.ts";
import { FIELDS } from "../fields.ts";
import { entityId, fieldsParam, pagination } from "../params.ts";

export const commentTools = [
  defineTool({
    name: "list_issue_comments",
    title: "List issue comments",
    description: "List comments on an issue.",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      fields: fieldsParam(FIELDS.comment),
      ...pagination,
    },
    handler: (client, { issueId, fields, top, skip }) =>
      client.get(`/issues/${issueId}/comments`, { fields: fields ?? FIELDS.comment, $top: top, $skip: skip }),
  }),

  defineTool({
    name: "add_issue_comment",
    title: "Add a comment to an issue",
    description: "Add a new comment to an issue.",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      text: z.string().describe("Comment text (Markdown supported)."),
      fields: fieldsParam(FIELDS.comment),
    },
    handler: (client, { issueId, text, fields }) =>
      client.post(`/issues/${issueId}/comments`, { text }, { fields: fields ?? FIELDS.comment }),
  }),

  defineTool({
    name: "update_issue_comment",
    title: "Update an issue comment",
    description: "Change the text of an existing comment.",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      commentId: entityId("Comment ID."),
      text: z.string().describe("New comment text."),
      fields: fieldsParam(FIELDS.comment),
    },
    handler: (client, { issueId, commentId, text, fields }) =>
      client.post(`/issues/${issueId}/comments/${commentId}`, { text }, { fields: fields ?? FIELDS.comment }),
  }),

  defineTool({
    name: "delete_issue_comment",
    title: "Delete an issue comment",
    description: "Permanently delete a comment from an issue.",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      commentId: entityId("Comment ID."),
    },
    handler: (client, { issueId, commentId }) => client.delete(`/issues/${issueId}/comments/${commentId}`),
  }),
];
