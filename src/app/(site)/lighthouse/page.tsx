import Link from "next/link";
import { Compass, Sparkles, ChevronRight } from "lucide-react";
import { getLighthouseOverview, LIGHTHOUSE_DOMAIN_COUNT, type DomainGroup } from "@/lib/lighthouse";
import { MetricsInline } from "@/components/metrics-inline";

export const metadata = {
  title: "与光同行",
  description: "把人类智慧拆成一个个领域，一期一期慢慢走 — 主线总览。",
};

export default function LighthousePage() {
  const { domains, recent, publishedTotal, openedDomains } = getLighthouseOverview();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-12">
      {/* 标题 + 概览 */}
      <header className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent p-7 sm:p-10">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <Compass className="h-7 w-7 text-primary" />
          与光同行
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          用十年时间，把人类数千年的智慧结晶，打磨成每个家庭都能读懂、用得上的“思想工具”，留下一套能够穿越周期、可以代际传递的精神作品。
        </p>

        <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <div className="text-3xl font-bold text-primary">{publishedTotal}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">已发布期数</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">
              {openedDomains}
              <span className="text-lg font-normal text-muted-foreground"> / {LIGHTHOUSE_DOMAIN_COUNT}</span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">已开启领域</div>
          </div>
        </div>
      </header>

      {/* 最近更新 */}
      {recent.length ? (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            最近更新
          </h2>
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {recent.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/articles/${e.slug}`}
                  className="group flex items-center gap-3 px-4 py-3 transition hover:bg-primary/5 sm:px-5"
                >
                  <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-medium text-primary">
                    {e.code}
                    {e.episode != null ? `·${String(e.episode).padStart(3, "0")}` : ""}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground transition group-hover:text-primary">
                    {e.title}
                  </span>
                  <MetricsInline type="articles" slug={e.slug} />
                  {e.date ? (
                    <time className="shrink-0 font-mono text-[11px] text-muted-foreground/80">{e.date}</time>
                  ) : null}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 按领域浏览 */}
      <section className="mt-10">
        <h2 className="text-lg font-bold tracking-tight text-foreground">按领域浏览</h2>
        <p className="mt-1 text-sm text-muted-foreground">每个领域下按期号排列已发布的内容。</p>
        <div className="mt-5 space-y-4">
          {domains.map((d) => (
            <DomainSection key={d.code} domain={d} />
          ))}
        </div>
      </section>
    </main>
  );
}

function DomainSection({ domain: d }: { domain: DomainGroup }) {
  const has = d.count > 0;
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-xs text-muted-foreground">{d.code}</span>
          <h3 className="text-base font-bold text-foreground">{d.name}</h3>
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
                <MetricsInline type="articles" slug={e.slug} />
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
