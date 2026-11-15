import { Router } from "express";

import {
  createCountry,
  getCountries,
  getCountryById,
  deleteCountryById,
  updateCountry
} from "../controllers/country.controller.js";

const router = Router();

router.post("/", createCountry);
router.get("/", getCountries);
router.get("/:id", getCountryById);
router.delete("/:id", deleteCountryById)
router.put("/:id", updateCountry)

export default router;