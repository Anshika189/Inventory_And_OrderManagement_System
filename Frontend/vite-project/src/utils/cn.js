import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with Tailwind-aware merging.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
