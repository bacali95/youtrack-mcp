import { z } from "zod";
import { defineTool } from "../../tool.ts";
import { FIELDS } from "../fields.ts";
import { entityId, fieldsParam, pagination } from "../params.ts";

export const projectTools = [
  defineTool({
    name: "list_projects",
    title: "List projects",
    description: "List all projects visible to the current user.",
    inputSchema: { fields: fieldsParam(FIELDS.project), ...pagination },
    handler: (client, { fields, $top, $skip }) =>
      client.get("/admin/projects", { fields: fields ?? FIELDS.project, $top, $skip }),
  }),

  defineTool({
    name: "get_project",
    title: "Get a project",
    description: "Fetch a single project by its database ID or short name.",
    inputSchema: {
      id: entityId("Project ID or short name, e.g. DEMO."),
      fields: fieldsParam(FIELDS.project),
    },
    handler: (client, { id, fields }) => client.get(`/admin/projects/${id}`, { fields: fields ?? FIELDS.project }),
  }),

  defineTool({
    name: "create_project",
    title: "Create a project",
    description: "Create a new project. `leaderId` must be an existing user's ID.",
    inputSchema: {
      name: z.string().describe("Project name."),
      shortName: z.string().describe('Short name / prefix used in issue IDs, e.g. "DEMO".'),
      leaderId: z.string().describe("Database ID of the user who will lead the project."),
      description: z.string().optional().describe("Project description."),
      fields: fieldsParam(FIELDS.project),
    },
    handler: (client, { name, shortName, leaderId, description, fields }) =>
      client.post(
        "/admin/projects",
        { name, shortName, description, leader: { id: leaderId } },
        { fields: fields ?? FIELDS.project },
      ),
  }),

  defineTool({
    name: "update_project",
    title: "Update a project",
    description: "Update a project's name, short name, description, leader, or archived state.",
    inputSchema: {
      id: entityId("Project ID or short name, e.g. DEMO."),
      name: z.string().optional().describe("New project name."),
      shortName: z.string().optional().describe("New short name."),
      description: z.string().optional().describe("New description."),
      leaderId: z.string().optional().describe("Database ID of the new project leader."),
      archived: z.boolean().optional().describe("Whether the project is archived."),
      fields: fieldsParam(FIELDS.project),
    },
    handler: (client, { id, name, shortName, description, leaderId, archived, fields }) =>
      client.post(
        `/admin/projects/${id}`,
        { name, shortName, description, archived, leader: leaderId ? { id: leaderId } : undefined },
        { fields: fields ?? FIELDS.project },
      ),
  }),

  defineTool({
    name: "list_project_custom_fields",
    title: "List a project's custom fields",
    description: "List the custom fields configured on a project (e.g. Priority, State, Assignee).",
    inputSchema: {
      id: entityId("Project ID or short name, e.g. DEMO."),
      fields: fieldsParam(FIELDS.projectCustomField),
      ...pagination,
    },
    handler: (client, { id, fields, $top, $skip }) =>
      client.get(`/admin/projects/${id}/customFields`, { fields: fields ?? FIELDS.projectCustomField, $top, $skip }),
  }),
];
