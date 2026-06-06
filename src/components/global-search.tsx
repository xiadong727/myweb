"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";
import { Search, X } from "lucide-react";

type Hit = { id: string; title: string; href: string; type: string };

const typeLabel: Record<string, string> = {
  article: "文章",
  image: "图片",
  video: "视频",
  audio: "音频",
};

// \u4e2d\u6587\u4e8c\u5143\u5206\u8bcd\uff08bigram\uff09\u3002\u26a0\ufe0f \u5fc5\u987b\u4e0e scripts/build-search-index.mjs \u4e2d\u7684 tokenize \u5b8c\u5168\u4e00\u81f4\u3002
const tokenize = (string: string) => {
  const tokens: string[] = [];
  const re = /[\u4e00-\u9fff]+|[a-z0-9]+/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(string.toLowerCase())) !== null) {
    const seg = m[0];
    if (/[\u4e00-\u9fff]/.test(seg)) {
      if (seg.length === 1) tokens.push(seg);
      else for (let i = 0; i < seg.length - 1; i++) tokens.push(seg.slice(i, i + 2));
    } else {
      tokens.push(seg);
    }
  }
  return tokens;
};

/** 在标题里高亮命中的查询词（用分词后的词/二元组做字符级掩码，自动处理重叠） */
function highlightTitle(title: string, terms: string[]) {
  if (!terms.length || !title) return title;
  const lower = title.toLowerCase();
  const mask = new Array(title.length).fill(false);
  for (const t of terms) {
    if (!t) continue;
    let from = 0;
    let idx = lower.indexOf(t, from);
    while (idx !== -1) {
      for (let i = idx; i < idx + t.length; i++) mask[i] = true;
      from = idx + 1;
      idx = lower.indexOf(t, from);
    }
  }
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < title.length) {
    const on = mask[i];
    let j = i;
    while (j < title.length && mask[j] === on) j++;
    const chunk = title.slice(i, j);
    nodes.push(
      on ? (
        <mark key={i} className="rounded bg-primary/20 px-0.5 font-semibold text-primary">
          {chunk}
        </mark>
      ) : (
        <span key={i}>{chunk}</span>
      ),
    );
    i = j;
  }
  return nodes;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [searchEngine, setSearchEngine] = useState<MiniSearch | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/search-index.json");
        if (!res.ok) return;
        const text = await res.text();
        if (cancelled) return;
        const ms = MiniSearch.loadJSON(text, {
          fields: ["title", "text"],
          storeFields: ["title", "href", "type"],
          idField: "id",
          tokenize,
        });
        setSearchEngine(ms);
      } catch {
        setSearchEngine(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const results: Hit[] = useMemo(() => {
    if (!searchEngine || !q.trim()) return [];
    return searchEngine
      .search(q, { prefix: true, combineWith: "AND", boost: { title: 3 } })
      .slice(0, 12)
      .map((r) => {
        const s = searchEngine.getStoredFields(r.id);
        return {
          id: String(r.id),
          title: String(s?.title ?? ""),
          href: String(s?.href ?? ""),
          type: String(s?.type ?? ""),
        };
      })
      .filter((h) => h.href);
  }, [q, searchEngine]);

  const onSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQ("");
      router.push(href);
    },
    [router]
  );

  const ready = Boolean(searchEngine);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">搜索...</span>
        <kbd className="ml-1 hidden rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--overlay)] p-4 pt-[12vh] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-[var(--search-popover)] shadow-xl">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-primary" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={ready ? "搜索文章、图集与视频…" : "正在加载索引…"}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-[min(60vh,420px)] overflow-auto py-2">
              {!ready ? (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">加载搜索索引中…</li>
              ) : q.trim() && results.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">没有匹配结果</li>
              ) : (
                results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSelect(r.href)}
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[var(--search-hit)]"
                    >
                      <span className="mt-0.5 shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                        {typeLabel[r.type] ?? r.type}
                      </span>
                      <span className="text-foreground">{highlightTitle(r.title, tokenize(q))}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              构建时生成 <code className="text-primary/90">public/search-index.json</code>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
