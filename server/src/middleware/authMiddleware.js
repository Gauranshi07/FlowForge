import mongoose from "mongoose";
import { verifyAccessToken } from "../utils/jwt.js";

const unauthorized = (res) =>
  res.status(401).json({
    status: "error",
    message: "Invalid or missing authentication token.",
  });

export const requireAuth = (req, res, next) => {
  const authorization = req.get("authorization") || "";
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);
  if (!match) return unauthorized(res);

  let payload;
  try {
    payload = verifyAccessToken(match[1]);
  } catch (error) {
    if (error?.statusCode === 500) return next(error);
    return unauthorized(res);
  }

  if (
    typeof payload === "string" ||
    typeof payload.sub !== "string" ||
    !mongoose.isValidObjectId(payload.sub)
  ) {
    return unauthorized(res);
  }

  req.auth = { userId: payload.sub };
  next();
};
