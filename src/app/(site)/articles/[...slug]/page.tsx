import { notFound } from "next/navigation";
import { getArticleBySlug, getArticleSlugs } from "@/lib/articles";
import { ArticleBody } from "@/components/article-body";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return getArticleSlugs().map((s) => ({ slug: s.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const article = getArticleBySlug(path);
  if (!article) return { title: "未找到" };
  return { title: article.meta.title };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const article = getArticleBySlug(path);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 pb-16 sm:px-8 lg:px-12">
      <header className="border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{article.meta.title}</h1>
        {article.meta.date ? (
          <p className="mt-3 font-mono text-sm text-muted-foreground">{article.meta.date}</p>
        ) : null}
        {article.meta.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {article.meta.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs text-primary"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </header>
      <ArticleBody content={article.content} />
    </article>
  );
}
