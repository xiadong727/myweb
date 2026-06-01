import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import matter from "gray-matter";
import type { SectionKey, SiteNavigation, NavNode, NavGroup } from "./types";
import { isNavGroup } from "./types";
import { readManyMetrics } from "./metrics";

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

/** 与光同行领域 → 文件夹名（用于自动建议路径） */
const DOMAIN_FOLDER: Record<string, string> = {
  L01: "L01-philosophy", L02: "L02-thinking", L03: "L03-character", L04: "L04-history",
  L05: "L05-science", L06: "L06-art", L07: "L07-relationship", L08: "L08-wealth",
  L09: "L09-life", L10: "L10-spirit",
};

// ---------- 基础读写 ----------
function readNav(): SiteNavigation {
  return JSON.parse(fs.readFileSync(NAV_PATH, "utf8"));
}
function writeNav(nav: SiteNavigation) {
  fs.writeFileSync(NAV_PATH, JSON.stringify(nav, null, 2) + "\n", "utf8");
}
function readArr<T>(file: string): T[] {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8")) as T[];
}
function writeArr<T>(file: string, data: T[]) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}
function sanitizeSlug(s: string) {
  return s.trim().replace(/^\/+|\/+$/g, "").replace(/\.md$/i, "");
}

// ---------- 导航树工具 ----------
function collectIds(nodes: NavNode[], acc: Set<string>) {
  for (const n of nodes) { acc.add(n.id); if (isNavGroup(n)) collectIds(n.children, acc); }
}
function allIds(nav: SiteNavigation): Set<string> {
  const s = new Set<string>();
  (Object.keys(nav.trees) as SectionKey[]).forEach((k) => collectIds(nav.trees[k].nodes, s));
  return s;
}
function uniqueId(base: string, used: Set<string>): string {
  let id = base || "node"; let i = 2;
  while (used.has(id)) id = `${base}-${i++}`;
  used.add(id);
  return id;
}
function findGroup(nodes: NavNode[], id: string): NavGroup | null {
  for (const n of nodes) {
    if (n.id === id && isNavGroup(n)) return n;
    if (isNavGroup(n)) { const r = findGroup(n.children, id); if (r) return r; }
  }
  return null;
}
/** 定位某 id 的节点所在的兄弟数组与下标 */
function locate(nodes: NavNode[], id: string): { siblings: NavNode[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { siblings: nodes, index: i };
    const n = nodes[i];
    if (isNavGroup(n)) { const r = locate(n.children, id); if (r) return r; }
  }
  return null;
}
function addNavNode(nav: SiteNavigation, section: SectionKey, parentId: string, node: NavNode) {
  if (!parentId) { nav.trees[section].nodes.push(node); return true; }
  const parent = findGroup(nav.trees[section].nodes, parentId);
  if (!parent) return false;
  parent.children.push(node);
  return true;
}
function removeBySlug(nodes: NavNode[], slug: string): boolean {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!isNavGroup(n) && n.slug === slug) { nodes.splice(i, 1); return true; }
    if (isNavGroup(n) && removeBySlug(n.children, slug)) return true;
  }
  return false;
}
/** 取出（并从原位置移除）某 slug 对应的内容节点 */
function takeLeafBySlug(nodes: NavNode[], slug: string): NavNode | null {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!isNavGroup(n) && n.slug === slug) { nodes.splice(i, 1); return n; }
    if (isNavGroup(n)) { const r = takeLeafBySlug(n.children, slug); if (r) return r; }
  }
  return null;
}
function updateTitleBySlug(nodes: NavNode[], slug: string, title: string): boolean {
  for (const n of nodes) {
    if (!isNavGroup(n) && n.slug === slug) { n.title = title; return true; }
    if (isNavGroup(n) && updateTitleBySlug(n.children, slug, title)) return true;
  }
  return false;
}

