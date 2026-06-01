import { parse, type HTMLElement, type Node } from "node-html-parser";
import { saveImage, createArticle, createMedia } from "./admin";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

async function downloadImage(url: string, referer: string, prefix: string): Promise<string | null> {
  try {
    const u = url.startsWith("//") ? `https:${url}` : url;
    const res = await fetch(u, { headers: { "User-Agent": UA, Referer: referer } });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    const extFromCt = ct.includes("png") ? "png" : ct.includes("gif") ? "gif" : ct.includes("webp") ? "webp" : "jpg";
    const buf = Buffer.from(await res.arrayBuffer());
    const hash = Math.abs([...u].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36);
    return saveImage(`${prefix}-${hash}.${extFromCt}`, buf);
  } catch {
    return null;
  }
}

// ---------- HTML → Markdown（聚焦公众号正文常见标签） ----------
function nodeToMd(node: Node): string {
  // 文本节点
  // @ts-expect-error node-html-parser TextNode has nodeType 3
  if (node.nodeType === 3) return (node.text || "").replace(/\s+/g, " ");
  const el = node as HTMLElement;
  const tag = (el.tagName || "").toLowerCase();
  const inner = el.childNodes.map(nodeToMd).join("");
  switch (tag) {
    case "h1": case "h2": case "h3": case "h4": case "h5": case "h6":
      return `\n\n## ${inner.trim()}\n\n`;
    case "br": return "\n";
    case "strong": case "b": { const t = inner.trim(); return t ? `**${t}**` : ""; }
    case "em": case "i": { const t = inner.trim(); return t ? `*${t}*` : ""; }
    case "a": { const href = el.getAttribute("href"); const t = inner.trim(); return href && t ? `[${t}](${href})` : t; }
    case "img": { const src = el.getAttribute("src") || el.getAttribute("data-src"); return src ? `\n\n![](${src})\n\n` : ""; }
    case "li": return `\n- ${inner.trim()}`;
    case "ul": case "ol": return `\n\n${inner}\n\n`;
    case "blockquote": return `\n\n> ${inner.trim().replace(/\n/g, "\n> ")}\n\n`;
    case "figcaption": { const t = inner.trim(); return t ? `\n\n*${t}*\n\n` : ""; }
    case "p": case "section": case "div": case "article": case "figure": case "header": case "h":
      return `\n\n${inner}\n\n`;
    default: return inner;
  }
}
function htmlToMarkdown(root: HTMLElement): string {
  return nodeToMd(root).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ---------- 公众号 ----------
export async function importWeChat(url: string, navParentId: string) {
  const clean = url.trim();
  if (!/^https?:\/\/mp\.weixin\.qq\.com\/s/.test(clean)) throw new Error("不是有效的公众号文章链接（应为 mp.weixin.qq.com/s/…）");
  const res = await fetch(clean, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`抓取失败（HTTP ${res.status}）`);
  const html = await res.text();
  const root = parse(html);
  const title =
    root.querySelector('meta[property="og:title"]')?.getAttribute("content")?.trim() ||
    root.querySelector("#activity-name")?.text.trim() ||
    root.querySelector("h1")?.text.trim() || "未命名文章";
  const content = root.querySelector("#js_content");
  if (!content) throw new Error("没找到正文（可能不是图文消息，或页面结构变化）");

  // 把所有图片下载到本地并改写 src
  const idMatch = clean.match(/\/s\/([\w-]+)/) || clean.match(/[?&]sn=([\w]+)/);
  const sid = (idMatch?.[1] || Math.abs([...clean].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 1)).toString(36)).slice(0, 12);
  const imgs = content.querySelectorAll("img");
  for (const img of imgs) {
    const src = img.getAttribute("data-src") || img.getAttribute("src");
    if (!src) continue;
    const local = await downloadImage(src, "https://mp.weixin.qq.com/", `wx-${sid}`);
    if (local) img.setAttribute("src", local);
    else img.removeAttribute("src");
  }
  const body = htmlToMarkdown(content);
  const slug = `imported/wx-${sid}`;
  const r = createArticle({ slug, title, excerpt: "", body, draft: true, navParentId, navTitle: title });
  return { ok: true, slug: r.slug, title };
}

// ---------- B站 ----------
function extractBV(input: string): string | null {
  const m = input.match(/BV[0-9A-Za-z]+/);
  return m ? m[0] : null;
}
export async function importBilibili(input: string, navParentId: string) {
  const bv = extractBV(input.trim());
  if (!bv) throw new Error("没识别到 BV 号（粘贴 B 站视频链接或 BVxxxx）");
  const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bv}`, { headers: { "User-Agent": UA, Referer: "https://www.bilibili.com/" } });
  const json = await res.json();
  if (json.code !== 0 || !json.data) throw new Error(`B站接口返回错误：${json.message || json.code}`);
  const { title, desc, pic } = json.data as { title: string; desc: string; pic: string };
  let poster: string | undefined;
  if (pic) { const local = await downloadImage(pic, "https://www.bilibili.com/", `bili-${bv}`); if (local) poster = local; }
  const slug = `imported/bili-${bv}`;
  const item = {
    slug, title, description: (desc || "").slice(0, 200),
    kind: "embed" as const,
    embedUrl: `https://player.bilibili.com/player.html?bvid=${bv}&page=1&high_quality=1&danmaku=0`,
    originalUrl: `https://www.bilibili.com/video/${bv}`,
    ...(poster ? { poster } : {}),
    draft: true,
  };
  const r = createMedia({ section: "videos", item, navParentId, navTitle: title });
  return { ok: true, slug: r.slug, title };
}
