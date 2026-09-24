"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return <button className={`grid cursor-pointer place-items-center rounded-full border border-foreground/20 bg-panel/75 transition hover:border-brand hover:text-brand ${compact ? "size-8" : "size-10"}`} type="button" onClick={toggleTheme} aria-label={`Switch to ${nextTheme} mode`} title={`Switch to ${nextTheme} mode`}>
    {theme === "dark" ? <Sun size={compact ? 15 : 18} /> : <Moon size={compact ? 15 : 18} />}
  </button>;
}
