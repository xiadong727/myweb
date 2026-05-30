"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { NavNode, SectionKey } from "@/lib/types";
import { isNavGroup } from "@/lib/types";

function sectionBase(key: SectionKey) {
  if (key === "articles") return "/articles";
  if (key === "images") return "/images";
  if (key === "audios") return "/audios";
  return "/videos";
}

function NavTree({
  nodes,
  base,
  pathname,
  expanded,
  toggle,
  depth,
}: {
  nodes: NavNode[];
  base: string;
  pathname: string;
  expanded: Set<string>;
  toggle: (id: string) => void;
  depth: number;
}) {
  const indent = depth * 14;
  return (
    <ul className="space-y-0.5">
      {nodes.map((n) => {
        if (isNavGroup(n)) {
          const open = expanded.has(n.id);
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => toggle(n.id)}
                className="flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-[13px] text-foreground/80 transition hover:bg-muted hover:text-foreground"
                style={{ paddingLeft: indent + 8 }}
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
                />
                <span className="font-semibold tracking-wide">{n.title}</span>
              </button>
              {open ? (
                <div className="mt-0.5">
                  {n.children.length > 0 ? (
                    <NavTree
                      nodes={n.children}
                      base={base}
                      pathname={pathname}
                      expanded={expanded}
                      toggle={toggle}
                      depth={depth + 1}
                    />
                  ) : (
                    <p
                      className="py-1.5 pr-2 text-[12px] italic text-muted-foreground/60"
                      style={{ paddingLeft: indent + 28 }}
                    >
                      敬请期待 · 内容建设中…
                    </p>
                  )}
                </div>
              ) : null}
            </li>
          );
        }
        const href = `${base}/${n.slug}`;
        const active = pathname === href;
        return (
          <li key={n.id}>
            <Link
              href={href}
              className={`relative block rounded-md py-1.5 pr-2 text-[13px] leading-snug transition-all duration-300 ${
                active
                  ? "bg-[var(--nav-active-bg)] font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              style={{ paddingLeft: indent + 28 }}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-3.5 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              )}
              {n.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function TreeNavInner({
  section,
  nodes,
  pathname,
}: {
  section: SectionKey;
  nodes: NavNode[];
  pathname: string;
}) {
  const base = sectionBase(section);
  // 进入/刷新时默认只展示第一级目录，所有子目录折叠
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <NavTree
      nodes={nodes}
      base={base}
      pathname={pathname}
      expanded={expanded}
      toggle={toggle}
      depth={0}
    />
  );
}

export function TreeNav({ section, nodes }: { section: SectionKey; nodes: NavNode[] }) {
  const pathname = usePathname();
  return <TreeNavInner key={pathname} section={section} nodes={nodes} pathname={pathname} />;
}
