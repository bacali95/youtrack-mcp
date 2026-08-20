import { defineTool } from "../../tool.ts";
import { FIELDS } from "../fields.ts";
import { entityId, fieldsParam, pagination } from "../params.ts";

export const linkTools = [
  defineTool({
    name: "list_issue_links",
    title: "List issue links",
    description:
      "List the links attached to an issue (relates to, duplicates, subtask of, etc.), grouped by link type. " +
      "To add or remove links, use `execute_command` with a command like \"relates to DEMO-1\".",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      fields: fieldsParam(FIELDS.link),
    },
    handler: (client, { issueId, fields }) => client.get(`/issues/${issueId}/links`, { fields: fields ?? FIELDS.link }),
  }),

  defineTool({
    name: "list_issue_link_types",
    title: "List issue link types",
    description: 'List the available issue link types (e.g. "relates to", "duplicates", "subtask of").',
    inputSchema: {
      fields: fieldsParam(FIELDS.linkType),
      ...pagination,
    },
    handler: (client, { fields, $top, $skip }) =>
      client.get("/issueLinkTypes", { fields: fields ?? FIELDS.linkType, $top, $skip }),
  }),
];
