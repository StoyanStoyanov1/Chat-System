
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { registry } from "./registry.js";
import "./countries.docs.js";

// Later:
// import "./cities.docs.js";

const generator = new OpenApiGeneratorV3(
  registry.definitions
);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.3",

  info: {
    title: "Hotel Manager API",
    version: "1.0.0",
    description:
      "Backend API for hotel workforce management.",
  },

  servers: [
    {
      url: "http://localhost:5001",
      description: "Local development",
    },
  ],

  tags: [
    {
      name: "Countries",
      description: "Country management operations",
    },
  ],
});
