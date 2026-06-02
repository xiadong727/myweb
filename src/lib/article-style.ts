import fs from "fs";
import path from "path";
import type { CSSProperties } from "react";

export type ArticleStyle = {
  firstLineIndent: boolean;
  justify: boolean;
  fontSize: string;
  lineHeight: number;
  letterSpacing: string;
  paragraphGap: string;
};

export const ARTICLE_STYLE_DEFAULTS: ArticleStyle = {
  firstLineIndent: true,
  justify: true,
  fontSize: "1.05rem",
  lineHeight: 1.9,
  letterSpacing: "0.02em",
  paragraphGap: "1.25rem",
};

/**
 * 读取文章排版配置（data/site-config.json 的 article 段），回退到默认值。
 * 在「内容后台 → ⚙️ 设置」里可视化修改。每次渲染读取，便于本地实时生效。
 */
export function getArticleStyle(): ArticleStyle {
  try {
    const p = path.join(process.cwd(), "data/site-config.json");
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    return { ...ARTICLE_STYLE_DEFAULTS, ...(raw?.article ?? {}) };
  } catch {
    return ARTICLE_STYLE_DEFAULTS;
  }
}

export function bodyTextStyleOf(s: ArticleStyle): CSSProperties {
  return { fontSize: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing };
}

export function paragraphStyleOf(s: ArticleStyle): CSSProperties {
  return {
    ...bodyTextStyleOf(s),
    marginTop: s.paragraphGap,
    textAlign: s.justify ? "justify" : "left",
    textIndent: s.firstLineIndent ? "2em" : 0,
  };
}
