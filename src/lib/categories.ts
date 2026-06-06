import { getNavigation } from "./navigation";
import { getArticleSummaries } from "./articles";
import { isNavGroup, type NavNode } from "./types";

/** 这些顶层分组单独展示（与光同行是主线，已有独立板块，排除掉） */
const EXCLUDE = new Set(["lighthouse"]);

function collectSlugs(nodes: NavNode[]): string[] {
  const out: string[] = [];
  for (const n of nodes) {
    if (isNavGroup(n)) out.push(...collectSlugs(n.children));
    else out.push(n.slug);
  }
  return out;
}

export type ArticleCategory = { id: string; title: string; slugs: string[]; count: number; colorIndex: number };

/** 文章导航里的「非主线」顶层分类（日常·随笔 / 亲子·教育 / …），含已发布文章数。
 *  colorIndex = 该分组在「文章顶层节点」里的位置，与侧栏 TreeNav 取色索引一致，保证处处同色。
 *  生产环境下 getNavigation 已剪除草稿，getArticleSummaries 也已排除草稿，二者一致。 */
export function getArticleCategories(): ArticleCategory[] {
  const nav = getNavigation();
  const published = new Set(getArticleSummaries().map((a) => a.slug));
  const out: ArticleCategory[] = [];
  nav.trees.articles.nodes.forEach((n, idx) => {
    if (!isNavGroup(n) || EXCLUDE.has(n.id)) return;
    const slugs = collectSlugs(n.children).filter((s) => published.has(s));
    out.push({ id: n.id, title: n.title, slugs, count: slugs.length, colorIndex: idx });
  });
  return out;
}

export function getCategoryById(id: string): ArticleCategory | null {
  return getArticleCategories().find((c) => c.id === id) ?? null;
}

/** 某分类下的文章（带 title/date/excerpt），按发布时间倒序 */
export function getCategoryArticles(id: string) {
  const cat = getCategoryById(id);
  if (!cat) return null;
  const bySlug = new Map(getArticleSummaries().map((a) => [a.slug, a]));
  const articles = cat.slugs
    .map((s) => bySlug.get(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? 1 : -1));
  return { id: cat.id, title: cat.title, count: articles.length, colorIndex: cat.colorIndex, articles };
}
