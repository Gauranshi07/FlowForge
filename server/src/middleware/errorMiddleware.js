import { getSafeErrorDetails } from "../utils/safeErrorDetails.js";

export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  const requestedStatus = Number(error.statusCode || error.status);
  const statusCode =
    Number.isInteger(requestedStatus) &&
    requestedStatus >= 400 &&
    requestedStatus < 600
      ? requestedStatus
      : 500;

  if (statusCode >= 500) {
    const { name, code, message } = getSafeErrorDetails(error);
    console.error(`Request failed (${name}, code ${code}): ${message}`);
  }

  res.status(statusCode).json({
    status: "error",
    message:
      statusCode >= 500
        ? "Internal server error"
        : error.type === "entity.parse.failed"
          ? "Request body must contain valid JSON."
          : error.message,
  });
};
