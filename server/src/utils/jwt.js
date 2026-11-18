import jwt from "jsonwebtoken";
import { httpError } from "./httpError.js";

const issuer = "flowforge-api";
const audience = "flowforge-client";

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw httpError(
      500,
      "JWT_SECRET must be configured with at least 32 characters.",
    );
  }

  return secret;
};

export const signAccessToken = (userId) =>
  jwt.sign({ sub: userId.toString() }, getJwtSecret(), {
    expiresIn: "7d",
    issuer,
    audience,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, getJwtSecret(), { issuer, audience });
