
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,

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
