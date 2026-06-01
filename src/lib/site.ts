/**
 * 站点对外的根地址，用于 sitemap、robots、RSS 与 Open Graph 等绝对链接。
 * 部署到自有域名后，在 Vercel 项目的环境变量里设置 NEXT_PUBLIC_SITE_URL，
 * 例如 https://你的域名.com（结尾不要带斜杠）。未设置时回退到下面的占位地址。
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(
  /\/+$/,
  "",
);

export const SITE_NAME = "拾光共长";
export const SITE_DESCRIPTION = "认知、智慧、亲子教育与美好时光 — 文章、影像与记录";

/** 拼接站点绝对地址 */
export function absoluteUrl(pathname: string): string {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

/** 草稿可见性：仅本地开发可见，线上隐藏。用于「草稿」内容过滤。 */
export const DRAFTS_VISIBLE = process.env.NODE_ENV !== "production";
