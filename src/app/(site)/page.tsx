import Link from "next/link";
import { ArrowRight, Sparkles, Compass } from "lucide-react";
import { getNavigation } from "@/lib/navigation";
import { getArticleSummaries } from "@/lib/articles";
import { getAllGalleries } from "@/lib/galleries";
import { getAllVideos } from "@/lib/videos";
import { getAllAudios } from "@/lib/audios";
import { getLighthouseDomainStats, getLighthouseTotalEpisodes } from "@/lib/lighthouse";
import { MetricsInline } from "@/components/metrics-inline";
import { StatsPanel } from "@/components/stats-panel";

const ABOUT_SLUG = "imported/wx-uP0_Qj_2eDOn";

export default function HomePage() {
  const nav = getNavigation();

  const summaries = getArticleSummaries();
  const galleries = getAllGalleries();
  const imageCount = galleries.reduce((n, g) => n + (g.images?.length ?? 0), 0);
  const videoCount = getAllVideos().length;
  const audioCount = getAllAudios().length;
  const articleCount = summaries.length;
  const totalWorks = articleCount + imageCount + videoCount + audioCount;
  const latest = [...summaries]
    .filter((a) => a.date)
    .sort((a, b) => ((a.date as string) < (b.date as string) ? 1 : -1))
    .slice(0, 6);
  const domainStats = getLighthouseDomainStats();
  const totalEpisodes = getLighthouseTotalEpisodes();

  return (
    <main className="mx-auto max-w-6xl px-4 pb-10 pt-2 sm:px-6 lg:pb-12 lg:pt-3">
      <div
        className="relative overflow-hidden rounded-3xl border p-6 shadow-sm sm:p-8 lg:p-10"
        style={{
          borderColor: "var(--hero-border)",
          background: `linear-gradient(135deg, var(--hero-blob-a) 0%, transparent 55%, var(--hero-blob-b) 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
          style={{ background: "var(--hero-blob-a)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "var(--hero-blob-b)" }}
        />

        <div className="relative z-10 grid items-center gap-7 lg:grid-cols-2 lg:gap-10">
          {/* 左栏：品牌 */}
          <div>
            <h1
              className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl"
              style={{
                textShadow:
                  "0 1px 0 rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.08), 0 8px 30px rgba(251,146,60,0.45)",
              }}
            >
              {nav.site.title}
            </h1>
            <p className="mt-7 text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg">
              {nav.site.tagline}
            </p>
          </div>

          {/* 右栏：数据面板（暖光立体 + 同步翻滚） */}
          <StatsPanel
            totalWorks={totalWorks}
            articleCount={articleCount}
            imageCount={imageCount}
            videoCount={videoCount}
            audioCount={audioCount}
          />
        </div>
      </div>

      {/* 与光同行 · 主线进度墙 */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link
              href="/lighthouse"
              className="group inline-flex items-center gap-2 text-xl font-bold tracking-tight text-foreground transition hover:text-primary"
            >
              <Compass className="h-5 w-5 text-primary" />
              与光同行 · 10 大领域
              <ArrowRight className="h-4 w-4 text-primary opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
            <p className="mt-1.5 text-sm text-muted-foreground">
              已更新 <span className="font-semibold text-primary">{totalEpisodes}</span> 期
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href={`/articles/${ABOUT_SLUG}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
            >
              了解这件事
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
            <Link
              href="/lighthouse"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              进入主线
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {domainStats.map((d, i) => {
            const has = d.count > 0;
            const idx = String(i + 1).padStart(2, "0");
            const inner = (
              <>
                <span
                  className={`pointer-events-none absolute -right-1 bottom-0 select-none font-mono text-6xl font-bold leading-none ${
                    has ? "text-primary/10" : "text-foreground/[0.035]"
                  }`}
                >
                  {idx}
                </span>
                <div className="relative flex items-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">{d.code}</span>
                  {has ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {d.count} 个
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/45">敬请期待</span>
                  )}
                </div>
                <p
                  className={`relative mt-2 text-base font-semibold ${
                    has ? "text-foreground" : "text-muted-foreground/70"
                  }`}
                >
                  {d.name}
                </p>
              </>
            );
            return has ? (
              <Link
                key={d.code}
                href={`/lighthouse/${d.code}`}
                className="group relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/[0.07] to-transparent px-3.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={d.code}
                className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/15 px-3.5 py-3"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* 最新更新 */}
      {latest.length ? (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              最新更新
            </h2>
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
            >
              全部文章
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {latest.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/articles/${a.slug}`}
                  className="group flex items-center gap-4 px-4 py-3 transition hover:bg-primary/5 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-foreground transition group-hover:text-primary">
                      {a.title}
                    </h3>
                    {a.excerpt ? (
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{a.excerpt}</p>
                    ) : null}
                    <div className="mt-1">
                      <MetricsInline type="articles" slug={a.slug} />
                    </div>
                  </div>
                  <time className="shrink-0 font-mono text-xs text-muted-foreground">{a.date}</time>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

    </main>
  );
}
