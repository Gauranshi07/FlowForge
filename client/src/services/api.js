import axios from "axios";
import { getAuthToken } from "../utils/authToken.js";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const api = axios.create({
  baseURL: (configuredBaseUrl || "http://localhost:5000/api").replace(/\/+$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiErrorMessage = (error, fallbackMessage) => {
  const message = error?.response?.data?.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  if (!error?.response) {
    return "Unable to reach FlowForge. Check that the backend is running and try again.";
  }
  return fallbackMessage;
};
