import Link from "next/link";
import { Video, ChevronRight } from "lucide-react";
import { getAllVideos } from "@/lib/videos";
import { MetricsInline } from "@/components/metrics-inline";

export const metadata = { title: "视频" };

export default function VideosIndexPage() {
  const videos = [...getAllVideos()].sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? 1 : -1)); // 发布时间倒序

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
          <Video className="h-6 w-6 text-rose-500" />
          视频
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">共 {videos.length} 部 · 按发布时间排列</p>
      </header>
      <ul className="mt-8 space-y-3">
        {videos.map((v, i) => (
          <li key={v.slug}>
            <Link
              href={`/videos/${v.slug}`}
              className={`group flex items-start gap-4 rounded-2xl border border-primary/10 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-500/30 hover:shadow-md sm:p-5 ${i % 2 === 0 ? "bg-primary/[0.06]" : "bg-primary/[0.02]"}`}
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                <Video className="h-5 w-5 text-rose-500" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-bold leading-snug text-foreground transition group-hover:text-rose-500 sm:text-base">{v.title}</h2>
                {v.description ? <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{v.description}</p> : null}
                <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted-foreground/90">
                  <span>{v.kind === "embed" ? "嵌入" : "文件"}</span>
                  {v.date ? <span>{v.date}</span> : null}
                  <MetricsInline type="videos" slug={v.slug} />
                </div>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
