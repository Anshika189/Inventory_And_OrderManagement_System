import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "./Button";

export function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < pages;

  const items = [];
  // Show first, last, current and 2 around.
  const range = new Set([1, pages, page - 1, page, page + 1]);
  for (let i = 1; i <= pages; i += 1) {
    if (range.has(i)) items.push(i);
    else if (items[items.length - 1] !== "…") items.push("…");
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {items.map((it, idx) =>
        it === "…" ? (
          <span
            key={`dots-${idx}`}
            className="px-2 text-muted-foreground select-none"
          >
            …
          </span>
        ) : (
          <button
            key={it}
            onClick={() => onPageChange(it)}
            className={cn(
              "h-9 min-w-9 px-2 rounded-md text-sm font-medium transition-colors",
              it === page
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-current={it === page ? "page" : undefined}
          >
            {it}
          </button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
