import Link from "next/link";
import { Compass, Sparkles, ChevronRight } from "lucide-react";
import { getLighthouseOverview } from "@/lib/lighthouse";
import { LighthouseExplorer } from "@/components/lighthouse-explorer";

export const metadata = {
  title: "与光同行",
  description: "用十年，把人类智慧走一遍 — 10 领域 520 期的主线总览。",
};

export default function LighthousePage() {
  const { domains, recent, publishedTotal, targetTotal, openedDomains } = getLighthouseOverview();
  const percent = Math.round((publishedTotal / targetTotal) * 1000) / 10;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-12">
      {/* 标题 + 总进度 */}
      <header className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent p-7 sm:p-10">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <Compass className="h-7 w-7 text-primary" />
          与光同行
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          用十年时间，把人类智慧拆成 10 个领域、520 期，一期一期慢慢走。
        </p>

        <div className="mt-7 max-w-md">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">
              已发布 <span className="font-semibold text-primary">{publishedTotal}</span> / {targetTotal} 期
            </span>
            <span className="font-mono text-xs text-muted-foreground/80">{percent}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(percent, 1)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground/80">已开启 {openedDomains} / 10 个领域</p>
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
        <p className="mt-1 text-sm text-muted-foreground">
          10 个领域分属「道·法·术·器」四层，可按层筛选。
        </p>
        <div className="mt-5">
          <LighthouseExplorer domains={domains} />
        </div>
      </section>
    </main>
  );
}
