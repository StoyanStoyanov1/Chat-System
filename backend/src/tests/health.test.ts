
import request from "supertest";
import type { Express } from "express";

import {
  beforeAll,
  afterAll,
  describe,
  it,
  expect,
} from "vitest";

import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

import { connectRedis, redis } from "../config/redis.js";
import { pool } from "../config/db.js";
import { prisma } from "../config/prisma.js";

let app: Express;

beforeAll(async () => {
  // Initialize OpenAPI before loading the Express app
  extendZodWithOpenApi(z);

  // Connect Redis before loading the Rate Limiter
  await connectRedis();

  const appModule = await import("../app.js");
  app = appModule.app;
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
  await pool.end();
});

describe("Health API", () => {
  it("GET /health/live returns 200", async () => {
    const response = await request(app)
      .get("/health/live");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "alive",
    });
  });

  it("GET /health/ready returns 200 when dependencies are available", async () => {
    const response = await request(app)
      .get("/health/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ready",
      services: {
        postgres: "up",
        redis: "up",
      },
    });
  });
});
