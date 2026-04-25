/**
 * 将 Markdown 中的相对资源路径解析为站内可访问 URL。
 * 绝对路径（以 / 开头）与外链保持不变；相对路径相对于「该篇 .md 所在目录」。
 */
export function resolveArticleMarkdownAssetUrl(src: string | undefined, articleSlug: string): string {
  if (!src || typeof src !== "string") return "";
  const t = src.trim();
  if (!t) return "";
  if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("//")) return t;
  if (t.startsWith("/")) return t;
  if (t.includes("..")) return t;
  const cleaned = t.replace(/^\.\//, "");
  const slash = articleSlug.lastIndexOf("/");
  const dir = slash >= 0 ? articleSlug.slice(0, slash) : "";
  const rel = dir ? `${dir}/${cleaned}` : cleaned;
  return `/media/articles/${rel.split("/").map((seg) => encodeURIComponent(seg)).join("/")}`;
}
