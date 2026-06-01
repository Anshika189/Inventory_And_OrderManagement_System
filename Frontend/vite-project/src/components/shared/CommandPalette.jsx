import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Plus,
  Moon,
  Sun,
  Search,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useThemeContext } from "@/contexts/ThemeContext";
import { cn } from "@/utils/cn";

const COMMANDS = [
  { id: "go-dashboard", label: "Go to Dashboard", icon: LayoutDashboard, action: (navigate) => navigate("/") },
  { id: "go-products", label: "Go to Products", icon: Package, action: (navigate) => navigate("/products") },
  { id: "go-customers", label: "Go to Customers", icon: Users, action: (navigate) => navigate("/customers") },
  { id: "go-orders", label: "Go to Orders", icon: ShoppingCart, action: (navigate) => navigate("/orders") },
  { id: "new-product", label: "Create new product", icon: Plus, action: (navigate) => navigate("/products/new") },
  { id: "new-customer", label: "Create new customer", icon: Plus, action: (navigate) => navigate("/customers/new") },
  { id: "new-order", label: "Create new order", icon: Plus, action: (navigate) => navigate("/orders/new") },
  { id: "toggle-theme", label: "Toggle dark / light mode", icon: Moon, action: (_, ctx) => ctx.toggle() },
];

export default function CommandPalette() {
  const open = useUIStore((s) => s.paletteOpen);
  const close = useUIStore((s) => s.closePalette);
  const navigate = useNavigate();
  const themeCtx = useThemeContext();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) => c.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function runCommand(cmd) {
    close();
    cmd.action(navigate, themeCtx);
  }

  function onKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) runCommand(cmd);
    } else if (event.key === "Escape") {
      close();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-start pt-[10vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a command or search…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                ESC
              </kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No commands match “{query}”
                </li>
              )}
              {filtered.map((cmd, i) => {
                const Icon = cmd.icon === Moon && !themeCtx.isDark ? Sun : cmd.icon;
                return (
                  <li key={cmd.id}>
                    <button
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => runCommand(cmd)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        i === activeIndex
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{cmd.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
