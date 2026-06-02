import type { CSSProperties } from "react";

/**
 * 文章正文排版的统一配置。改这里 → 全站文章生效。
 * 想关掉首行缩进，把 firstLineIndent 改成 false 即可。
 */
export const ARTICLE_STYLE = {
  /** 段落首行缩进两格（中文常见排版）。false = 不缩进 */
  firstLineIndent: true,
  /** 两端对齐。false = 左对齐 */
  justify: true,
  /** 正文字号 */
  fontSize: "1.05rem",
  /** 行高 */
  lineHeight: 1.9,
  /** 字间距 */
  letterSpacing: "0.02em",
  /** 段落之间的间距 */
  paragraphGap: "1.25rem",
};

/** 正文文字的通用样式（字号/行高/字间距），用于 p / ul / ol / blockquote */
export const bodyTextStyle: CSSProperties = {
  fontSize: ARTICLE_STYLE.fontSize,
  lineHeight: ARTICLE_STYLE.lineHeight,
  letterSpacing: ARTICLE_STYLE.letterSpacing,
};

/** 段落样式：在通用样式上叠加段间距、对齐方式与首行缩进 */
export const paragraphStyle: CSSProperties = {
  ...bodyTextStyle,
  marginTop: ARTICLE_STYLE.paragraphGap,
  textAlign: ARTICLE_STYLE.justify ? "justify" : "left",
  textIndent: ARTICLE_STYLE.firstLineIndent ? "2em" : 0,
};
