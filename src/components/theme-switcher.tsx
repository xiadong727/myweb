"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import type { ThemeId } from "@/lib/themes";
import { THEME_IDS, themes } from "@/lib/themes";
import { useTheme } from "@/components/theme-provider";

export function ThemeSwitcher() {
  const { theme, setTheme, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="切换主题"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden max-w-[5.5rem] truncate sm:inline">
          {mounted ? themes[theme].label : "主题"}
        </span>
      </button>

      {open ? (
        <ul
          className="absolute right-0 z-50 mt-1.5 max-h-[min(70vh,22rem)] w-[min(calc(100vw-2rem),17rem)] overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
          role="listbox"
        >
          {THEME_IDS.map((id) => (
            <li key={id} role="option" aria-selected={theme === id}>
              <button
                type="button"
                onClick={() => {
                  setTheme(id as ThemeId);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-muted"
              >
                <span className="mt-0.5 text-primary">
                  {theme === id ? <Check className="h-4 w-4" /> : <span className="inline-block w-4" />}
                </span>
                <span>
                  <span className="block font-medium text-foreground">{themes[id].label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{themes[id].description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