// ---------- 选项 / 列表（后台 UI 用） ----------
export type CategoryOption = { id: string; label: string };
function flattenGroups(nodes: NavNode[], depth: number, out: CategoryOption[]) {
  for (const n of nodes) {
    if (isNavGroup(n)) { out.push({ id: n.id, label: `${"　".repeat(depth)}${n.title}` }); flattenGroups(n.children, depth + 1, out); }
  }
}
function listArticles(): { slug: string; title: string }[] {
  const out: { slug: string; title: string }[] = [];
  const walk = (dir: string, prefix: string[]) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full, [...prefix, name]);
      else if (name.endsWith(".md")) {
        const slug = [...prefix, name.replace(/\.md$/, "")].join("/");
        const { data } = matter(fs.readFileSync(full, "utf8"));
        out.push({ slug, title: (data.title as string) || slug });
      }
    }
  };
  walk(ARTICLES_DIR, []);
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getAdminOptions() {
  const nav = readNav();
  const sections = {} as Record<SectionKey, CategoryOption[]>;
  (["articles", "images", "videos", "audios"] as SectionKey[]).forEach((k) => {
    const opts: CategoryOption[] = [{ id: "", label: "（放到该板块顶层）" }];
    flattenGroups(nav.trees[k].nodes, 0, opts);
    sections[k] = opts;
  });

  const articlesRaw = listArticles();
  const imagesRaw = readArr<{ slug: string; title: string }>(MEDIA_FILE.images).map((x) => ({ slug: x.slug, title: x.title }));
  const videosRaw = readArr<{ slug: string; title: string }>(MEDIA_FILE.videos).map((x) => ({ slug: x.slug, title: x.title }));
  const audiosRaw = readArr<{ slug: string; title: string }>(MEDIA_FILE.audios).map((x) => ({ slug: x.slug, title: x.title }));

  // 读取每条内容的浏览量/点赞（用于管理列表展示）
  const ids: string[] = [
    ...articlesRaw.map((x) => `articles:${x.slug}`),
    ...imagesRaw.map((x) => `images:${x.slug}`),
    ...videosRaw.map((x) => `videos:${x.slug}`),
    ...audiosRaw.map((x) => `audios:${x.slug}`),
  ];
  const metrics = await readManyMetrics(ids);
  const withM = (section: SectionKey, arr: { slug: string; title: string }[]) =>
    arr.map((x) => ({ ...x, ...(metrics[`${section}:${x.slug}`] ?? { views: 0, likes: 0 }) }));
  const articles = withM("articles", articlesRaw);
  const images = withM("images", imagesRaw);
  const videos = withM("videos", videosRaw);
  const audios = withM("audios", audiosRaw);

  // 每个领域的下一期 + 文件夹
  const arts = listArticles();
  const domains: Record<string, { folder: string; nextEpisode: number }> = {};
  for (const [code, folder] of Object.entries(DOMAIN_FOLDER)) {
    let max = 0;
    for (const a of arts) {
      const m = a.slug.match(new RegExp(`lighthouse/${folder}/ep(\\d+)`));
      if (m) max = Math.max(max, Number(m[1]));
    }
    domains[code] = { folder, nextEpisode: max + 1 };
  }

  return {
    sections,
    lists: { articles, images, videos, audios },
    existingSlugs: { articles: articles.map((a) => a.slug), images: images.map((x) => x.slug), videos: videos.map((x) => x.slug), audios: audios.map((x) => x.slug) },
    domains,
    navTree: nav.trees,
  };
}

// ---------- 文章 增/查/改/删 ----------
type ArticleFields = { title: string; date?: string; excerpt?: string; tags?: string[]; domain?: string; episode?: number; quote?: string; draft?: boolean };

/** 把编辑表单的字段合并进（已有的）frontmatter 数据，保留 year/layer 等其它字段 */
function mergeFrontmatter(base: Record<string, unknown>, input: ArticleFields): Record<string, unknown> {
  const data = { ...base };
  const setOrDel = (k: string, val: unknown) => {
    if (val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) delete data[k];
    else data[k] = val;
  };
  data.title = input.title;
  setOrDel("date", input.date);
  setOrDel("excerpt", input.excerpt);
  setOrDel("tags", input.tags && input.tags.length ? input.tags : undefined);
  setOrDel("domain", input.domain);
  if (input.episode != null) data.episode = input.episode; else delete data.episode;
  setOrDel("quote", input.quote);
  if (input.draft) data.draft = true; else delete data.draft;
  return data;
}

export type ArticleInput = {
  slug: string; title: string; date?: string; excerpt?: string; tags?: string[];
  domain?: string; episode?: number; quote?: string; draft?: boolean; body: string;
  navParentId: string; navTitle?: string;
};

