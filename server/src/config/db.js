import mongoose from "mongoose";

export const connectDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Create server/.env from .env.example and set the variable.",
    );
  }

  await mongoose.connect(MONGODB_URI);
  console.info("MongoDB connected successfully.");
};
