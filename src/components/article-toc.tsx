"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import type { TocItem } from "@/lib/toc";

/** 文章目录：锚点跳转 + 滚动时高亮当前章节 */
export function ArticleToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!items.length) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="文章目录"
      className="mb-8 rounded-xl border border-border bg-muted/30 p-4 text-sm"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 font-semibold text-foreground/80"
      >
        <List className="h-4 w-4 text-primary" />
        目录
        <span className="ml-auto text-xs font-normal text-muted-foreground">
          {open ? "收起" : "展开"}
        </span>
      </button>
      {open ? (
        <ul className="mt-3 space-y-1.5">
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <li key={item.id} style={{ paddingLeft: item.depth === 3 ? 16 : 0 }}>
                <a
                  href={`#${item.id}`}
                  className={`block border-l-2 py-0.5 pl-3 transition ${
                    active
                      ? "border-primary font-medium text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </nav>
  );
}
