import Link from "next/link";
import { Headphones, ChevronRight } from "lucide-react";
import { getAllAudios } from "@/lib/audios";
import { MetricsInline } from "@/components/metrics-inline";

export const metadata = { title: "音频" };

export default function AudiosIndexPage() {
  const audios = [...getAllAudios()].sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? 1 : -1)); // 发布时间倒序

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
          <Headphones className="h-6 w-6 text-purple-500" />
          音频
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">共 {audios.length} 期 · 按发布时间排列</p>
      </header>
      <ul className="mt-8 space-y-3">
        {audios.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/audios/${a.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-purple-500/30 hover:shadow-md sm:p-5"
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                <Headphones className="h-5 w-5 text-purple-500" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-foreground transition group-hover:text-purple-500">{a.title}</h2>
                {a.description ? <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{a.description}</p> : null}
                <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted-foreground/90">
                  {a.date ? <span>{a.date}</span> : null}
                  <MetricsInline type="audios" slug={a.slug} />
                </div>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-purple-500" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
