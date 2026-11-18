import "./config/env.js";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { getSafeErrorDetails } from "./utils/safeErrorDetails.js";

const port = Number(process.env.PORT) || 5000;

const logError = (context, error) => {
  const { name, code, message } = getSafeErrorDetails(error);
  console.error(`${context} (${name}, code ${code}): ${message}`);
};

const listen = () =>
  new Promise((resolve, reject) => {
    const server = app.listen(port);
    server.once("error", reject);
    server.once("listening", () => resolve(server));
  });

const startServer = async () => {
  try {
    await connectDB();
    const server = await listen();
    console.info(`FlowForge server listening on port ${port}`);

    let isShuttingDown = false;
    const shutdown = (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.info(`${signal} received; shutting down FlowForge server.`);

      server.close(async (error) => {
        if (error) {
          logError("HTTP server shutdown failed", error);
          process.exitCode = 1;
        }

        try {
          await mongoose.disconnect();
          console.info("MongoDB connection closed.");
        } catch (disconnectError) {
          logError("MongoDB shutdown failed", disconnectError);
          process.exitCode = 1;
        }
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logError("Server startup failed", error);

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      logError("MongoDB cleanup after startup failure failed", disconnectError);
    }

    process.exitCode = 1;
  }
};

startServer();
