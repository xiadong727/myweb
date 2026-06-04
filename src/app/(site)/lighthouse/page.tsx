import Link from "next/link";
import { Compass, Sparkles, FileText, Image as ImageIcon, Video, Headphones, ChevronRight, type LucideIcon } from "lucide-react";
import { getLighthouseOverview, LIGHTHOUSE_DOMAIN_COUNT, type DomainGroup, type EpisodeEntry } from "@/lib/lighthouse";
import type { SectionKey } from "@/lib/types";

export const metadata = {
  title: "与光同行",
  description: "把人类智慧拆成一个个领域，一期一期慢慢走 — 主线总览。",
};

const SECTION_UI: Record<SectionKey, { base: string; icon: LucideIcon; color: string; chip: string }> = {
  articles: { base: "/articles", icon: FileText, color: "text-blue-500", chip: "bg-blue-500/10" },
  images: { base: "/images", icon: ImageIcon, color: "text-emerald-500", chip: "bg-emerald-500/10" },
  videos: { base: "/videos", icon: Video, color: "text-rose-500", chip: "bg-rose-500/10" },
  audios: { base: "/audios", icon: Headphones, color: "text-purple-500", chip: "bg-purple-500/10" },
};

/** 单条作品卡片：彩色类别图标 + 加粗标题 + 日期 + 箭头，隔行暖色底，与全部列表风格一致 */
function WorkItem({ e, i }: { e: EpisodeEntry; i: number }) {
  const ui = SECTION_UI[e.section];
  return (
    <li>
      <Link
        href={`${ui.base}/${e.slug}`}
        className={`group flex items-start gap-4 rounded-2xl border border-primary/10 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5 ${i % 2 === 0 ? "bg-primary/[0.06]" : "bg-primary/[0.02]"}`}
      >
        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ui.chip}`}>
          <ui.icon className={`h-5 w-5 ${ui.color}`} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold leading-snug text-foreground transition group-hover:text-primary sm:text-base">
            {e.title}
          </h3>
          {e.date ? <div className="mt-1.5 font-mono text-[11px] text-muted-foreground/90">{e.date}</div> : null}
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </Link>
    </li>
  );
}

export default function LighthousePage() {
  const { domains, recent, publishedTotal, openedDomains } = getLighthouseOverview();

  return (
    <main className="mx-auto max-w-4xl px-4 pb-10 pt-3 sm:px-6 lg:pb-12 lg:pt-4">
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
            <div className="mt-0.5 text-xs text-muted-foreground">已发布作品</div>
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
          <ul className="mt-4 space-y-3">
            {recent.map((e, i) => (
              <WorkItem key={`${e.section}-${e.slug}`} e={e} i={i} />
            ))}
          </ul>
        </section>
      ) : null}

      {/* 按领域浏览 */}
      <section className="mt-10">
        <h2 className="text-lg font-bold tracking-tight text-foreground">按领域浏览</h2>
        <p className="mt-1 text-sm text-muted-foreground">每个领域下汇集已发布的全部作品。</p>
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
    <section className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.03] shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-primary/10 px-5 py-3.5">
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-xs text-muted-foreground">{d.code}</span>
          <Link href={`/lighthouse/${d.code}`} className="text-base font-bold text-foreground transition hover:text-primary">
            {d.name}
          </Link>
        </div>
        {has ? (
          <span className="shrink-0 text-sm text-muted-foreground">
            共 <span className="font-semibold text-primary">{d.count}</span> 个作品
          </span>
        ) : (
          <span className="shrink-0 text-sm text-muted-foreground/50">敬请期待</span>
        )}
      </header>

      {has ? (
        <ul className="space-y-2.5 p-3 sm:p-4">
          {d.episodes.map((e, i) => (
            <WorkItem key={`${e.section}-${e.slug}`} e={e} i={i} />
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
