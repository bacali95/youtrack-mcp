import { z } from "zod";
import { defineTool } from "../../tool.ts";
import { FIELDS } from "../fields.ts";
import { entityId, fieldsParam, pagination } from "../params.ts";

export const issueTools = [
  defineTool({
    name: "list_issues",
    title: "List / search issues",
    description:
      "Search issues using YouTrack's query syntax (e.g. \"project: DEMO #Unresolved assignee: me\"). " +
      "Returns an empty array if nothing matches.",
    inputSchema: {
      query: z.string().optional().describe("YouTrack search query. Omit to list all accessible issues."),
      fields: fieldsParam(FIELDS.issue),
      ...pagination,
    },
    handler: (client, { query, fields, top, skip }) =>
      client.get("/issues", { query, fields: fields ?? FIELDS.issue, $top: top, $skip: skip }),
  }),

  defineTool({
    name: "get_issue",
    title: "Get an issue",
    description: 'Fetch a single issue by its readable ID (e.g. "DEMO-123") or database ID.',
    inputSchema: {
      id: entityId("Issue ID, e.g. DEMO-123."),
      fields: fieldsParam(FIELDS.issue),
    },
    handler: (client, { id, fields }) => client.get(`/issues/${id}`, { fields: fields ?? FIELDS.issue }),
  }),

  defineTool({
    name: "create_issue",
    title: "Create an issue",
    description:
      "Create a new issue in a project. `project` accepts either the project's database ID or its " +
      "short name (e.g. \"DEMO\"). Use `customFields` for fields like priority, type or state, following " +
      'YouTrack\'s IssueCustomField JSON shape, e.g. [{"name":"Priority","$type":"SingleEnumIssueCustomField","value":{"name":"Critical"}}].',
    inputSchema: {
      project: z.string().describe("Project ID or short name to create the issue in."),
      summary: z.string().describe("Issue summary/title."),
      description: z.string().optional().describe("Issue description (Markdown supported)."),
      customFields: z
        .array(z.record(z.string(), z.unknown()))
        .optional()
        .describe("Custom field values, using YouTrack's IssueCustomField JSON shape."),
      fields: fieldsParam(FIELDS.issue),
    },
    handler: (client, { project, summary, description, customFields, fields }) =>
      client.post(
        "/issues",
        {
          project: /^\d+(-\d+)?$/.test(project) ? { id: project } : { shortName: project },
          summary,
          description,
          customFields,
        },
        { fields: fields ?? FIELDS.issue },
      ),
  }),

  defineTool({
    name: "update_issue",
    title: "Update an issue",
    description:
      "Update fields on an existing issue. Only the fields you provide are changed. For state, assignee, " +
      "or link changes, `execute_command` is usually simpler.",
    inputSchema: {
      id: entityId("Issue ID, e.g. DEMO-123."),
      summary: z.string().optional().describe("New summary."),
      description: z.string().optional().describe("New description."),
      customFields: z
        .array(z.record(z.string(), z.unknown()))
        .optional()
        .describe("Custom field values to change, using YouTrack's IssueCustomField JSON shape."),
      fields: fieldsParam(FIELDS.issue),
    },
    handler: (client, { id, summary, description, customFields, fields }) =>
      client.post(`/issues/${id}`, { summary, description, customFields }, { fields: fields ?? FIELDS.issue }),
  }),

  defineTool({
    name: "delete_issue",
    title: "Delete an issue",
    description: "Permanently delete an issue.",
    inputSchema: { id: entityId("Issue ID, e.g. DEMO-123.") },
    handler: (client, { id }) => client.delete(`/issues/${id}`),
  }),

  defineTool({
    name: "execute_command",
    title: "Execute a YouTrack command",
    description:
      "Apply one or more YouTrack commands to issues, e.g. \"State Fixed\", \"for John.Doe\", " +
      '"priority Critical", "tag urgent", "relates to DEMO-1", or "Sprint 12". This is the simplest way ' +
      "to change state, assignee, links, tags, or run any other command supported by YouTrack's search/command syntax.",
    inputSchema: {
      issueIds: z.array(z.string()).min(1).describe('Issue IDs to apply the command to, e.g. ["DEMO-1", "DEMO-2"].'),
      query: z.string().describe('The command text, e.g. "State Fixed assignee John.Doe".'),
      comment: z.string().optional().describe("Optional comment to add along with the command."),
      silent: z.boolean().optional().describe("If true, suppress update notifications."),
      fields: fieldsParam(FIELDS.commandList),
    },
    handler: (client, { issueIds, query, comment, silent, fields }) =>
      client.post(
        "/commands",
        { issues: issueIds.map((id) => ({ id })), query, comment, silent },
        { fields: fields ?? FIELDS.commandList },
      ),
  }),
];
