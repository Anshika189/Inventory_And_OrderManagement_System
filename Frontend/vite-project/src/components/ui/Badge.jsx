import { cn } from "@/utils/cn";

export function Badge({
  children,
  variant = "default",
  className,
  dot = false,
  ...props
}) {
  const variants = {
    default: "bg-secondary text-secondary-foreground border-border",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    destructive: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    info: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    outline: "border-border text-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "destructive" && "bg-rose-500",
            variant === "info" && "bg-sky-500",
            variant === "primary" && "bg-primary",
            variant === "default" && "bg-muted-foreground"
          )}
        />
      )}
      {children}
    </span>
  );
}
