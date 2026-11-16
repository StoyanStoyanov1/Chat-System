
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

import {
  insertCountry,
  findAllCountries,
  findCountriesPaginated,
  countCountries,
  findCountryById,
  updateCountry,
  deleteCountryById,
} from "../repositories/country.repository.js";

const COUNTRIES_CACHE_KEY = "countries:all";
const CACHE_TTL = 60;

async function invalidateCountriesCache(): Promise<void> {
  try {
    await redis.del(COUNTRIES_CACHE_KEY);

    logger.debug(
      { cacheKey: COUNTRIES_CACHE_KEY },
      "Countries cache invalidated"
    );
  } catch (error) {
    logger.warn(
      { err: error, cacheKey: COUNTRIES_CACHE_KEY },
      "Failed to invalidate countries cache"
    );
  }
}

export async function createCountryService(name: string) {
  const country = await insertCountry(name.trim());

  logger.info(
    { countryId: country.id },
    "Country created"
  );

  await invalidateCountriesCache();

  return country;
}

export async function getCountriesService(
  pagination?: {
    page: number;
    size: number;
  }
) {
  if (!pagination) {
    try {
      const cached = await redis.get(COUNTRIES_CACHE_KEY);

      if (cached !== null) {
        logger.debug(
          { cacheKey: COUNTRIES_CACHE_KEY },
          "Countries cache HIT"
        );

        return JSON.parse(cached);
      }
    } catch (error) {
      logger.warn(
        { err: error, cacheKey: COUNTRIES_CACHE_KEY },
        "Failed to read countries cache"
      );
    }

    logger.debug(
      { cacheKey: COUNTRIES_CACHE_KEY },
      "Countries cache MISS"
    );

    const countries = await findAllCountries();

    const result = {
      total: countries.length,
      data: countries,
    };

    try {
      await redis.set(
        COUNTRIES_CACHE_KEY,
        JSON.stringify(result),
        { EX: CACHE_TTL }
      );

      logger.debug(
        {
          cacheKey: COUNTRIES_CACHE_KEY,
          ttl: CACHE_TTL,
        },
        "Countries cached successfully"
      );
    } catch (error) {
      logger.warn(
        { err: error, cacheKey: COUNTRIES_CACHE_KEY },
        "Failed to write countries cache"
      );
    }

    return result;
  }

  const { page, size } = pagination;
  const offset = (page - 1) * size;

  const total = await countCountries();

  const countries = await findCountriesPaginated(
    size,
    offset
  );

  logger.debug(
    {
      page,
      size,
      total,
    },
    "Countries retrieved with pagination"
  );

  return {
    total,
    data: countries,
    pagination: {
      page,
      size,
      totalPages: Math.ceil(total / size),
    },
  };
}

// GET BY ID
export async function getCountryByIdService(id: number) {
  return findCountryById(id);
}

export async function updateCountryService(
  id: number,
  name: string
) {
  const country = await findCountryById(id);

  if (!country) {
    return null;
  }

  const trimmedName = name.trim();

  if (country.name === trimmedName) {
    logger.debug(
      { countryId: id },
      "Country update skipped: no changes"
    );

    return country;
  }

  const updatedCountry = await updateCountry(
    id,
    trimmedName
  );

  logger.info(
    { countryId: id },
    "Country updated"
  );

  await invalidateCountriesCache();

  return updatedCountry;
}

export async function deleteCountryByIdService(id: number) {
  const deletedCountry = await deleteCountryById(id);

  logger.info(
    { countryId: id },
    "Country deleted"
  );

  await invalidateCountriesCache();

  return deletedCountry;
}
