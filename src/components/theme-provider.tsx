"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ThemeId } from "@/lib/themes";
import { THEME_STORAGE_KEY, isThemeId } from "@/lib/themes";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readTheme(): ThemeId {
  if (typeof window === "undefined") return "warm";
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeId(v)) return v;
  } catch {
    /* ignore */
  }
  return "warm";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("warm");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = readTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 与 ThemeScript/localStorage 对齐
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
