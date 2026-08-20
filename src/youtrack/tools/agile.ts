import { defineTool } from "../../tool.ts";
import { FIELDS } from "../fields.ts";
import { entityId, fieldsParam, pagination } from "../params.ts";

export const agileTools = [
  defineTool({
    name: "list_agile_boards",
    title: "List agile boards",
    description: "List the agile boards visible to the current user.",
    inputSchema: { fields: fieldsParam(FIELDS.agile), ...pagination },
    handler: (client, { fields, $top, $skip }) => client.get("/agiles", { fields: fields ?? FIELDS.agile, $top, $skip }),
  }),

  defineTool({
    name: "get_agile_board",
    title: "Get an agile board",
    description: "Fetch a single agile board by ID.",
    inputSchema: {
      id: entityId("Agile board ID."),
      fields: fieldsParam(FIELDS.agile),
    },
    handler: (client, { id, fields }) => client.get(`/agiles/${id}`, { fields: fields ?? FIELDS.agile }),
  }),

  defineTool({
    name: "list_sprints",
    title: "List an agile board's sprints",
    description: "List the sprints defined on an agile board.",
    inputSchema: {
      agileId: entityId("Agile board ID."),
      fields: fieldsParam(FIELDS.sprint),
      ...pagination,
    },
    handler: (client, { agileId, fields, $top, $skip }) =>
      client.get(`/agiles/${agileId}/sprints`, { fields: fields ?? FIELDS.sprint, $top, $skip }),
  }),

  defineTool({
    name: "get_sprint",
    title: "Get a sprint",
    description: "Fetch a single sprint from an agile board.",
    inputSchema: {
      agileId: entityId("Agile board ID."),
      sprintId: entityId("Sprint ID."),
      fields: fieldsParam(FIELDS.sprint),
    },
    handler: (client, { agileId, sprintId, fields }) =>
      client.get(`/agiles/${agileId}/sprints/${sprintId}`, { fields: fields ?? FIELDS.sprint }),
  }),
];
