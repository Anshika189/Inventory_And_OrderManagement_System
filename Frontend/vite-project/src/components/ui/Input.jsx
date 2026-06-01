import { forwardRef } from "react";
import { cn } from "@/utils/cn";

export const Input = forwardRef(function Input(
  { className, error, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, error, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  );
});

export function Label({ className, children, ...props }) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-foreground/90 leading-none",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-xs text-destructive mt-1 animate-fade-in">{children}</p>;
}

export function FieldDescription({ children }) {
  if (!children) return null;
  return <p className="text-xs text-muted-foreground mt-1">{children}</p>;
}
