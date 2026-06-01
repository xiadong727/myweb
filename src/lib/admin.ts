import fs from "fs";
import path from "path";
import type { SectionKey, SiteNavigation, NavNode, NavGroup } from "./types";
import { isNavGroup } from "./types";

/** 后台只在本地开发可用（线上文件系统只读，且出于安全禁止写入） */
export const ADMIN_ENABLED = process.env.NODE_ENV !== "production";

const ROOT = process.cwd();
const NAV_PATH = path.join(ROOT, "data/navigation.json");
const ARTICLES_DIR = path.join(ROOT, "content/articles");
const PUBLIC_IMAGES = path.join(ROOT, "public/images");
const MEDIA_FILE: Record<Exclude<SectionKey, "articles">, string> = {
  images: path.join(ROOT, "data/galleries.json"),
  videos: path.join(ROOT, "data/videos.json"),
  audios: path.join(ROOT, "data/audios.json"),
};

function readNav(): SiteNavigation {
  return JSON.parse(fs.readFileSync(NAV_PATH, "utf8"));
}
function writeNav(nav: SiteNavigation) {
  fs.writeFileSync(NAV_PATH, JSON.stringify(nav, null, 2) + "\n", "utf8");
}
function readJsonArray<T>(file: string): T[] {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8")) as T[];
}
function writeJsonArray<T>(file: string, data: T[]) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** 收集全导航里已用的 id，保证新 id 唯一 */
function collectIds(nodes: NavNode[], acc: Set<string>) {
  for (const n of nodes) {
    acc.add(n.id);
    if (isNavGroup(n)) collectIds(n.children, acc);
  }
}
function allIds(nav: SiteNavigation): Set<string> {
  const s = new Set<string>();
  (Object.keys(nav.trees) as SectionKey[]).forEach((k) => collectIds(nav.trees[k].nodes, s));
  return s;
}
function uniqueId(base: string, used: Set<string>): string {
  let id = base || "node";
  let i = 2;
  while (used.has(id)) id = `${base}-${i++}`;
  used.add(id);
  return id;
}

/** 某板块里所有「分类节点」（带 children 的），用于后台的父级下拉 */
export type CategoryOption = { id: string; label: string };
function flattenGroups(nodes: NavNode[], depth: number, out: CategoryOption[]) {
  for (const n of nodes) {
    if (isNavGroup(n)) {
      out.push({ id: n.id, label: `${"　".repeat(depth)}${n.title}` });
      flattenGroups(n.children, depth + 1, out);
    }
  }
}
export function getAdminOptions() {
  const nav = readNav();
  const sections: Record<SectionKey, CategoryOption[]> = {
    articles: [], images: [], videos: [], audios: [],
  };
  (Object.keys(sections) as SectionKey[]).forEach((k) => {
    const opts: CategoryOption[] = [{ id: "", label: "（放到该板块顶层）" }];
    flattenGroups(nav.trees[k].nodes, 0, opts);
    sections[k] = opts;
  });
  return { sections };
}

/** 在导航树里找到分类节点并塞入新条目；parentId 为空则放到该板块顶层 */
function addNavNode(nav: SiteNavigation, section: SectionKey, parentId: string, node: NavNode) {
  if (!parentId) {
    nav.trees[section].nodes.push(node);
    return true;
  }
  const find = (nodes: NavNode[]): NavGroup | null => {
    for (const n of nodes) {
      if (n.id === parentId && isNavGroup(n)) return n;
      if (isNavGroup(n)) {
        const r = find(n.children);
        if (r) return r;
      }
    }
    return null;
  };
  const parent = find(nav.trees[section].nodes);
  if (!parent) return false;
  parent.children.push(node);
  return true;
}

function sanitizeSlug(s: string) {
  return s.trim().replace(/^\/+|\/+$/g, "").replace(/\.md$/i, "");
}

export type CreateArticleInput = {
  slug: string;               // 相对 content/articles，不带 .md
  title: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
  domain?: string;            // 与光同行：L01..L10
  episode?: number;
  quote?: string;
  body: string;
  navParentId: string;
  navTitle?: string;
};

export function createArticle(input: CreateArticleInput) {
  const slug = sanitizeSlug(input.slug);
  if (!slug || !/^[\w\-/]+$/.test(slug)) throw new Error("文件路径只能包含字母数字、- _ /");
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (fs.existsSync(file)) throw new Error(`文件已存在：${slug}.md`);

  // 组装 frontmatter
  const fm: string[] = ["---"];
  fm.push(`title: ${JSON.stringify(input.title)}`);
  if (input.date) fm.push(`date: ${JSON.stringify(input.date)}`);
  if (input.excerpt) fm.push(`excerpt: ${JSON.stringify(input.excerpt)}`);
  if (input.tags?.length) fm.push(`tags: [${input.tags.map((t) => JSON.stringify(t)).join(", ")}]`);
  if (input.domain) fm.push(`domain: ${JSON.stringify(input.domain)}`);
  if (input.episode != null) fm.push(`episode: ${input.episode}`);
  if (input.quote) fm.push(`quote: ${JSON.stringify(input.quote)}`);
  fm.push("---", "", `# ${input.title}`, "", input.body || "");

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, fm.join("\n").replace(/\n*$/, "\n"), "utf8");

  // 挂导航
  const nav = readNav();
  const used = allIds(nav);
  const id = uniqueId(`a-${slug.replace(/\//g, "-")}`, used);
  const title = input.navTitle?.trim() || input.title;
  const ok = addNavNode(nav, "articles", input.navParentId, { id, title, slug });
  if (!ok) throw new Error("没找到要挂载的分类，请重选");
  writeNav(nav);
  return { slug, file: `content/articles/${slug}.md`, navId: id };
}

export type CreateMediaInput = {
  section: Exclude<SectionKey, "articles">;
  item: Record<string, unknown> & { slug: string; title: string };
  navParentId: string;
  navTitle?: string;
};

export function createMedia({ section, item, navParentId, navTitle }: CreateMediaInput) {
  const slug = sanitizeSlug(item.slug);
  if (!slug || !/^[\w\-/]+$/.test(slug)) throw new Error("slug 只能包含字母数字、- _ /");
  const file = MEDIA_FILE[section];
  const arr = readJsonArray<{ slug: string }>(file);
  if (arr.some((x) => x.slug === slug)) throw new Error(`该 slug 已存在：${slug}`);
  arr.push({ ...item, slug });
  writeJsonArray(file, arr);

  const nav = readNav();
  const used = allIds(nav);
  const prefix = section === "images" ? "img" : section === "videos" ? "vid" : "aud";
  const id = uniqueId(`${prefix}-${slug.replace(/\//g, "-")}`, used);
  const ok = addNavNode(nav, section, navParentId, { id, title: navTitle?.trim() || item.title, slug });
  if (!ok) throw new Error("没找到要挂载的分类，请重选");
  writeNav(nav);
  return { slug, navId: id };
}

/** 保存上传的图片到 public/images，返回站内路径 /images/xxx */
export function saveImage(filename: string, buffer: Buffer) {
  const safe = filename.replace(/[^\w.\-]/g, "_");
  fs.mkdirSync(PUBLIC_IMAGES, { recursive: true });
  let name = safe;
  let i = 2;
  while (fs.existsSync(path.join(PUBLIC_IMAGES, name))) {
    const dot = safe.lastIndexOf(".");
    name = dot > 0 ? `${safe.slice(0, dot)}-${i}${safe.slice(dot)}` : `${safe}-${i}`;
    i++;
  }
  fs.writeFileSync(path.join(PUBLIC_IMAGES, name), buffer);
  return `/images/${name}`;
}
