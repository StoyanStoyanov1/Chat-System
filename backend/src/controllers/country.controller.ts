
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";

import {
  createCountryService,
  getCountriesService,
  getCountryByIdService,
  deleteCountryByIdService,
  updateCountryService,
} from "../services/country.service.js";

// CREATE - POST /countries
export async function createCountry(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        message: "Country name is required",
      });
      return;
    }

    const country = await createCountryService(name.trim());

    res.status(201).json(country);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.status(409).json({
          message: "Country already exists",
        });
        return;
      }
    }

    console.error("Create country error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// READ ALL - GET /countries
export async function getCountries(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const hasPagination =
      req.query.page !== undefined ||
      req.query.size !== undefined;

    if (!hasPagination) {
      const result = await getCountriesService();

      res.status(200).json(result);
      return;
    }

    const page = Number(req.query.page ?? 1);
    const size = Number(req.query.size ?? 10);

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(size) ||
      page < 1 ||
      size < 1 ||
      size > 100
    ) {
      res.status(400).json({
        message: "Invalid pagination parameters",
      });
      return;
    }

    const offset = (page - 1) * size;

    if (!Number.isSafeInteger(offset)) {
      res.status(400).json({
        message: "Pagination offset is too large",
      });
      return;
    }

    const result = await getCountriesService({
      page,
      size,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Get countries error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getCountryById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({
        message: "Invalid country ID",
      });
      return;
    }

    const country = await getCountryByIdService(id);

    if (!country) {
      res.status(404).json({
        message: "Country not found",
      });
      return;
    }

    res.status(200).json({
      country,
    });
  } catch (error) {
    console.error("Get country by ID error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function updateCountry(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { name } = req.body ?? {};

    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({
        message: "Invalid country ID",
      });
      return;
    }

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        message: "Country name is invalid",
      });
      return;
    }

    const country = await updateCountryService(
      id,
      name.trim()
    );

    if (!country) {
    res.status(404).json({
        message: "Country not found"
    });
    return;
}

    res.status(200).json({
      data: country,
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        res.status(404).json({
          message: "Country not found",
        });
        return;
      }

      if (error.code === "P2002") {
        res.status(409).json({
          message: "Country already exists",
        });
        return;
      }
    }

    console.error("Update country error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function deleteCountryById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({
        message: "Invalid country ID",
      });
      return;
    }

    await deleteCountryByIdService(id);

    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        res.status(404).json({
          message: "Country not found",
        });
        return;
      }

      if (error.code === "P2003") {
        res.status(409).json({
          message: "Cannot delete country with associated cities",
        });
        return;
      }
    }

    console.error("Delete country by ID error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
