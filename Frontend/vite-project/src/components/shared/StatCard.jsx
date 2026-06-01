import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";

const toneStyles = {
  primary: "from-indigo-500 to-fuchsia-500",
  success: "from-emerald-500 to-teal-500",
  warning: "from-amber-500 to-rose-500",
  info: "from-sky-500 to-indigo-500",
  destructive: "from-rose-500 to-pink-500",
  violet: "from-violet-500 to-purple-500",
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  delta,
  index = 0,
  loading,
}) {
  const positive = typeof delta === "number" ? delta >= 0 : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-md"
    >
      <div
        className={cn(
          "absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-20",
          toneStyles[tone]
        )}
      />
      <div className="relative flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <div
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-white shadow-soft",
              toneStyles[tone]
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="relative mt-3 flex items-baseline gap-2">
        {loading ? (
          <div className="skeleton h-8 w-32" />
        ) : (
          <p className="text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
        )}
        {positive !== null && !loading && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
              positive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}
