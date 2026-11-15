
import {
  insertCountry,
  findAllCountries,
  findCountriesPaginated,
  countCountries,
  findCountryById,
  deleteCountryById,
  updateCountry
} from "../repositories/country.repository.js";

export async function createCountryService(name: string) {
  return insertCountry(name.trim());
}

export async function getCountriesService(
  pagination?: {
    page: number;
    size: number;
  }
) {
  const total = await countCountries();

  if (!pagination) {
    const countries = await findAllCountries();

    return {
      total,
      data: countries,
    };
  }

  const { page, size } = pagination;
  const offset = (page - 1) * size;

  if (!Number.isSafeInteger(offset)) {
    throw new RangeError("Pagination offset is too large");
  }

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

export async function deleteCountryByIdService(id: number) {
    return deleteCountryById(id);
}

export async function getCountryByIdService(id: number) {
  return findCountryById(id);
}

export async function updateCountryService(id: number, name: string) {
    const country = await findCountryById(id);

    if (!country) {
        return null;
    }

    const trimmedName = name.trim();

    if (country.name === trimmedName) {
        return country;
    }

    return updateCountry(id, trimmedName);
}