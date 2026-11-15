
import { prisma } from "../config/prisma.js";

export async function insertCountry(name: string) {
  return prisma.countries.create({
    data: { name },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function findAllCountries() {
  return prisma.countries.findMany({
    orderBy: { id: "asc" },
  });
}

export async function findCountriesPaginated(
  size: number,
  offset: number
) {
  return prisma.countries.findMany({
    skip: offset,
    take: size,
    orderBy: { id: "asc" },
  });
}

export async function countCountries() {
  return prisma.countries.count();
}

export async function findCountryById(id: number) {
  return prisma.countries.findUnique({
    where: { id },
  });
}

export async function deleteCountryById(id: number) {
  return prisma.countries.delete({
    where: { id },
  });
}

export async function updateCountry(id: number, name: string) {
    return prisma.countries.update({
        where: {id},
        data: {name}
    })
}
