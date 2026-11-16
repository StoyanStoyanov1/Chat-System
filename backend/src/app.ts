
import express from "express";
import helmet from "helmet";
import * as swaggerUi from "swagger-ui-express";

// Configuration
import { corsMiddleware } from "./config/cors.js";

// Routes
import { countryRoutes } from "./routes/index.js";
import { healthRoutes } from "./routes/health.routes.js";
import { metricsRoutes } from "./routes/metrics.routes.js";

// Middleware
import { httpLogger } from "./middleware/httpLogger.js";
import { metricsMiddleware } from "./middleware/metricsMiddleware.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

// OpenAPI documentation
import { openApiDocument } from "./docs/openapi.js";

export const app = express();


// HTTP logging
app.use(httpLogger);

// Prometheus HTTP metrics
app.use(metricsMiddleware);

// CORS
app.use(corsMiddleware);


// Swagger UI

app.use(
  "/api-docs",
  helmet({
    contentSecurityPolicy: false,
  }),
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument)
);

// Security headers for other routes
app.use(helmet());


// Request Parsing


app.use(express.json());


// Documentation
app.get("/api-docs.json", (_req, res) => {
  res.json(openApiDocument);
});


// Health Checks


app.use("/health", healthRoutes);


// Prometheus Metrics


app.use("/metrics", metricsRoutes);


// API Routes

app.use(
  "/countries",
  apiRateLimiter,
  countryRoutes
);



// Always register after routes
app.use(errorHandler);
