import { cn } from "@/utils/cn";

export function Progress({ value = 0, max = 100, className, tone = "primary" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const tones = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    destructive: "bg-rose-500",
  };
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full transition-all duration-500", tones[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
