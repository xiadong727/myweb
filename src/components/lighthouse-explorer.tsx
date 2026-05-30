"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LIGHTHOUSE_LAYERS, type DomainGroup, type Layer } from "@/lib/lighthouse-shared";

export function LighthouseExplorer({ domains }: { domains: DomainGroup[] }) {
  const [layer, setLayer] = useState<Layer | null>(null);
  const shown = layer ? domains.filter((d) => d.layer === layer) : domains;

  return (
    <div>
      {/* 道·法·术·器 筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={layer === null} onClick={() => setLayer(null)}>
          全部
        </FilterChip>
        {LIGHTHOUSE_LAYERS.map((l) => (
          <FilterChip key={l} active={layer === l} onClick={() => setLayer(l)}>
            {l}
          </FilterChip>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {shown.map((d) => (
          <DomainSection key={d.code} domain={d} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function DomainSection({ domain: d }: { domain: DomainGroup }) {
  const has = d.count > 0;
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-xs text-muted-foreground">{d.code}</span>
          <h2 className="text-base font-bold text-foreground">{d.name}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {d.layer}
          </span>
        </div>
        {has ? (
          <span className="shrink-0 text-sm text-muted-foreground">
            已发布 <span className="font-semibold text-primary">{d.count}</span> 期
          </span>
        ) : (
          <span className="shrink-0 text-sm text-muted-foreground/50">敬请期待</span>
        )}
      </header>

      {has ? (
        <ul className="divide-y divide-border/50">
          {d.episodes.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/articles/${e.slug}`}
                className="group flex items-center gap-3 px-5 py-3 transition hover:bg-primary/5"
              >
                <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">
                  {e.episode != null ? `第${String(e.episode).padStart(3, "0")}` : "—"}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-foreground transition group-hover:text-primary">
                  {e.title}
                </span>
                {e.date ? (
                  <time className="shrink-0 font-mono text-[11px] text-muted-foreground/80">{e.date}</time>
                ) : null}
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-5 text-sm italic text-muted-foreground/60">
          这个领域还在路上，内容建设中…
        </p>
      )}
    </section>
  );
}
