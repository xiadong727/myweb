import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Image as ImageIcon, Video, Headphones, ChevronRight, type LucideIcon } from "lucide-react";
import { LIGHTHOUSE_DOMAINS } from "@/lib/lighthouse-shared";
import { getDomainWorks, type DomainWork } from "@/lib/lighthouse";

type Props = { params: Promise<{ code: string }> };

export function generateStaticParams() {
  return LIGHTHOUSE_DOMAINS.map((d) => ({ code: d.code }));
}

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  const d = LIGHTHOUSE_DOMAINS.find((x) => x.code === code);
  return { title: d ? `${d.name}（${d.code}）· 与光同行` : "与光同行" };
}

const SECTION_META: { key: keyof ReturnType<typeof getDomainWorks>; label: string; base: string; icon: LucideIcon; color: string }[] = [
  { key: "articles", label: "文章", base: "/articles", icon: FileText, color: "text-blue-500" },
  { key: "images", label: "图片", base: "/images", icon: ImageIcon, color: "text-emerald-500" },
  { key: "videos", label: "视频", base: "/videos", icon: Video, color: "text-rose-500" },
  { key: "audios", label: "音频", base: "/audios", icon: Headphones, color: "text-purple-500" },
];

export default async function DomainPage({ params }: Props) {
  const { code } = await params;
  const domain = LIGHTHOUSE_DOMAINS.find((d) => d.code === code);
  if (!domain) notFound();

  const works = getDomainWorks(code);
  const total = works.articles.length + works.images.length + works.videos.length + works.audios.length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-12">
      <header className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent p-7 sm:p-9">
        <p className="font-mono text-xs text-muted-foreground">{domain.code} · 与光同行</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{domain.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          共 <span className="font-semibold text-primary">{total}</span> 个作品（文章 {works.articles.length} · 图片 {works.images.length} · 视频 {works.videos.length} · 音频 {works.audios.length}）
        </p>
      </header>

      {total === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          这个领域还在路上，内容建设中…
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {SECTION_META.map((s) => {
            const items = works[s.key] as DomainWork[];
            if (items.length === 0) return null;
            return (
              <section key={s.key}>
                <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  {s.label}
                  <span className="text-sm font-normal text-muted-foreground">（{items.length}）</span>
                </h2>
                <ul className="mt-3 space-y-3">
                  {items.map((it, i) => (
                    <li key={it.slug}>
                      <Link
                        href={`${s.base}/${it.slug}`}
                        className={`group flex items-start gap-4 rounded-2xl border border-primary/10 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5 ${i % 2 === 0 ? "bg-primary/[0.06]" : "bg-primary/[0.02]"}`}
                      >
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <s.icon className={`h-5 w-5 ${s.color}`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[15px] font-bold leading-snug text-foreground transition group-hover:text-primary sm:text-base">{it.title}</h3>
                          {it.date ? <div className="mt-1.5 font-mono text-[11px] text-muted-foreground/90">{it.date}</div> : null}
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
