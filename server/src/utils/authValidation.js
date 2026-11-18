import { httpError } from "./httpError.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maximumPasswordBytes = 72;

const requireObjectBody = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(400, "Request body must be a JSON object.");
  }
};

const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    throw httpError(400, "A valid email address is required.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail.length > 254 ||
    !emailPattern.test(normalizedEmail)
  ) {
    throw httpError(400, "A valid email address is required.");
  }

  return normalizedEmail;
};

const validatePassword = (password) => {
  if (typeof password !== "string" || password.length < 8) {
    throw httpError(400, "Password must be at least 8 characters long.");
  }
  if (Buffer.byteLength(password, "utf8") > maximumPasswordBytes) {
    throw httpError(400, "Password must be 72 UTF-8 bytes or fewer.");
  }
};

const normalizeAvatar = (avatar) => {
  if (avatar === undefined || avatar === null || avatar === "") {
    return undefined;
  }
  if (typeof avatar !== "string") {
    throw httpError(400, "Avatar must be a valid HTTP or HTTPS URL.");
  }

  const value = avatar.trim();
  if (!value || value.length > 2048) {
    throw httpError(400, "Avatar must be a valid HTTP or HTTPS URL.");
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw httpError(400, "Avatar must be a valid HTTP or HTTPS URL.");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw httpError(400, "Avatar must be a valid HTTP or HTTPS URL.");
  }

  return url.toString();
};

export const validateRegistrationInput = (body) => {
  requireObjectBody(body);

  if (typeof body.name !== "string") {
    throw httpError(400, "Name is required.");
  }
  const name = body.name.trim();
  if (!name || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name)) {
    throw httpError(400, "Name must be between 1 and 100 characters.");
  }

  const email = normalizeEmail(body.email);
  validatePassword(body.password);

  return {
    name,
    email,
    password: body.password,
    avatar: normalizeAvatar(body.avatar),
  };
};

export const validateLoginInput = (body) => {
  requireObjectBody(body);
  if (typeof body.email !== "string" || typeof body.password !== "string") {
    throw httpError(400, "Email and password are required.");
  }

  const email = body.email.trim().toLowerCase();
  if (
    !emailPattern.test(email) ||
    email.length > 254 ||
    Buffer.byteLength(body.password, "utf8") > maximumPasswordBytes
  ) {
    throw httpError(401, "Invalid email or password.");
  }

  return { email, password: body.password };
};
