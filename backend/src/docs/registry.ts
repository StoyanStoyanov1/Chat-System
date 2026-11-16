
import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

export const apiErrorSchema = registry.register(
  "ApiError",
  z.object({
    message: z.string(),
    errors: z.array(z.unknown()).optional(),
  })
);

export const jsonContent = (schema: z.ZodType) => ({
  "application/json": {
    schema,
  },
});

export const commonErrors = {
  429: {
    description: "Too many requests",
    content: jsonContent(apiErrorSchema),
  },
  500: {
    description: "Internal server error",
    content: jsonContent(apiErrorSchema),
  },
};
