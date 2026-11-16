
import "dotenv/config";

import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { connectRedis } from "./config/redis.js";
import { logger } from "./config/logger.js";

extendZodWithOpenApi(z);

async function bootstrap(): Promise<void> {
  try {
    await connectRedis();

    logger.info("Redis connected");

    await import("./server.js");
  } catch (error) {
    logger.fatal(
      { err: error },
      "Failed to bootstrap application"
    );

    process.exit(1);
  }
}

void bootstrap();
