
import "dotenv/config";

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
  // Initialize OpenAPI before importing app.ts
  extendZodWithOpenApi(z);

  // Redis must be ready before rateLimiter.ts loads
  await connectRedis();

  // Import app without starting server.ts
  const appModule = await import("../app.js");
  app = appModule.app;
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
  await pool.end();
});

describe("Countries API", () => {
  it("GET /countries returns 200 and a list", async () => {
    const response = await request(app)
      .get("/countries");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("total");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBe(response.body.data.length);
  });

  it("GET /countries/abc returns 400", async () => {
    const response = await request(app)
      .get("/countries/abc");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid country ID");
  });

  it("GET /countries/999999999 returns 404", async () => {
    const response = await request(app)
      .get("/countries/999999999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Country not found");
  });

  it("GET /countries with pagination returns pagination data", async () => {
    const response = await request(app)
      .get("/countries?page=1&size=5");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      page: 1,
      size: 5,
      totalPages: Math.ceil(response.body.total / 5),
    });

    expect(response.body.data.length).toBeLessThanOrEqual(5);
  });

  it("POST /countries with empty name returns 400", async () => {
    const response = await request(app)
      .post("/countries")
      .send({ name: "   " });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid country data");
  });

  it("GET /api-docs.json returns OpenAPI documentation", async () => {
    const response = await request(app)
      .get("/api-docs.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.paths).toHaveProperty("/countries");
    expect(response.body.paths).toHaveProperty("/countries/{id}");
  });
});
