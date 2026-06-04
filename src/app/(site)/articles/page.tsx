import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { getArticleSummaries } from "@/lib/articles";
import { MetricsInline } from "@/components/metrics-inline";

export const metadata = { title: "文章" };

export default function ArticlesIndexPage() {
  const list = [...getArticleSummaries()].sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? 1 : -1)); // 发布时间倒序

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
          <FileText className="h-6 w-6 text-blue-500" />
          文章
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">共 {list.length} 篇 · 按发布时间排列</p>
      </header>
      <ul className="mt-8 space-y-3">
        {list.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/articles/${item.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-md sm:p-5"
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-500" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-foreground transition group-hover:text-blue-500">{item.title}</h2>
                {item.excerpt ? <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{item.excerpt}</p> : null}
                <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted-foreground/90">
                  {item.date ? <span>{item.date}</span> : null}
                  <MetricsInline type="articles" slug={item.slug} />
                </div>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
