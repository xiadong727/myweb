"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, X, Mail } from "lucide-react";
import { TreeNav } from "@/components/tree-nav";
import { GlobalSearch } from "@/components/global-search";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { SiteNavigation, SectionKey } from "@/lib/types";
import {
  SIDEBAR_COLLAPSED_KEY,
  clampSidebarWidthPx,
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_KEY,
} from "@/lib/sidebar";

const order: SectionKey[] = ["articles", "images", "videos", "audios"];

function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  if (document.documentElement.getAttribute("data-sidebar") === "collapsed") return true;
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function readSidebarWidthPx(): number {
  if (typeof window === "undefined") return SIDEBAR_WIDTH_DEFAULT;
  try {
    const raw = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (!raw) return clampSidebarWidthPx(SIDEBAR_WIDTH_DEFAULT, window.innerWidth);
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return clampSidebarWidthPx(SIDEBAR_WIDTH_DEFAULT, window.innerWidth);
    return clampSidebarWidthPx(n, window.innerWidth);
  } catch {
    return clampSidebarWidthPx(SIDEBAR_WIDTH_DEFAULT, window.innerWidth);
  }
}

function NavigationBlock({
  nav,
  mobile,
  onNavigate,
}: {
  nav: SiteNavigation;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className={mobile ? "space-y-8" : "space-y-8 pr-1"}>
      {order.map((key) => {
        const section = nav.trees[key];
        return (
          <div key={key}>
            <div className="mb-3 flex items-center gap-3 px-1">
              <div className="h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
              <Link
                href={`/${key}`}
                onClick={onNavigate}
                className="text-[15px] font-bold uppercase tracking-widest text-foreground/90 transition-colors hover:text-primary"
              >
                {section.label}
              </Link>
              <span className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            </div>
            <TreeNav section={key} nodes={section.nodes} />
          </div>
        );
      })}
      <div className="border-t border-border pt-6">
        <Link
          href="/contact"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary transition hover:border-primary/45 hover:bg-primary/10"
        >
          <Mail className="h-4 w-4" />
          联系我
        </Link>
      </div>
    </div>
  );
}

export function SiteChrome({
  nav,
  children,
}: {
  nav: SiteNavigation;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidthPx, setSidebarWidthPx] = useState(SIDEBAR_WIDTH_DEFAULT);
  const [resizing, setResizing] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(SIDEBAR_WIDTH_DEFAULT);
  const dragging = useRef(false);

  /* Hydration 后与 localStorage / data-sidebar 对齐（服务端无法读取） */
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- 仅从外部存储同步初始折叠态与侧栏宽度 */
    setSidebarCollapsed(readSidebarCollapsed());
    setSidebarWidthPx(readSidebarWidthPx());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (collapsed) document.documentElement.setAttribute("data-sidebar", "collapsed");
    else document.documentElement.removeAttribute("data-sidebar");
  }, []);

  const persistWidth = useCallback((w: number) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
    const clamped = clampSidebarWidthPx(w, vw);
    setSidebarWidthPx(clamped);
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(clamped));
    } catch {
      /* ignore */
    }
    return clamped;
  }, []);

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (sidebarCollapsed) return;
      e.preventDefault();
      dragging.current = true;
      setResizing(true);
      dragStartX.current = e.clientX;
      dragStartWidth.current = sidebarWidthPx;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [sidebarCollapsed, sidebarWidthPx],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - dragStartX.current;
      persistWidth(dragStartWidth.current + delta);
    };
    const endDrag = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [persistWidth]);

  useEffect(() => {
    const onResize = () => {
      if (typeof window === "undefined") return;
      setSidebarWidthPx((prev) => {
        const next = clampSidebarWidthPx(prev, window.innerWidth);
        try {
          localStorage.setItem(SIDEBAR_WIDTH_KEY, String(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside
        className={`relative hidden shrink-0 overflow-hidden lg:block ${
          resizing ? "" : "transition-[width] duration-300 ease-out"
        }`}
        style={{
          width: sidebarCollapsed ? 0 : sidebarWidthPx,
          boxShadow: sidebarCollapsed ? undefined : "var(--aside-glow)",
        }}
      >
        <div className="flex h-screen w-full min-w-0 flex-col gap-5 overflow-y-auto border-r border-border bg-[var(--aside)] px-3 py-6">
          <div className="flex items-start justify-between gap-2 px-1">
            <Link href="/" className="group min-w-0 flex-1">
              <div className="text-xl font-bold tracking-widest text-foreground transition-colors duration-300 group-hover:text-primary">
                {nav.site.title}
              </div>
              <div className="mt-1.5 text-xs font-medium tracking-wider text-muted-foreground/80">{nav.site.tagline}</div>
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="mt-0.5 shrink-0 rounded-lg border border-border bg-card/50 p-1.5 text-muted-foreground transition hover:border-primary/30 hover:bg-muted hover:text-foreground"
              title="收起侧栏"
              aria-label="收起侧栏"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          <NavigationBlock nav={nav} />
        </div>
        {!sidebarCollapsed ? (
          <button
            type="button"
            aria-label="拖动调整侧栏宽度"
            title="拖动调整侧栏宽度"
            onPointerDown={onResizePointerDown}
            className="group absolute right-0 top-0 z-10 hidden h-full w-3 translate-x-1/2 cursor-col-resize touch-none select-none lg:block"
          >
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover:bg-primary/50" />
            <span className="absolute inset-y-24 left-1/2 w-1 -translate-x-1/2 rounded-full bg-border/90 opacity-80 transition-colors group-hover:bg-primary/35" />
          </button>
        ) : null}
      </aside>

      {sidebarCollapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="fixed left-0 top-28 z-40 hidden rounded-r-lg border border-border border-l-0 bg-[var(--aside)] px-1.5 py-3 text-primary shadow-md backdrop-blur-sm transition hover:bg-muted lg:flex"
          title="展开导航"
          aria-label="展开侧栏"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      ) : null}

      {drawer ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
            aria-label="关闭菜单"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-r border-border bg-[var(--aside)] shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="text-sm font-semibold text-foreground">导航</span>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <NavigationBlock nav={nav} mobile onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 lg:justify-end">
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setDrawer(true)}
            aria-label="打开菜单"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="truncate text-sm font-semibold text-foreground lg:hidden">
            {nav.site.title}
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <GlobalSearch />
            <ThemeSwitcher />
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
