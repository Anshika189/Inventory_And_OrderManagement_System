/**
 * Pure helper: classify a stock quantity for badge styling.
 */
export function stockStatus(quantity, threshold = 10) {
  if (quantity <= 0) return "out";
  if (quantity <= Math.max(2, Math.floor(threshold * 0.3))) return "critical";
  if (quantity <= threshold) return "low";
  return "healthy";
}

export const stockTone = {
  healthy: {
    label: "Healthy",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  low: {
    label: "Low stock",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  critical: {
    label: "Critical",
    dot: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  out: {
    label: "Out of stock",
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
};

export const orderStatusTone = {
  pending: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
    dot: "bg-sky-500",
  },
  shipped: {
    label: "Shipped",
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    dot: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
  },
};
