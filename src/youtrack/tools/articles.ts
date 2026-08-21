import { z } from "zod";
import { defineTool } from "../../tool.ts";
import { FIELDS } from "../fields.ts";
import { entityId, fieldsParam, pagination } from "../params.ts";

export const articleTools = [
  defineTool({
    name: "list_articles",
    title: "List knowledge base articles",
    description: "List articles in the YouTrack knowledge base.",
    inputSchema: { fields: fieldsParam(FIELDS.article), ...pagination },
    handler: (client, { fields, top, skip }) =>
      client.get("/articles", { fields: fields ?? FIELDS.article, $top: top, $skip: skip }),
  }),

  defineTool({
    name: "get_article",
    title: "Get an article",
    description: 'Fetch a single article by ID, e.g. "DEMO-A-1".',
    inputSchema: {
      id: entityId("Article ID."),
      fields: fieldsParam(FIELDS.article),
    },
    handler: (client, { id, fields }) => client.get(`/articles/${id}`, { fields: fields ?? FIELDS.article }),
  }),

  defineTool({
    name: "create_article",
    title: "Create an article",
    description: "Create a new knowledge base article in a project.",
    inputSchema: {
      project: z.string().describe("Project ID or short name to create the article in."),
      summary: z.string().describe("Article title."),
      content: z.string().optional().describe("Article body (Markdown supported)."),
      parentArticleId: z.string().optional().describe("ID of a parent article, to nest this one under it."),
      fields: fieldsParam(FIELDS.article),
    },
    handler: (client, { project, summary, content, parentArticleId, fields }) =>
      client.post(
        "/articles",
        {
          project: /^\d+(-\d+)?$/.test(project) ? { id: project } : { shortName: project },
          summary,
          content,
          parentArticle: parentArticleId ? { id: parentArticleId } : undefined,
        },
        { fields: fields ?? FIELDS.article },
      ),
  }),

  defineTool({
    name: "update_article",
    title: "Update an article",
    description: "Update an existing article's title or content.",
    inputSchema: {
      id: entityId("Article ID."),
      summary: z.string().optional().describe("New title."),
      content: z.string().optional().describe("New body content."),
      fields: fieldsParam(FIELDS.article),
    },
    handler: (client, { id, summary, content, fields }) =>
      client.post(`/articles/${id}`, { summary, content }, { fields: fields ?? FIELDS.article }),
  }),

  defineTool({
    name: "delete_article",
    title: "Delete an article",
    description: "Permanently delete an article.",
    inputSchema: { id: entityId("Article ID.") },
    handler: (client, { id }) => client.delete(`/articles/${id}`),
  }),
];
