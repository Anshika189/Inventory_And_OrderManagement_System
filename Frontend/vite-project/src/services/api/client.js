import axios from "axios";
import { API_BASE_URL } from "@/config";

/**
 * Centralized axios client.
 * - Injects base URL
 * - Unwraps the standardized API envelope (`{success, data, message, errors}`)
 * - Surfaces a clean Error object for the React Query layer
 */
export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

export class ApiError extends Error {
  constructor({ message, code, status, errors }) {
    super(message);
    this.name = "ApiError";
    this.code = code || "unknown";
    this.status = status;
    this.errors = errors || [];
  }
}

http.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body) {
      if (!body.success) {
        throw new ApiError({
          message: body.message || "Request failed",
          code: body.code,
          status: response.status,
          errors: body.errors,
        });
      }
      return body.data;
    }
    return body;
  },
  (error) => {
    if (error.response) {
      const { data, status } = error.response;
      const message =
        data?.message ||
        (status === 404 ? "Resource not found" : "Request failed");
      throw new ApiError({
        message,
        code: data?.code || "http_error",
        status,
        errors: data?.errors || [],
      });
    }
    if (error.request) {
      throw new ApiError({
        message: "Network error — please check your connection",
        code: "network_error",
        status: 0,
      });
    }
    throw new ApiError({
      message: error.message || "Unknown error",
      code: "client_error",
    });
  }
);
