
import express from "express";
import * as swaggerUi from "swagger-ui-express";

import { countryRoutes } from "./routes/index.js";

import { httpLogger } from "./middleware/httpLogger.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { openApiDocument } from "./docs/openapi.js";

export const app = express();

// Global middleware
app.use(httpLogger);
app.use(express.json());

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument)
);

app.get("/api-docs.json", (_req, res) => {
  res.json(openApiDocument);
});

// API routes
app.use("/countries", apiRateLimiter, countryRoutes);

// Centralized error handling
app.use(errorHandler);
