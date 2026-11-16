
import { Router } from "express";

import { metricsRegistry } from "../config/metrics.js";
import { logger } from "../config/logger.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_req, res) => {
  try {
    res.set(
      "Content-Type",
      metricsRegistry.contentType
    );

    res.status(200).send(
      await metricsRegistry.metrics()
    );
  } catch (error) {
    logger.error(
      { err: error },
      "Failed to collect Prometheus metrics"
    );

    res.status(500).send(
      "Failed to collect metrics"
    );
  }
});
