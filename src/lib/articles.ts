import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ArticleMeta } from "./types";

const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

/** 解析正文开头的一级 ATX 标题（# 标题），用于与 frontmatter 标题去重 */
export function takeLeadingAtxH1(content: string): { heading: string | null; rest: string } {
  const normalized = content.replace(/^\uFEFF/, "");
  const lines = normalized.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i += 1;
  if (i >= lines.length) return { heading: null, rest: content };
  const m = /^#\s+(.+)$/.exec(lines[i].trim());
  if (!m) return { heading: null, rest: content };
  const heading = m[1]
    .trim()
    .replace(/#+\s*$/, "")
    .trim();
  const rest = [...lines.slice(0, i), ...lines.slice(i + 1)].join("\n").replace(/^\n+/, "");
  return { heading, rest };
}

function normTitle(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** 页面展示用标题 + 去重后的正文（避免 frontmatter 标题与 md 首行 # 重复时出现双线与大标题重复） */
export function resolveArticleDisplay(article: { meta: ArticleMeta; content: string }): {
  title: string;
  content: string;
} {
  const { heading, rest } = takeLeadingAtxH1(article.content);
  const metaTitle = typeof article.meta.title === "string" ? article.meta.title.trim() : "";
  const title = metaTitle || heading || "未命名";
  const shouldStrip = Boolean(
    heading && (!metaTitle || normTitle(heading) === normTitle(metaTitle)),
  );
  return {
    title,
    content: shouldStrip ? rest : article.content,
  };
}

export function getArticleSlugs(): string[] {
  const results: string[] = [];

  function walk(dir: string, prefix: string[]) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full, [...prefix, name]);
      else if (name.endsWith(".md")) {
        const base = name.replace(/\.md$/, "");
        results.push([...prefix, base].join("/"));
      }
    }
  }

  walk(ARTICLES_DIR, []);
  return results;
}

export function getArticleBySlug(slug: string) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    meta: data as ArticleMeta,
    content,
    slug,
  };
}

export function getArticleSummaries() {
  return getArticleSlugs()
    .map((slug) => {
      const a = getArticleBySlug(slug);
      if (!a) return null;
      const { title } = resolveArticleDisplay(a);
      return { slug, ...a.meta, title };
    })
    .filter((x): x is { slug: string } & ArticleMeta => x !== null);
}

export type ArticleNeighbor = { slug: string; title: string };

/**
 * 取得上一篇/下一篇：
 * - 灯塔系列（有 domain + episode）：按同领域内的期号排序，prev=上一期、next=下一期
 * - 其它文章：按日期排序，prev=较新一篇、next=较旧一篇
 */
export function getArticleNeighbors(slug: string): {
  prev: ArticleNeighbor | null;
  next: ArticleNeighbor | null;
  isEpisode: boolean;
} {
  const all = getArticleSummaries();
  const current = all.find((a) => a.slug === slug);
  const pick = (a: ({ slug: string } & ArticleMeta) | undefined): ArticleNeighbor | null =>
    a ? { slug: a.slug, title: a.title } : null;
  if (!current) return { prev: null, next: null, isEpisode: false };

  if (current.domain && current.episode != null) {
    const seq = all
      .filter((a) => a.domain === current.domain && a.episode != null)
      .sort((a, b) => (a.episode as number) - (b.episode as number));
    const i = seq.findIndex((a) => a.slug === slug);
    return {
      prev: i > 0 ? pick(seq[i - 1]) : null,
      next: i >= 0 && i < seq.length - 1 ? pick(seq[i + 1]) : null,
      isEpisode: true,
    };
  }

  const dated = all
    .filter((a) => a.date)
    .sort((a, b) => ((a.date as string) < (b.date as string) ? 1 : -1));
  const i = dated.findIndex((a) => a.slug === slug);
  if (i === -1) return { prev: null, next: null, isEpisode: false };
  return {
    prev: i > 0 ? pick(dated[i - 1]) : null,
    next: i < dated.length - 1 ? pick(dated[i + 1]) : null,
    isEpisode: false,
  };
}
