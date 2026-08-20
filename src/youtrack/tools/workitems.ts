import { z } from "zod";
import { defineTool } from "../../tool.ts";
import { FIELDS } from "../fields.ts";
import { entityId, fieldsParam, pagination } from "../params.ts";

export const workItemTools = [
  defineTool({
    name: "list_issue_work_items",
    title: "List an issue's work items",
    description: "List time-tracking work items (logged work) recorded on an issue.",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      fields: fieldsParam(FIELDS.workItem),
      ...pagination,
    },
    handler: (client, { issueId, fields, $top, $skip }) =>
      client.get(`/issues/${issueId}/timeTracking/workItems`, { fields: fields ?? FIELDS.workItem, $top, $skip }),
  }),

  defineTool({
    name: "add_issue_work_item",
    title: "Log work on an issue",
    description:
      "Record a time-tracking work item on an issue. `duration` is in minutes. `date` defaults to now if omitted.",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      durationMinutes: z.number().int().positive().describe("Duration of the work item, in minutes."),
      text: z.string().optional().describe("Description of the work performed."),
      date: z.number().int().optional().describe("Unix timestamp in milliseconds. Defaults to now."),
      typeId: z.string().optional().describe("ID of a work item type (from the project's time tracking settings)."),
      fields: fieldsParam(FIELDS.workItem),
    },
    handler: (client, { issueId, durationMinutes, text, date, typeId, fields }) =>
      client.post(
        `/issues/${issueId}/timeTracking/workItems`,
        { duration: { minutes: durationMinutes }, text, date, type: typeId ? { id: typeId } : undefined },
        { fields: fields ?? FIELDS.workItem },
      ),
  }),

  defineTool({
    name: "update_issue_work_item",
    title: "Update a work item",
    description: "Change an existing work item's duration, text, or date.",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      workItemId: entityId("Work item ID."),
      durationMinutes: z.number().int().positive().optional().describe("New duration, in minutes."),
      text: z.string().optional().describe("New description."),
      date: z.number().int().optional().describe("New unix timestamp in milliseconds."),
      fields: fieldsParam(FIELDS.workItem),
    },
    handler: (client, { issueId, workItemId, durationMinutes, text, date, fields }) =>
      client.post(
        `/issues/${issueId}/timeTracking/workItems/${workItemId}`,
        { duration: durationMinutes ? { minutes: durationMinutes } : undefined, text, date },
        { fields: fields ?? FIELDS.workItem },
      ),
  }),

  defineTool({
    name: "delete_issue_work_item",
    title: "Delete a work item",
    description: "Delete a work item from an issue.",
    inputSchema: {
      issueId: entityId("Issue ID, e.g. DEMO-123."),
      workItemId: entityId("Work item ID."),
    },
    handler: (client, { issueId, workItemId }) => client.delete(`/issues/${issueId}/timeTracking/workItems/${workItemId}`),
  }),

  defineTool({
    name: "list_work_items",
    title: "List work items across issues",
    description: "List time-tracking work items across the whole instance, optionally filtered by author or date range.",
    inputSchema: {
      author: z.string().optional().describe('Filter by author login, database ID, or "me".'),
      startDate: z.string().optional().describe("Start of the date range, formatted YYYY-MM-DD."),
      endDate: z.string().optional().describe("End of the date range, formatted YYYY-MM-DD."),
      fields: fieldsParam(FIELDS.workItem),
      ...pagination,
    },
    handler: (client, { author, startDate, endDate, fields, $top, $skip }) =>
      client.get("/workItems", { author, startDate, endDate, fields: fields ?? FIELDS.workItem, $top, $skip }),
  }),
];
