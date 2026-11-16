
import type {
  ErrorRequestHandler,
} from "express";

import { Prisma } from "../generated/prisma/client.js";
import { logger } from "../config/logger.js";
import { AppError } from "../errors/AppError.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  next
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  // Expected application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.details !== undefined && {
        errors: error.details,
      }),
    });
    return;
  }

  // Prisma database errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        res.status(409).json({
          message: "Resource already exists",
        });
        return;

      case "P2003":
        res.status(409).json({
          message: "Foreign key constraint violation",
        });
        return;

      case "P2025":
        res.status(404).json({
          message: "Resource not found",
        });
        return;
    }
  }

  // Unexpected errors
  logger.error(
    { err: error, method: req.method, url: req.originalUrl },
    "Unhandled request error"
  );

  res.status(500).json({
    message: "Internal server error",
  });
};
