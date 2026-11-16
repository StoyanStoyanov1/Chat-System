
import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";

import {
  countryBodySchema,
  countryParamsSchema,
  countryQuerySchema,
} from "../schemas/country.schema.js";

import {
  createCountryService,
  getCountriesService,
  getCountryByIdService,
  updateCountryService,
  deleteCountryByIdService,
} from "../services/country.service.js";

export async function createCountry(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = countryBodySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      400,
      "Invalid country data",
      parsed.error.issues
    );
  }

  const country = await createCountryService(parsed.data.name);

  res.status(201).json(country);
}

export async function getCountries(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = countryQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(
      400,
      "Invalid pagination parameters",
      parsed.error.issues
    );
  }

  const hasPagination =
    req.query.page !== undefined ||
    req.query.size !== undefined;

  if (!hasPagination) {
    const result = await getCountriesService();

    res.status(200).json(result);
    return;
  }

  const { page, size } = parsed.data;
  const offset = (page - 1) * size;

  if (
    !Number.isSafeInteger(offset) ||
    offset > 2147483647
  ) {
    throw new AppError(
      400,
      "Pagination offset is too large"
    );
  }

  const result = await getCountriesService({
    page,
    size,
  });

  res.status(200).json(result);
}

export async function getCountryById(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = countryParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new AppError(
      400,
      "Invalid country ID",
      parsed.error.issues
    );
  }

  const country = await getCountryByIdService(parsed.data.id);

  if (!country) {
    throw new AppError(404, "Country not found");
  }

  res.status(200).json({ country });
}

// UPDATE
export async function updateCountry(
  req: Request,
  res: Response
): Promise<void> {
  const params = countryParamsSchema.safeParse(req.params);
  const body = countryBodySchema.safeParse(req.body);

  if (!params.success || !body.success) {
    throw new AppError(
      400,
      "Invalid country data",
      [
        ...(!params.success ? params.error.issues : []),
        ...(!body.success ? body.error.issues : []),
      ]
    );
  }

  const country = await updateCountryService(
    params.data.id,
    body.data.name
  );

  if (!country) {
    throw new AppError(404, "Country not found");
  }

  res.status(200).json({
    data: country,
  });
}

export async function deleteCountryById(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = countryParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    throw new AppError(
      400,
      "Invalid country ID",
      parsed.error.issues
    );
  }

  await deleteCountryByIdService(parsed.data.id);

  res.status(204).send();
}
