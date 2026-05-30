export type TocItem = { depth: 2 | 3; text: string; id: string };

/** 把标题文字转成锚点 id（保留中英文与数字，空格转连字符） */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 生成「带去重」的 slug 工厂。对同名标题依次追加 -1、-2…
 * 正文渲染（article-body 的 rehype 插件）与目录提取（extractToc）都用它，
 * 且都只处理 h2/h3、按文档顺序遍历，保证两边生成的 id 完全一致。
 */
export function makeSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = slugifyHeading(text) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  };
}

/** 从 markdown 正文里提取二、三级标题，生成目录 */
export function extractToc(markdown: string): TocItem[] {
  const slug = makeSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const depth = m[1].length as 2 | 3;
    const text = m[2].replace(/[*_`~]/g, "").trim();
    if (!text) continue;
    items.push({ depth, text, id: slug(text) });
  }
  return items;
}

/** 估算中文阅读时长（分钟）：中文按 400 字/分，英文单词按 200 词/分 */
export function estimateReadingMinutes(content: string): number {
  const cn = (content.match(/[一-鿿]/g) ?? []).length;
  const en = (content.match(/[a-zA-Z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cn / 400 + en / 200));
}
