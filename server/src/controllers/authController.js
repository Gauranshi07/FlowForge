import User from "../models/User.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import {
  validateLoginInput,
  validateRegistrationInput,
} from "../utils/authValidation.js";
import { getJwtSecret, signAccessToken } from "../utils/jwt.js";

const invalidCredentials = () =>
  httpError(401, "Invalid email or password.");

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatar: user.avatar ?? null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const authResponse = (user, token) => ({
  status: "success",
  data: {
    user: publicUser(user),
    token,
  },
});

export const register = asyncHandler(async (req, res) => {
  const input = validateRegistrationInput(req.body);
  getJwtSecret();

  if (await User.exists({ email: input.email })) {
    throw httpError(409, "An account with this email already exists.");
  }

  const user = new User(input);
  try {
    await user.save();
  } catch (error) {
    if (error?.code === 11000) {
      throw httpError(409, "An account with this email already exists.");
    }
    throw error;
  }

  res.status(201).json(authResponse(user, signAccessToken(user._id)));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = validateLoginInput(req.body);
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw invalidCredentials();
  }

  res.status(200).json(authResponse(user, signAccessToken(user._id)));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.userId);
  if (!user) {
    throw httpError(401, "Invalid or missing authentication token.");
  }

  res.status(200).json({
    status: "success",
    data: { user: publicUser(user) },
  });
});
