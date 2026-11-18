import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);
app.use(express.json());

export default app;
