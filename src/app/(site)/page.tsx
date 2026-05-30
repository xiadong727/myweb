import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ImageIcon,
  Video,
  Headphones,
  Sparkles,
  Compass,
} from "lucide-react";
import { getNavigation } from "@/lib/navigation";
import { getArticleSummaries } from "@/lib/articles";
import { getAllGalleries } from "@/lib/galleries";
import { getAllVideos } from "@/lib/videos";
import { getAllAudios } from "@/lib/audios";
import { getLighthouseDomainStats, getLighthouseTotalEpisodes } from "@/lib/lighthouse";
import { MetricsInline } from "@/components/metrics-inline";
import { SiteVisits } from "@/components/site-visits";

const ABOUT_SLUG = "cogrow/10years02";

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
  const featuredQuote = [...summaries]
    .filter((a) => a.quote)
    .sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? 1 : -1))[0];

  // 为每个板块定义专属的渐变色和悬浮光晕
  const styles = {
    articles: {
      gradient: "from-blue-500 to-indigo-500",
      text: "text-blue-500",
      borderHover: "hover:border-blue-500/40",
      shadowHover: "hover:shadow-[0_8px_24px_-12px_rgba(59,130,246,0.6)]",
      blob: "bg-blue-500/15",
    },
    images: {
      gradient: "from-emerald-400 to-teal-500",
      text: "text-emerald-500",
      borderHover: "hover:border-emerald-500/40",
      shadowHover: "hover:shadow-[0_8px_24px_-12px_rgba(16,185,129,0.6)]",
      blob: "bg-emerald-500/15",
    },
    videos: {
      gradient: "from-rose-400 to-orange-500",
      text: "text-rose-500",
      borderHover: "hover:border-rose-500/40",
      shadowHover: "hover:shadow-[0_8px_24px_-12px_rgba(244,63,94,0.6)]",
      blob: "bg-rose-500/15",
    },
    audios: {
      gradient: "from-purple-500 to-fuchsia-500",
      text: "text-purple-500",
      borderHover: "hover:border-purple-500/40",
      shadowHover: "hover:shadow-[0_8px_24px_-12px_rgba(168,85,247,0.6)]",
      blob: "bg-purple-500/15",
    },
    contact: {
      gradient: "from-zinc-500 to-slate-600",
      text: "text-zinc-500",
      borderHover: "hover:border-zinc-500/40",
      shadowHover: "hover:shadow-[0_8px_24px_-12px_rgba(113,113,122,0.6)]",
      blob: "bg-zinc-500/15",
    },
  };

  const cards = [
    {
      href: "/articles",
      title: nav.trees.articles.label,
      count: summaries.length,
      unit: "篇",
      icon: FileText,
      style: styles.articles,
    },
    {
      href: "/images",
      title: nav.trees.images.label,
      count: imageCount,
      unit: "张",
      icon: ImageIcon,
      style: styles.images,
    },
    {
      href: "/videos",
      title: nav.trees.videos.label,
      count: videoCount,
      unit: "部",
      icon: Video,
      style: styles.videos,
    },
    {
      href: "/audios",
      title: nav.trees.audios?.label ?? "音频",
      count: audioCount,
      unit: "期",
      icon: Headphones,
      style: styles.audios,
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
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
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">记录与分享</p>
            <h1 className="mt-3 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              {nav.site.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {nav.site.tagline}
            </p>
          </div>

          {/* 右栏：数据面板 */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-primary/15 bg-card/60 p-5 text-center backdrop-blur-sm">
              <div className="text-5xl font-extrabold tabular-nums text-primary sm:text-6xl">
                {totalWorks}
              </div>
              <div className="mt-1.5 text-xs tracking-wider text-muted-foreground">总作品数</div>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-card/60 p-5 text-center backdrop-blur-sm">
              <SiteVisits className="text-5xl font-extrabold tabular-nums text-foreground sm:text-6xl" />
              <div className="mt-1.5 text-xs tracking-wider text-muted-foreground">访问人数</div>
            </div>
            <div className="col-span-2 grid grid-cols-4 divide-x divide-border/40 overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
              {[
                { n: articleCount, label: "文章", color: "text-blue-500" },
                { n: imageCount, label: "图片", color: "text-emerald-500" },
                { n: videoCount, label: "视频", color: "text-rose-500" },
                { n: audioCount, label: "音频", color: "text-purple-500" },
              ].map((s) => (
                <div key={s.label} className="py-3.5 text-center">
                  <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.n}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 sm:p-5 ${c.style.borderHover} ${c.style.shadowHover}`}
          >
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150 ${c.style.blob}`} />
            <div className="relative z-10 flex items-center justify-between">
              <c.icon className={`h-7 w-7 transition-transform duration-300 group-hover:scale-110 ${c.style.text}`} />
              {c.count > 0 ? (
                <span className="font-mono text-xs text-muted-foreground/70">
                  <span className={`text-sm font-bold ${c.style.text}`}>{c.count}</span> {c.unit}
                </span>
              ) : null}
            </div>
            <div className="relative z-10 mt-4 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-wide text-foreground">{c.title}</h2>
              <ArrowRight className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${c.style.text}`} />
            </div>
          </Link>
        ))}
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
              与光同行 · 10 领域
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
            const has = d.count > 0 && d.latestSlug;
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
                      {d.count} 期
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
                href={`/articles/${d.latestSlug}`}
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

      {/* 精选金句 */}
      {featuredQuote?.quote ? (
        <section className="mt-14">
          <Link
            href={`/articles/${featuredQuote.slug}`}
            className="group relative block overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent px-6 py-14 sm:px-10 sm:py-20"
          >
            {/* 左上角标签 */}
            <p className="absolute left-6 top-7 z-10 flex items-center gap-2.5 sm:left-10 sm:top-9">
              <span className="h-4 w-1 rounded-full bg-primary" />
              <span className="text-sm font-bold tracking-[0.2em] text-primary">本期金句</span>
            </p>
            {/* 右上角装饰引号水印 */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-4 -top-14 select-none font-serif text-[13rem] leading-none text-primary/[0.06] sm:text-[18rem]"
            >
              ”
            </span>

            <figure className="relative z-10 mx-auto mt-6 max-w-3xl text-center sm:mt-8">
              <blockquote className="text-2xl font-semibold leading-[1.7] tracking-wide text-foreground sm:text-[2rem] sm:leading-[1.65]">
                {featuredQuote.quote}
              </blockquote>
              <figcaption className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <span className="h-px w-8 bg-primary/30" />
                <span className="transition group-hover:text-primary">{featuredQuote.title}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </figcaption>
            </figure>
          </Link>
        </section>
      ) : null}
    </main>
  );
}
