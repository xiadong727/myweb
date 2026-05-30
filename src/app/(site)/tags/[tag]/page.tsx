import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import { getAllTags, getArticlesByTag } from "@/lib/articles";
import { MetricsInline } from "@/components/metrics-inline";

type Props = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: encodeURIComponent(t.tag) }));
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  return { title: `标签：${name}`, description: `「${name}」标签下的全部文章。` };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  const list = getArticlesByTag(name);
  if (!list.length) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/tags"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        全部标签
      </Link>
      <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
        <Tag className="h-6 w-6 text-primary" />
        {name}
        <span className="text-base font-normal text-muted-foreground">· {list.length} 篇</span>
      </h1>

      <ul className="mt-8 space-y-3">
        {list.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/articles/${item.slug}`}
              className="block rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition hover:border-primary/25 hover:bg-muted/50"
            >
              <div className="font-medium text-foreground">{item.title}</div>
              {item.excerpt ? (
                <p className="mt-1 text-sm text-muted-foreground">{item.excerpt}</p>
              ) : null}
              <div className="mt-2 flex items-center gap-3">
                {item.date ? (
                  <span className="font-mono text-[11px] text-muted-foreground/90">{item.date}</span>
                ) : null}
                <MetricsInline type="articles" slug={item.slug} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
