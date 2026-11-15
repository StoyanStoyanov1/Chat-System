
import type { Request, Response } from "express";

import {
  createCountryService,
  getCountriesService,
  getCountryByIdService,
  deleteCountryByIdService
} from "../services/country.service.js";

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

    const country = await createCountryService(name);

    res.status(201).json(country);
  } catch (error: unknown) {
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      res.status(409).json({
        message: "Country already exists",
      });
      return;
    }

    console.error("Create country error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

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

export async function deleteCountryById(
    req: Request,
    res:Response,
): Promise<void> {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            res.status(400).json({message: "Invalid country id!"});
            return;
        }

        const isDeleted = await deleteCountryByIdService(id);

        if (!isDeleted) {
            res.status(404).json({message: "Country cannot be deleted!"});
            return;
        }

        res.status(201).json({message: "ountry successfully deleted!"})
    } catch(error) {
        console.error("Delete country by ID error:", error);
        res.status(500).json({
            message: "Interal server error"
        })
    }
}