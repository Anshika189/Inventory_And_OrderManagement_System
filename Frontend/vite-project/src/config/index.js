/**
 * Application configuration.
 * Reads from Vite env vars; never hardcodes runtime URLs in source.
 */

export const APP_NAME = "InventoryFlow Pro";
export const APP_VERSION = "1.0.0";

const rawApi = import.meta.env.VITE_API_URL || "/api";
// When the value is an absolute URL, use it as-is. Otherwise treat as a
// relative path so the dev proxy / nginx pass-through handles routing.
export const API_BASE_URL = rawApi.startsWith("http")
  ? rawApi.replace(/\/+$/, "")
  : rawApi.startsWith("/")
    ? rawApi
    : `/${rawApi}`;

export const DEFAULT_PAGE_SIZE = 10;
export const LOW_STOCK_THRESHOLD = 10;
