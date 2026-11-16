
import request from "supertest";
import type { Express } from "express";
import { randomUUID } from "node:crypto";

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

// Track records created by our tests
const createdCountryIds: number[] = [];

function uniqueCountryName(): string {
  return `Vitest_${randomUUID().slice(0, 12)}`;
}

async function createTestCountry(name?: string) {
  const response = await request(app)
    .post("/countries")
    .send({
      name: name ?? uniqueCountryName(),
    });

  expect(response.status).toBe(201);

  const country = response.body;

  createdCountryIds.push(country.id);

  return country;
}

beforeAll(async () => {
  // Same initialization order as bootstrap.ts
  extendZodWithOpenApi(z);

  await connectRedis();

  const appModule = await import("../app.js");
  app = appModule.app;
});

afterAll(async () => {
  try {
    // Remove records created by these tests
    if (createdCountryIds.length > 0) {
      await prisma.countries.deleteMany({
        where: {
          id: {
            in: createdCountryIds,
          },
        },
      });
    }

    // Clear potentially stale test cache
    await redis.del("countries:all");
  } finally {
    await prisma.$disconnect();
    await redis.quit();
    await pool.end();
  }
});

describe("Countries API", () => {
  // ==================================
  // READ + VALIDATION
  // ==================================

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

  it("GET /countries supports pagination", async () => {
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

  it("POST /countries rejects empty names", async () => {
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

  // ==================================
  // CREATE
  // ==================================

  it("POST /countries creates a country", async () => {
    const name = uniqueCountryName();

    const country = await createTestCountry(name);

    expect(country.name).toBe(name);
    expect(country.id).toEqual(expect.any(Number));
  });

  // ==================================
  // READ BY ID
  // ==================================

  it("GET /countries/:id returns a created country", async () => {
    const country = await createTestCountry();

    const response = await request(app)
      .get(`/countries/${country.id}`);

    expect(response.status).toBe(200);
    expect(response.body.country.id).toBe(country.id);
    expect(response.body.country.name).toBe(country.name);
  });

  // ==================================
  // UPDATE
  // ==================================

  it("PUT /countries/:id updates a country", async () => {
    const country = await createTestCountry();
    const newName = uniqueCountryName();

    const response = await request(app)
      .put(`/countries/${country.id}`)
      .send({ name: newName });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(country.id);
    expect(response.body.data.name).toBe(newName);
  });

  // ==================================
  // DELETE
  // ==================================

  it("DELETE /countries/:id removes a country", async () => {
    const country = await createTestCountry();

    const deleteResponse = await request(app)
      .delete(`/countries/${country.id}`);

    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app)
      .get(`/countries/${country.id}`);

    expect(getResponse.status).toBe(404);
  });
});