export function createArticle(input: ArticleInput) {
  const slug = sanitizeSlug(input.slug);
  if (!slug || !/^[\w\-/]+$/.test(slug)) throw new Error("文件路径只能包含字母数字、- _ /");
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (fs.existsSync(file)) throw new Error(`文件已存在：${slug}.md`);
  const data = mergeFrontmatter({}, input);
  const content = matter.stringify(`# ${input.title}\n\n${input.body || ""}`, data);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");

  const nav = readNav();
  const id = uniqueId(`a-${slug.replace(/\//g, "-")}`, allIds(nav));
  if (!addNavNode(nav, "articles", input.navParentId, { id, title: input.navTitle?.trim() || input.title, slug }))
    throw new Error("没找到要挂载的分类，请重选");
  writeNav(nav);
  return { slug, file: `content/articles/${slug}.md`, navId: id };
}

export function getArticle(slug: string) {
  const file = path.join(ARTICLES_DIR, `${sanitizeSlug(slug)}.md`);
  if (!fs.existsSync(file)) throw new Error("文章不存在");
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  // 去掉与标题重复的首个 H1，得到纯正文
  const body = content.replace(/^\s*#\s+.*\r?\n+/, "");
  return {
    slug,
    title: (data.title as string) || "",
    date: (data.date as string) || "",
    excerpt: (data.excerpt as string) || "",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    domain: (data.domain as string) || "",
    episode: data.episode != null ? String(data.episode) : "",
    quote: (data.quote as string) || "",
    draft: Boolean(data.draft),
    body,
  };
}

export function updateArticle(slug0: string, input: Omit<ArticleInput, "slug" | "navParentId"> & { navTitle?: string }) {
  const slug = sanitizeSlug(slug0);
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) throw new Error("文章不存在");
  const existing = matter(fs.readFileSync(file, "utf8")).data as Record<string, unknown>;
  const data = mergeFrontmatter(existing, input);
  const content = matter.stringify(`# ${input.title}\n\n${input.body || ""}`, data);
  fs.writeFileSync(file, content, "utf8");
  const nav = readNav();
  updateTitleBySlug(nav.trees.articles.nodes, slug, input.navTitle?.trim() || input.title);
  writeNav(nav);
  return { slug };
}

export function deleteArticle(slug0: string) {
  const slug = sanitizeSlug(slug0);
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  const nav = readNav();
  removeBySlug(nav.trees.articles.nodes, slug);
  writeNav(nav);
  return { slug };
}

// ---------- 媒体 增/查/改/删 ----------
export function createMedia({ section, item, navParentId, navTitle }: { section: Exclude<SectionKey, "articles">; item: Record<string, unknown> & { slug: string; title: string }; navParentId: string; navTitle?: string }) {
  const slug = sanitizeSlug(item.slug);
  if (!slug || !/^[\w\-/]+$/.test(slug)) throw new Error("slug 只能包含字母数字、- _ /");
  const arr = readArr<{ slug: string }>(MEDIA_FILE[section]);
  if (arr.some((x) => x.slug === slug)) throw new Error(`该 slug 已存在：${slug}`);
  arr.push({ ...item, slug });
  writeArr(MEDIA_FILE[section], arr);
  const nav = readNav();
  const prefix = section === "images" ? "img" : section === "videos" ? "vid" : "aud";
  const id = uniqueId(`${prefix}-${slug.replace(/\//g, "-")}`, allIds(nav));
  if (!addNavNode(nav, section, navParentId, { id, title: navTitle?.trim() || item.title, slug }))
    throw new Error("没找到要挂载的分类，请重选");
  writeNav(nav);
  return { slug, navId: id };
}

export function getMediaItem(section: Exclude<SectionKey, "articles">, slug0: string) {
  const slug = sanitizeSlug(slug0);
  const item = readArr<Record<string, unknown> & { slug: string }>(MEDIA_FILE[section]).find((x) => x.slug === slug);
  if (!item) throw new Error("内容不存在");
  return item;
}

export function updateMedia(section: Exclude<SectionKey, "articles">, slug0: string, item: Record<string, unknown> & { title: string }, navTitle?: string) {
  const slug = sanitizeSlug(slug0);
  const arr = readArr<Record<string, unknown> & { slug: string }>(MEDIA_FILE[section]);
  const i = arr.findIndex((x) => x.slug === slug);
  if (i < 0) throw new Error("内容不存在");
  arr[i] = { ...item, slug };
  writeArr(MEDIA_FILE[section], arr);
  const nav = readNav();
  updateTitleBySlug(nav.trees[section].nodes, slug, navTitle?.trim() || item.title);
  writeNav(nav);
  return { slug };
}

