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
import { episodeKeyFromArticle, getRelatedEpisodeLinks } from "@/lib/episode";
import { extractToc, estimateReadingMinutes } from "@/lib/toc";

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
  return { title };
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

  return (
    <>
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
                <span
                  key={t}
                  className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs text-primary"
                >
                  {t}
                </span>
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
    </>
  );
}
