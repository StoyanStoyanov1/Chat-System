
import type { RequestHandler } from "express";

import {
  httpRequestsTotal,
  httpRequestDuration,
} from "../config/metrics.js";

export const metricsMiddleware: RequestHandler = (
  req,
  res,
  next
) => {
  // Do not measure Prometheus scraping itself
  if (req.path === "/metrics") {
    next();
    return;
  }

  const start = process.hrtime.bigint();

  res.once("finish", () => {
    const durationSeconds =
      Number(process.hrtime.bigint() - start) / 1e9;

    // Use route patterns, not raw URLs with IDs
    const route =
      typeof req.route?.path === "string"
        ? `${req.baseUrl}${req.route.path}`
        : "unmatched";

    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);

    httpRequestDuration.observe(
      labels,
      durationSeconds
    );
  });

  next();
};
