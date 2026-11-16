import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

import {
  createCountry,
  getCountries,
  getCountryById,
  updateCountry,
  deleteCountryById,
} from "../controllers/country.controller.js";

const router = Router();

router.post("/", asyncHandler(createCountry));
router.get("/", asyncHandler(getCountries));
router.get("/:id", asyncHandler(getCountryById));
router.put("/:id", asyncHandler(updateCountry));
router.delete("/:id", asyncHandler(deleteCountryById));

export default router;