const redactCredential = (message, value) => {
  if (!value) return message;

  let decodedValue = value;
  try {
    decodedValue = decodeURIComponent(value);
  } catch {
    decodedValue = value;
  }

  return [value, decodedValue].reduce(
    (result, candidate) =>
      candidate ? result.split(candidate).join("[REDACTED]") : result,
    message,
  );
};

const getErrorCode = (error) => {
  const visited = new Set();
  let current = error;

  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current);

    if (current.code != null) return current.code;
    if (current.codeName) return current.codeName;

    const topologyServers = current.reason?.servers;
    const serverError =
      typeof topologyServers?.values === "function"
        ? topologyServers.values().next().value?.error
        : undefined;

    current = current.cause ?? serverError;
  }

  return "N/A";
};

export const getSafeErrorDetails = (error) => {
  let message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    message = message.split(mongoUri).join("[REDACTED_MONGODB_URI]");

    const userInfo = mongoUri.match(
      /^mongodb(?:\+srv)?:\/\/([^@/]+)@/i,
    )?.[1];
    if (userInfo) {
      for (const credential of userInfo.split(":")) {
        message = redactCredential(message, credential);
      }
    }
  }

  message = message.replace(
    /mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi,
    "[REDACTED_MONGODB_URI]",
  );

  return {
    name: error instanceof Error ? error.name : "Error",
    code: getErrorCode(error),
    message,
  };
};
