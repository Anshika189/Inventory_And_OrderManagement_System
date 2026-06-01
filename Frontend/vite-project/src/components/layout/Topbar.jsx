import { Menu, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useUIStore } from "@/store/uiStore";

export default function Topbar() {
  const { isDark, toggle } = useThemeContext();
  const openPalette = useUIStore((s) => s.openPalette);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <button
        onClick={openPalette}
        className="group flex flex-1 items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search products, customers, orders…</span>
        <span className="sm:hidden">Search…</span>
        <kbd className="ml-auto hidden items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label="Toggle theme"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </header>
  );
}
