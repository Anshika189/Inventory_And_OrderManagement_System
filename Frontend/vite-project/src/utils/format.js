import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatCurrency(value, currency = "USD") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(Number(value));
}

export function formatDate(input, pattern = "MMM d, yyyy") {
  if (!input) return "—";
  const date = typeof input === "string" ? parseISO(input) : input;
  return format(date, pattern);
}

export function formatDateTime(input) {
  return formatDate(input, "MMM d, yyyy · HH:mm");
}

export function timeAgo(input) {
  if (!input) return "—";
  const date = typeof input === "string" ? parseISO(input) : input;
  return formatDistanceToNow(date, { addSuffix: true });
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
