
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const RATE_LIMIT_MAX = Number(
  process.env.RATE_LIMIT_MAX ?? 100
);

export const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.sendCommand(args),

    prefix: "ratelimit:api:",
  }),

  handler: (req, res) => {
    logger.warn(
      {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
      },
      "API rate limit exceeded"
    );

    res.status(429).json({
      message: "Too many requests. Please try again later.",
    });
  },
});
