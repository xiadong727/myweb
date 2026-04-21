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
  docs.push({
    id: `audio:${a.slug}`,
    title: a.title,
    text: [a.title, a.description || ""].join("\n"),
    href: `/audios/${a.slug}`,
    type: "audio",
  });
}

const tokenize = (string) => {
  return string
    .toLowerCase()
    .split(/[\s\-_]+|(?=[\u4e00-\u9fa5])|(?<=[\u4e00-\u9fa5])/)
    .filter((s) => s.trim());
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
