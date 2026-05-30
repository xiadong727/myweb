import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ArticleNeighbor } from "@/lib/articles";

/** 文章底部上一篇/下一篇导航 */
export function ArticlePager({
  prev,
  next,
  isEpisode,
}: {
  prev: ArticleNeighbor | null;
  next: ArticleNeighbor | null;
  isEpisode: boolean;
}) {
  if (!prev && !next) return null;
  const prevLabel = isEpisode ? "上一期" : "上一篇";
  const nextLabel = isEpisode ? "下一期" : "下一篇";

  return (
    <nav className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="上一篇/下一篇">
      {prev ? (
        <Link
          href={`/articles/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            {prevLabel}
          </span>
          <span className="line-clamp-1 font-medium text-foreground/90 group-hover:text-primary">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/articles/${next.slug}`}
          className="group flex flex-col items-end gap-1 rounded-xl border border-border bg-card p-4 text-right transition hover:border-primary/40 hover:bg-primary/5 sm:col-start-2"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {nextLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <span className="line-clamp-1 font-medium text-foreground/90 group-hover:text-primary">
            {next.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
    </nav>
  );
}