export function deleteMedia(section: Exclude<SectionKey, "articles">, slug0: string) {
  const slug = sanitizeSlug(slug0);
  const arr = readArr<{ slug: string }>(MEDIA_FILE[section]).filter((x) => x.slug !== slug);
  writeArr(MEDIA_FILE[section], arr);
  const nav = readNav();
  removeBySlug(nav.trees[section].nodes, slug);
  writeNav(nav);
  return { slug };
}

// ---------- 图片 ----------
export function saveImage(filename: string, buffer: Buffer) {
  const safe = filename.replace(/[^\w.\-]/g, "_");
  fs.mkdirSync(PUBLIC_IMAGES, { recursive: true });
  let name = safe; let i = 2;
  while (fs.existsSync(path.join(PUBLIC_IMAGES, name))) {
    const dot = safe.lastIndexOf(".");
    name = dot > 0 ? `${safe.slice(0, dot)}-${i}${safe.slice(dot)}` : `${safe}-${i}`;
    i++;
  }
  fs.writeFileSync(path.join(PUBLIC_IMAGES, name), buffer);
  return `/images/${name}`;
}
export function listImages(): string[] {
  if (!fs.existsSync(PUBLIC_IMAGES)) return [];
  return fs.readdirSync(PUBLIC_IMAGES)
    .filter((f) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(f))
    .map((f) => `/images/${f}`);
}

// ---------- 菜单管理 ----------
export function navOp(section: SectionKey, op: string, payload: { id?: string; slug?: string; title?: string; parentId?: string; dir?: "up" | "down" }) {
  const nav = readNav();
  const tree = nav.trees[section];
  if (op === "moveBySlug") {
    const node = takeLeafBySlug(tree.nodes, payload.slug || "");
    if (!node) throw new Error("未找到该内容的菜单条目");
    if (!addNavNode(nav, section, payload.parentId || "", node)) throw new Error("未找到目标分类");
  } else if (op === "rename") {
    const loc = locate(tree.nodes, payload.id || "");
    if (!loc) throw new Error("未找到节点");
    loc.siblings[loc.index].title = (payload.title || "").trim() || loc.siblings[loc.index].title;
  } else if (op === "move") {
    const loc = locate(tree.nodes, payload.id || "");
    if (!loc) throw new Error("未找到节点");
    const j = payload.dir === "up" ? loc.index - 1 : loc.index + 1;
    if (j < 0 || j >= loc.siblings.length) return { ok: true }; // 已在边界
    [loc.siblings[loc.index], loc.siblings[j]] = [loc.siblings[j], loc.siblings[loc.index]];
  } else if (op === "addCategory") {
    const id = uniqueId(`cat-${(payload.title || "x").replace(/\s+/g, "-")}`, allIds(nav));
    const node: NavGroup = { id, title: (payload.title || "新分类").trim(), children: [] };
    if (!addNavNode(nav, section, payload.parentId || "", node)) throw new Error("未找到父级分类");
  } else if (op === "delete") {
    const loc = locate(tree.nodes, payload.id || "");
    if (!loc) throw new Error("未找到节点");
    const node = loc.siblings[loc.index];
    if (isNavGroup(node) && node.children.length > 0) throw new Error("该分类下还有内容，请先清空或移走");
    loc.siblings.splice(loc.index, 1);
  } else {
    throw new Error("未知操作");
  }
  writeNav(nav);
  return { ok: true };
}

// ---------- 一键发布（本地执行 git） ----------
export function gitPublish(message: string) {
  const msg = (message || "更新内容").replace(/"/g, "'").slice(0, 200);
  try {
    execSync("git add -A", { cwd: ROOT, stdio: "pipe" });
    // 没有改动时 commit 会失败，先判断
    const status = execSync("git status --porcelain", { cwd: ROOT, stdio: "pipe" }).toString().trim();
    if (!status) return { ok: true, message: "没有需要发布的改动" };
    execSync(`git commit -m "${msg}"`, { cwd: ROOT, stdio: "pipe" });
    execSync("git push", { cwd: ROOT, stdio: "pipe" });
    return { ok: true, message: "已提交并推送，Vercel 将自动部署（约 1–2 分钟）" };
  } catch (e) {
    const out = (e as { stderr?: Buffer; stdout?: Buffer; message?: string });
    const detail = out.stderr?.toString() || out.stdout?.toString() || out.message || "未知错误";
    throw new Error(`已保存到本地，但自动推送失败：${detail.slice(0, 300)}。请在 Cursor 手动提交推送。`);
  }
}
