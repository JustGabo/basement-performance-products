"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const stored = window.localStorage.getItem("basement-theme");
      const initial = stored === "light" || stored === "dark" ? stored : "dark";
      setTheme(initial);
      applyTheme(initial);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    toggleTheme() {
      setTheme((current) => {
        const next = current === "dark" ? "light" : "dark";
        window.localStorage.setItem("basement-theme", next);
        applyTheme(next);
        return next;
      });
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider.");
  return context;
}
