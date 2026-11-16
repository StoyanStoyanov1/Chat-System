
import express from "express";
import helmet from "helmet";
import * as swaggerUi from "swagger-ui-express";

import { countryRoutes } from "./routes/index.js";

import { httpLogger } from "./middleware/httpLogger.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { corsMiddleware } from "./config/cors.js";
import { openApiDocument } from "./docs/openapi.js";

import { healthRoutes } from "./routes/health.routes.js";

export const app = express();

// Logging and CORS
app.use(httpLogger);
app.use(corsMiddleware);

// Swagger UI: keep other Helmet protections,
// but disable CSP for this documentation route.
app.use(
  "/api-docs",
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument)
);

// Full Helmet protection for the remaining routes
app.use(helmet());

// Parse JSON
app.use(express.json());

// OpenAPI JSON document
app.get("/api-docs.json", (_req, res) => {
  res.json(openApiDocument);
});

// Health checks
app.use("/health", healthRoutes);

// API routes
app.use("/countries", apiRateLimiter, countryRoutes);

// Centralized error handling
app.use(errorHandler);
