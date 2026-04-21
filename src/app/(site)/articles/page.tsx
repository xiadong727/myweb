import Link from "next/link";
import { getArticleSummaries } from "@/lib/articles";

export const metadata = {
  title: "文章",
};

export default function ArticlesIndexPage() {
  const list = getArticleSummaries();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">文章</h1>
      <p className="mt-2 text-sm text-muted-foreground">Markdown 文稿，位于 content/articles/</p>
      <ul className="mt-8 space-y-3">
        {list.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/articles/${item.slug}`}
              className="block rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition hover:border-primary/25 hover:bg-muted/50"
            >
              <div className="font-medium text-foreground">{item.title}</div>
              {item.excerpt ? <p className="mt-1 text-sm text-muted-foreground">{item.excerpt}</p> : null}
              {item.date ? (
                <div className="mt-2 font-mono text-[11px] text-muted-foreground/90">{item.date}</div>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
