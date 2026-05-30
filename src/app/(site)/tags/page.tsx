import Link from "next/link";
import { Tag } from "lucide-react";
import { getAllTags } from "@/lib/articles";

export const metadata = {
  title: "标签",
  description: "按标签浏览全部文章。",
};

export default function TagsIndexPage() {
  const tags = getAllTags();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Tag className="h-6 w-6 text-primary" />
        标签
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">点一个标签，看该主题下的全部文章。</p>

      {tags.length ? (
        <div className="mt-8 flex flex-wrap gap-2.5">
          {tags.map((t) => (
            <Link
              key={t.tag}
              href={`/tags/${encodeURIComponent(t.tag)}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:border-primary/40 hover:bg-primary/5"
            >
              {t.tag}
              <span className="rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">{t.count}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm italic text-muted-foreground/60">还没有任何标签。</p>
      )}
    </main>
  );
}
