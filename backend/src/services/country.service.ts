
import { redis } from "../config/redis.js";

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
  } catch (error) {
    console.error("Redis cache invalidation error:", error);
  }
}

export async function createCountryService(name: string) {
  const country = await insertCountry(name.trim());

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
        console.log("Cache HIT");

        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Redis cache read error:", error);
    }

    console.log("Cache MISS");

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
    } catch (error) {
      console.error("Redis cache write error:", error);
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
    return country;
  }

  const updatedCountry = await updateCountry(
    id,
    trimmedName
  );

  await invalidateCountriesCache();

  return updatedCountry;
}

export async function deleteCountryByIdService(id: number) {
  const deletedCountry = await deleteCountryById(id);

  await invalidateCountriesCache();

  return deletedCountry;
}
