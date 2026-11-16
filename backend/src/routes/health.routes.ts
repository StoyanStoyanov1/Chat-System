
import { Router } from "express";

import { pool } from "../config/db.js";
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

export const healthRoutes = Router();

// Liveness check
healthRoutes.get("/live", (_req, res) => {
  res.status(200).json({
    status: "alive",
  });
});

// Readiness check
healthRoutes.get("/ready", async (_req, res) => {
  const services = {
    postgres: "down",
    redis: "down",
  };

  // Check PostgreSQL
  try {
    await pool.query("SELECT 1");
    services.postgres = "up";
  } catch (error) {
    logger.warn(
      { err: error },
      "PostgreSQL health check failed"
    );
  }

  // Check Redis
  try {
    const response = await redis.ping();

    if (response === "PONG") {
      services.redis = "up";
    }
  } catch (error) {
    logger.warn(
      { err: error },
      "Redis health check failed"
    );
  }

  const isReady =
    services.postgres === "up" &&
    services.redis === "up";

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
    services,
  });
});
