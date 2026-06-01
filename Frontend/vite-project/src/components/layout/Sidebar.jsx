import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useUIStore } from "@/store/uiStore";
import { APP_NAME } from "@/config";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
];

export default function Sidebar() {
  const open = useUIStore((s) => s.sidebarOpen);
  const close = useUIStore((s) => s.closeSidebar);
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 text-white shadow-glow">
              <Boxes className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">{APP_NAME}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> v1.0
              </p>
            </div>
          </div>
          <button
            className="rounded-md p-1 text-muted-foreground hover:bg-accent lg:hidden"
            onClick={close}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map(({ to, label, icon: Icon, end }) => {
            const active = end
              ? location.pathname === to
              : location.pathname === to || location.pathname.startsWith(`${to}/`);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={close}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="m-4 rounded-xl border border-border bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-rose-500/10 p-4 text-xs">
          <p className="font-semibold text-foreground">Pro tip</p>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            Press <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">⌘K</kbd> to
            open the command palette.
          </p>
        </div>
      </aside>
    </>
  );
}
