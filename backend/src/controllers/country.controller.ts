
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";

import {
  countryBodySchema,
  countryParamsSchema,
  countryQuerySchema,
} from "../schemas/country.schema.js";

import {
  createCountryService,
  getCountriesService,
  getCountryByIdService,
  deleteCountryByIdService,
  updateCountryService,
} from "../services/country.service.js";

export async function createCountry(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = countryBodySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid country data",
      errors: parsed.error.issues,
    });
    return;
  }

  try {
    const country = await createCountryService(
      parsed.data.name
    );

    res.status(201).json(country);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
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
  const parsed = countryQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid pagination parameters",
      errors: parsed.error.issues,
    });
    return;
  }

  try {
    const hasPagination =
      req.query.page !== undefined ||
      req.query.size !== undefined;

    if (!hasPagination) {
      const countries = await getCountriesService();

      res.status(200).json(countries);
      return;
    }

    const { page, size } = parsed.data;

    const offset = (page - 1) * size;

    if (!Number.isSafeInteger(offset) || offset > 2147483647) {
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
  const parsed = countryParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid country ID",
      errors: parsed.error.issues,
    });
    return;
  }

  try {
    const country = await getCountryByIdService(
      parsed.data.id
    );

    if (!country) {
      res.status(404).json({
        message: "Country not found",
      });
      return;
    }

    res.status(200).json({ country });
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
  const params = countryParamsSchema.safeParse(req.params);
  const body = countryBodySchema.safeParse(req.body);

  if (!params.success || !body.success) {
    res.status(400).json({
      message: "Invalid country data",
      errors: [
        ...(!params.success ? params.error.issues : []),
        ...(!body.success ? body.error.issues : []),
      ],
    });
    return;
  }

  try {
    const country = await updateCountryService(
      params.data.id,
      body.data.name
    );

    if (!country) {
      res.status(404).json({
        message: "Country not found",
      });
      return;
    }

    res.status(200).json({
      data: country,
    });
  } catch (error) {
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
  const parsed = countryParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid country ID",
      errors: parsed.error.issues,
    });
    return;
  }

  try {
    await deleteCountryByIdService(parsed.data.id);

    res.status(204).send();
  } catch (error) {
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

    console.error("Delete country error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
