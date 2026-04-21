"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, X, Mail } from "lucide-react";
import { TreeNav } from "@/components/tree-nav";
import { GlobalSearch } from "@/components/global-search";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { SiteNavigation, SectionKey } from "@/lib/types";
import { SIDEBAR_COLLAPSED_KEY } from "@/lib/sidebar";

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

  /* Hydration 后与 localStorage / data-sidebar 对齐（服务端无法读取） */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 仅从外部存储同步初始折叠态
    setSidebarCollapsed(readSidebarCollapsed());
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

  return (
    <div className="flex min-h-screen">
      <aside
        className={`relative hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-out lg:block ${
          sidebarCollapsed ? "w-0" : "w-[min(100%,17.5rem)]"
        }`}
        style={{ boxShadow: sidebarCollapsed ? undefined : "var(--aside-glow)" }}
      >
        <div className="flex h-screen w-[min(100%,17.5rem)] flex-col gap-5 overflow-y-auto border-r border-border bg-[var(--aside)] px-3 py-6">
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
