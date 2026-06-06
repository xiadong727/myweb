import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import MiniSearch from "minisearch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function walkMarkdown(dir, prefix, out) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkMarkdown(full, [...prefix, name], out);
    else if (name.endsWith(".md")) {
      const slug = [...prefix, name.replace(/\.md$/, "")].join("/");
      const raw = fs.readFileSync(full, "utf8");
      const { data, content } = matter(raw);
      if (data.draft) continue; // 跳过草稿
      const title = data.title || slug;
      const excerpt = data.excerpt || "";
      const text = [title, excerpt, content].join("\n");
      out.push({
        id: `article:${slug}`,
        title,
        text,
        href: `/articles/${slug}`,
        type: "article",
      });
    }
  }
}

function loadJson(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const docs = [];

walkMarkdown(path.join(root, "content/articles"), [], docs);

const galleries = loadJson("data/galleries.json") || [];
for (const g of galleries) {
  if (g.draft) continue;
  docs.push({
    id: `image:${g.slug}`,
    title: g.title,
    text: [g.title, g.description || "", (g.images || []).map((i) => i.alt).join(" ")].join(
      "\n"
    ),
    href: `/images/${g.slug}`,
    type: "image",
  });
}

const videos = loadJson("data/videos.json") || [];
for (const v of videos) {
  if (v.draft) continue;
  docs.push({
    id: `video:${v.slug}`,
    title: v.title,
    text: [v.title, v.description || ""].join("\n"),
    href: `/videos/${v.slug}`,
    type: "video",
  });
}

const audios = loadJson("data/audios.json") || [];
for (const a of audios) {
  if (a.draft) continue;
  docs.push({
    id: `audio:${a.slug}`,
    title: a.title,
    text: [a.title, a.description || ""].join("\n"),
    href: `/audios/${a.slug}`,
    type: "audio",
  });
}

// \u4e2d\u6587\u4e8c\u5143\u5206\u8bcd\uff08bigram\uff09\uff1a\u8fde\u7eed\u6c49\u5b57\u5207\u6210\u76f8\u90bb\u4e24\u5b57\u4e00\u7ec4\uff0c\u907f\u514d\u6309\u5355\u5b57\u5339\u914d\u628a\u65e0\u5173\u5185\u5bb9\u53ec\u56de\u3002
// \u62c9\u4e01\u5b57\u6bcd/\u6570\u5b57\u6309\u6574\u8bcd\u5904\u7406\u3002\u26a0\ufe0f \u5fc5\u987b\u4e0e src/components/global-search.tsx \u4e2d\u7684 tokenize \u5b8c\u5168\u4e00\u81f4\u3002
const tokenize = (string) => {
  const tokens = [];
  const re = /[\u4e00-\u9fff]+|[a-z0-9]+/gi;
  let m;
  while ((m = re.exec(string.toLowerCase())) !== null) {
    const seg = m[0];
    if (/[\u4e00-\u9fff]/.test(seg)) {
      if (seg.length === 1) tokens.push(seg);
      else for (let i = 0; i < seg.length - 1; i++) tokens.push(seg.slice(i, i + 2));
    } else {
      tokens.push(seg);
    }
  }
  return tokens;
};

const miniSearch = new MiniSearch({
  fields: ["title", "text"],
  storeFields: ["title", "href", "type"],
  idField: "id",
  tokenize,
});

miniSearch.addAll(docs);

const outDir = path.join(root, "public");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "search-index.json"), JSON.stringify(miniSearch.toJSON()));
console.log(`search-index: ${docs.length} documents`);
