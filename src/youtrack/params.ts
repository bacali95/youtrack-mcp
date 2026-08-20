import { z } from "zod";

/** Shared parameter fragments so every tool's schema is built the same way. */

export const fieldsParam = (defaultFields: string) =>
  z
    .string()
    .optional()
    .describe(
      "YouTrack `fields` spec controlling which properties are returned (comma-separated, supports " +
        `nested "field(subfield,...)" syntax). Defaults to: ${defaultFields}`,
    );

export const pagination = {
  $top: z.number().int().optional().describe("Maximum number of entries to return."),
  $skip: z.number().int().optional().describe("Number of entries to skip, for pagination."),
};

export const entityId = (description: string) => z.string().describe(description);
