import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ArticleMeta } from "./types";

const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

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
      return { slug, ...a.meta };
    })
    .filter((x): x is { slug: string } & ArticleMeta => x !== null);
}
