import Link from "next/link";
import { ArrowRight, FileText, ImageIcon, Video, Headphones, Mail } from "lucide-react";
import { getNavigation } from "@/lib/navigation";

export default function HomePage() {
  const nav = getNavigation();

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
      desc: "思考、认知与陪伴路上的文字记录。",
      icon: FileText,
      style: styles.articles,
    },
    {
      href: "/images",
      title: nav.trees.images.label,
      desc: "家庭瞬间、风景与值得珍藏的画面。",
      icon: ImageIcon,
      style: styles.images,
    },
    {
      href: "/videos",
      title: nav.trees.videos.label,
      desc: "短片、回顾与想反复看的片段。",
      icon: Video,
      style: styles.videos,
    },
    {
      href: "/audios",
      title: nav.trees.audios?.label ?? "音频",
      desc: "播客、环境音与声音记录。",
      icon: Headphones,
      style: styles.audios,
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div
        className="relative overflow-hidden rounded-3xl border p-8 shadow-sm sm:p-12"
        style={{
          borderColor: "var(--hero-border)",
          background: `linear-gradient(135deg, var(--hero-blob-a) 0%, transparent 45%, var(--hero-blob-b) 100%)`,
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
        <p className="relative z-10 text-xs font-bold uppercase tracking-[0.25em] text-primary">记录与分享</p>
        <h1 className="relative z-10 mt-3 max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {nav.site.title}
        </h1>
        <p className="relative z-10 mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {nav.site.tagline}
        </p>
        <div className="relative z-10 mt-10 flex flex-wrap gap-3">
          <Link
            href="/articles"
            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${styles.articles.gradient} px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg`}
          >
            <FileText className="h-4 w-4" />
            读文章
          </Link>
          <Link
            href="/images"
            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${styles.images.gradient} px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg`}
          >
            <ImageIcon className="h-4 w-4" />
            品图片
          </Link>
          <Link
            href="/videos"
            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${styles.videos.gradient} px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg`}
          >
            <Video className="h-4 w-4" />
            看视频
          </Link>
          <Link
            href="/audios"
            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${styles.audios.gradient} px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg`}
          >
            <Headphones className="h-4 w-4" />
            听音频
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:scale-105 hover:border-primary/30 hover:bg-muted"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            联系我
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 ${c.style.borderHover} ${c.style.shadowHover}`}
          >
            <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150 ${c.style.blob}`} />
            <c.icon className={`relative z-10 h-8 w-8 transition-transform duration-500 group-hover:scale-110 ${c.style.text}`} />
            <h2 className="relative z-10 mt-5 text-lg font-bold tracking-wide text-foreground">{c.title}</h2>
            <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground/80">
              {c.desc}
            </p>
            <span className={`relative z-10 mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest ${c.style.text}`}>
              进入
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
