import { NextResponse } from "next/server";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { getArticleSummaries } from "@/lib/articles";

/** XML 特殊字符转义，保证生成的 RSS 合法 */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const dynamic = "force-static";

export function GET() {
  const articles = getArticleSummaries()
    .filter((a) => a.date)
    .sort((a, b) => (a.date! < b.date! ? 1 : -1))
    .slice(0, 50);

  const items = articles
    .map((a) => {
      const link = `${SITE_URL}/articles/${a.slug}`;
      const pubDate = new Date(a.date!).toUTCString();
      const desc = a.excerpt ?? "";
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(desc)}</description>
    </item>`;
    })
    .join("\n");

  const lastBuild = articles[0]?.date
    ? new Date(articles[0].date).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
