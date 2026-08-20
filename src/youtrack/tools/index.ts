import { agileTools } from "./agile.ts";
import { articleTools } from "./articles.ts";
import { commentTools } from "./comments.ts";
import { issueTools } from "./issues.ts";
import { linkTools } from "./links.ts";
import { projectTools } from "./projects.ts";
import { rawTools } from "./raw.ts";
import { savedQueryTools } from "./savedqueries.ts";
import { tagTools } from "./tags.ts";
import { userTools } from "./users.ts";
import { workItemTools } from "./workitems.ts";

export const allTools = [
  ...issueTools,
  ...commentTools,
  ...linkTools,
  ...tagTools,
  ...workItemTools,
  ...projectTools,
  ...userTools,
  ...articleTools,
  ...agileTools,
  ...savedQueryTools,
  ...rawTools,
];
