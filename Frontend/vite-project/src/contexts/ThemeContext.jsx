import { createContext, useContext, useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const value = useTheme();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used inside <ThemeProvider>");
  }
  return ctx;
}
