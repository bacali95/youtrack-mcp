import { defineTool } from "../../tool.ts";
import { FIELDS } from "../fields.ts";
import { fieldsParam, pagination } from "../params.ts";

export const savedQueryTools = [
  defineTool({
    name: "list_saved_queries",
    title: "List saved searches",
    description: "List the saved search queries visible to the current user.",
    inputSchema: { fields: fieldsParam(FIELDS.savedQuery), ...pagination },
    handler: (client, { fields, top, skip }) =>
      client.get("/savedQueries", { fields: fields ?? FIELDS.savedQuery, $top: top, $skip: skip }),
  }),
];
