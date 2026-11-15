
import { z } from "zod";

// CREATE и UPDATE
export const countryBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Country name is required")
    .max(50, "Country name must be at most 50 characters"),
});

// ID от /countries/:id
const positiveIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "Invalid country ID")
  .transform(Number)
  .pipe(z.number().int().max(2147483647));

export const countryParamsSchema = z.object({
  id: positiveIdSchema,
});

const positiveNumberSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "Must be a positive integer")
  .transform(Number)
  .pipe(z.number().int().positive());

export const countryQuerySchema = z.object({
  page: positiveNumberSchema.default(1),
  size: positiveNumberSchema
    .pipe(z.number().max(100))
    .default(10),
});
