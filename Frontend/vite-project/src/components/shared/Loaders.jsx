import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export function Spinner({ className }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Spinner className="h-6 w-6 text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse-soft">{label}</p>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="skeleton h-3 w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </>
  );
}

export function CardSkeleton({ className }) {
  return (
    <div className={cn("card-soft p-6 space-y-3", className)}>
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-7 w-2/3" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}
