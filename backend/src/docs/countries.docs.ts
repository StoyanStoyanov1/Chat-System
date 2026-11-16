
import { z } from "zod";
import { countryBodySchema } from "../schemas/country.schema.js";

import {
  registry,
  apiErrorSchema,
  commonErrors,
  jsonContent,
} from "./registry.js";



const countrySchema = registry.register(
  "Country",
  z.object({
    id: z.number().int(),
    name: z.string(),
    created_at: z.iso.datetime(),
  })
);

const countryRequestSchema = registry.register(
  "CountryRequest",
  countryBodySchema
);

const countryIdParams = z.object({
  id: z.string().regex(/^[1-9]\d*$/),
});

const paginationQuery = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional()
    .describe("Page number, default 1"),

  size: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional()
    .describe("Page size, default 10, maximum 100"),
});

const countriesListSchema = registry.register(
  "CountriesList",
  z.object({
    total: z.number().int(),
    data: z.array(countrySchema),
  })
);

const paginatedCountriesSchema = registry.register(
  "PaginatedCountries",
  z.object({
    total: z.number().int(),
    data: z.array(countrySchema),
    pagination: z.object({
      page: z.number().int(),
      size: z.number().int(),
      totalPages: z.number().int(),
    }),
  })
);


registry.registerPath({
  method: "get",
  path: "/countries",
  tags: ["Countries"],
  summary: "Get all countries",
  description:
    "Get all countries. Provide page or size to enable pagination.",

  request: {
    query: paginationQuery,
  },

  responses: {
    200: {
      description: "Countries retrieved successfully",
      content: jsonContent(
        z.union([
          countriesListSchema,
          paginatedCountriesSchema,
        ])
      ),
    },
    400: {
      description: "Invalid pagination parameters",
      content: jsonContent(apiErrorSchema),
    },
    ...commonErrors,
  },
});



registry.registerPath({
  method: "get",
  path: "/countries/{id}",
  tags: ["Countries"],
  summary: "Get a country by ID",

  request: {
    params: countryIdParams,
  },

  responses: {
    200: {
      description: "Country retrieved successfully",
      content: jsonContent(
        z.object({
          country: countrySchema,
        })
      ),
    },
    400: {
      description: "Invalid country ID",
      content: jsonContent(apiErrorSchema),
    },
    404: {
      description: "Country not found",
      content: jsonContent(apiErrorSchema),
    },
    ...commonErrors,
  },
});


registry.registerPath({
  method: "post",
  path: "/countries",
  tags: ["Countries"],
  summary: "Create a country",
  description: "Country names must be unique, ignoring case.",

  request: {
    body: {
      required: true,
      content: jsonContent(countryRequestSchema),
    },
  },

  responses: {
    201: {
      description: "Country created successfully",
      content: jsonContent(countrySchema),
    },
    400: {
      description: "Invalid country data",
      content: jsonContent(apiErrorSchema),
    },
    409: {
      description: "Country already exists",
      content: jsonContent(apiErrorSchema),
    },
    ...commonErrors,
  },
});



registry.registerPath({
  method: "put",
  path: "/countries/{id}",
  tags: ["Countries"],
  summary: "Update a country",

  request: {
    params: countryIdParams,
    body: {
      required: true,
      content: jsonContent(countryRequestSchema),
    },
  },

  responses: {
    200: {
      description: "Country updated successfully",
      content: jsonContent(
        z.object({
          data: countrySchema,
        })
      ),
    },
    400: {
      description: "Invalid country ID or data",
      content: jsonContent(apiErrorSchema),
    },
    404: {
      description: "Country not found",
      content: jsonContent(apiErrorSchema),
    },
    409: {
      description: "Country name already exists",
      content: jsonContent(apiErrorSchema),
    },
    ...commonErrors,
  },
});

registry.registerPath({
  method: "delete",
  path: "/countries/{id}",
  tags: ["Countries"],
  summary: "Delete a country",
  description:
    "A country cannot be deleted while it has related cities.",

  request: {
    params: countryIdParams,
  },

  responses: {
    204: {
      description: "Country deleted successfully. No response body.",
    },
    400: {
      description: "Invalid country ID",
      content: jsonContent(apiErrorSchema),
    },
    404: {
      description: "Country not found",
      content: jsonContent(apiErrorSchema),
    },
    409: {
      description: "Country is referenced by cities",
      content: jsonContent(apiErrorSchema),
    },
    ...commonErrors,
  },
});
