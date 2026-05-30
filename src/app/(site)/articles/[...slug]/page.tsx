import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  getArticleNeighbors,
  getArticleSlugs,
  resolveArticleDisplay,
} from "@/lib/articles";
import { ArticleBody } from "@/components/article-body";
import { ArticleToc } from "@/components/article-toc";
import { ArticlePager } from "@/components/article-pager";
import { ReadingProgress } from "@/components/reading-progress";
import { QuoteCard } from "@/components/quote-card";
import { EpisodeNav } from "@/components/episode-nav";
import { MetricsBar } from "@/components/metrics-bar";
import { Comments } from "@/components/comments";
import { episodeKeyFromArticle, getRelatedEpisodeLinks } from "@/lib/episode";
import { extractToc, estimateReadingMinutes } from "@/lib/toc";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return getArticleSlugs().map((s) => ({ slug: s.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const article = getArticleBySlug(path);
  if (!article) return { title: "未找到" };
  const { title } = resolveArticleDisplay(article);
  const ogImage = `/api/og?title=${encodeURIComponent(title)}`;
  return {
    title,
    description: article.meta.excerpt,
    openGraph: {
      title,
      description: article.meta.excerpt,
      type: "article",
      url: absoluteUrl(`/articles/${path}`),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const article = getArticleBySlug(path);
  if (!article) notFound();

  const { title, content } = resolveArticleDisplay(article);
  const episodeLinks = getRelatedEpisodeLinks(episodeKeyFromArticle(article.meta), {
    type: "articles",
    slug: path,
  });
  const toc = extractToc(content);
  const readingMinutes = estimateReadingMinutes(content);
  const { prev, next, isEpisode } = getArticleNeighbors(path);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    url: absoluteUrl(`/articles/${path}`),
    ...(article.meta.excerpt ? { description: article.meta.excerpt } : {}),
    ...(article.meta.date ? { datePublished: article.meta.date } : {}),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    ...(article.meta.tags?.length ? { keywords: article.meta.tags.join(", ") } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <article className="mx-auto max-w-4xl px-4 pb-16 sm:px-8 lg:px-12">
        <header className="pb-6 sm:pb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug tracking-tight text-foreground">{title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-muted-foreground">
            {article.meta.date ? <span>{article.meta.date}</span> : null}
            <span>约 {readingMinutes} 分钟阅读</span>
          </div>
          {article.meta.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.meta.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tags/${encodeURIComponent(t)}`}
                  className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs text-primary transition hover:border-primary/40 hover:bg-primary/10"
                >
                  {t}
                </Link>
              ))}
            </div>
          ) : null}
          <div className="mt-5">
            <MetricsBar type="articles" slug={path} />
          </div>
        </header>
        <ArticleToc items={toc} />
        <ArticleBody content={content} articleSlug={path} />
        {article.meta.quote ? <QuoteCard quote={article.meta.quote} source={title} /> : null}
        <EpisodeNav links={episodeLinks} />
        <ArticlePager prev={prev} next={next} isEpisode={isEpisode} />
      </article>
      <Comments />
    </>
  );
}
