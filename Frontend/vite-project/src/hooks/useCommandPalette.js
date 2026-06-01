import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";

/**
 * Listens for the global ⌘K / Ctrl+K shortcut and toggles the
 * command palette.
 */
export function useCommandPaletteHotkey() {
  const toggle = useUIStore((s) => s.togglePalette);
  useEffect(() => {
    function handler(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);
}
