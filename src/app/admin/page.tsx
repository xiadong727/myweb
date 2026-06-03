"use client";

import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { MenuManager } from "@/components/admin/menu-manager";
import { ImagePicker } from "@/components/admin/image-picker";
import { uploadFiles } from "@/lib/admin-client";
import type { SectionKey } from "@/lib/types";

type Opt = { id: string; label: string };
type ListItem = { slug: string; title: string; views?: number; likes?: number };
type Data = {
  sections: Record<SectionKey, Opt[]>;
  lists: Record<SectionKey, ListItem[]>;
  existingSlugs: Record<SectionKey, string[]>;
  domains: Record<string, { folder: string; nextEpisode: number }>;
  navTree: Record<SectionKey, { label: string; nodes: unknown[] }>;
};
type View = "create" | "manage" | "menu" | "import" | "settings";
type ImportResult = { input: string; ok: boolean; title?: string; slug?: string; error?: string };
type ArtStyle = { firstLineIndent: boolean; justify: boolean; fontSize: string; lineHeight: number; letterSpacing: string; paragraphGap: string };
type Tab = SectionKey;

const DOMAINS: [string, string][] = [
  ["", "（不是与光同行主线）"],
  ["L01", "L01 哲学"], ["L02", "L02 思维"], ["L03", "L03 品格"], ["L04", "L04 历史"],
  ["L05", "L05 科学"], ["L06", "L06 艺术"], ["L07", "L07 人际"], ["L08", "L08 财富"],
  ["L09", "L09 生活"], ["L10", "L10 心灵"],
];
const inputCls = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50";
const today = () => new Date().toISOString().slice(0, 10);

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint ? <span className="ml-2 text-xs text-muted-foreground">{hint}</span> : null}
      <div className="mt-1">{children}</div>
    </label>
  );
}

const emptyA = { slug: "", title: "", date: "", excerpt: "", tags: "", domain: "", episode: "", quote: "", body: "", navParentId: "", navTitle: "", draft: false };
const emptyG = { slug: "", title: "", description: "", cover: "", episode: "", navParentId: "", navTitle: "", draft: false };
const emptyV = { slug: "", title: "", description: "", kind: "embed", embedUrl: "", src: "", originalUrl: "", episode: "", navParentId: "", navTitle: "", draft: false };
const emptyAu = { slug: "", title: "", description: "", src: "", cover: "", episode: "", navParentId: "", navTitle: "", draft: false };
const DRAFT_KEY = "admin-draft-article";

export default function AdminPage() {
  const [view, setView] = useState<View>("create");
  const [tab, setTab] = useState<Tab>("articles");
  const [data, setData] = useState<Data | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; href?: string } | null>(null);
  const [imp, setImp] = useState<{ type: "wechat" | "bilibili"; text: string; parent: string }>({ type: "wechat", text: "", parent: "" });
  const [impResults, setImpResults] = useState<ImportResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState<string | null>(null); // slug being edited, null = create
  const [preview, setPreview] = useState(false);
  const [picker, setPicker] = useState<null | { onPick: (p: string[]) => void; multiple?: boolean }>(null);

  const [a, setA] = useState(() => ({ ...emptyA, date: today() }));
  const [g, setG] = useState({ ...emptyG });
  const [gImages, setGImages] = useState<{ src: string; alt: string }[]>([]);
  const [v, setV] = useState({ ...emptyV });
  const [au, setAu] = useState({ ...emptyAu });
  const [q, setQ] = useState(""); // 管理列表搜索
  const [bili, setBili] = useState(""); // B站链接转换输入
  const [settings, setSettings] = useState<ArtStyle | null>(null);

  const reload = useCallback(() => {
    fetch("/api/admin/options").then((r) => r.json()).then((d) => (d.error ? setMsg({ ok: false, text: d.error }) : setData(d)))
      .catch(() => setMsg({ ok: false, text: "无法连接后台（请在本地 npm run dev 下打开）" }));
  }, []);
  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // 恢复上次未保存的文章草稿（本地）
  useEffect(() => {
    let s: string | null = null;
    try { s = localStorage.getItem(DRAFT_KEY); } catch { /* ignore */ }
    if (!s) return;
    try {
      const d = JSON.parse(s);
      if (d && (d.title || d.body)) queueMicrotask(() => { setA(d); setMsg({ ok: true, text: "已恢复上次未保存的文章草稿（如不需要，点上方「取消」或直接覆盖）" }); });
    } catch { /* ignore */ }
  }, []);

  // 进入「设置」时加载文章排版配置
  useEffect(() => {
    if (view !== "settings" || settings) return;
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => { if (d.article) setSettings(d.article); }).catch(() => {});
  }, [view, settings]);

  async function saveSettings() {
    if (!settings) return;
    const d = await api("/api/admin/settings", "POST", { article: settings });
    if (d) setMsg({ ok: true, text: "✅ 排版设置已保存。本地立即生效；线上点「发布」后生效。" });
  }

  // 自动保存文章表单到本地（仅新建文章时）
  useEffect(() => {
    if (view !== "create" || tab !== "articles" || editing) return;
    const t = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(a)); } catch { /* ignore */ } }, 800);
    return () => clearTimeout(t);
  }, [a, view, tab, editing]);

  const markDirty = () => setDirty(true);
  function resetForms() { setA({ ...emptyA, date: today() }); setG({ ...emptyG }); setGImages([]); setV({ ...emptyV }); setAu({ ...emptyAu }); setEditing(null); setDirty(false); try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } }

  // B 站链接/BV号 → 嵌入链接
  function applyBilibili() {
    const m = bili.match(/BV[0-9A-Za-z]+/);
    if (!m) { setMsg({ ok: false, text: "没识别到 BV 号，请粘贴 B 站视频链接或 BVxxxx" }); return; }
    const bv = m[0];
    setV((s) => ({ ...s, embedUrl: `https://player.bilibili.com/player.html?bvid=${bv}&page=1&high_quality=1&danmaku=0`, originalUrl: `https://www.bilibili.com/video/${bv}` }));
    setMsg({ ok: true, text: `✅ 已根据 ${bv} 自动填好嵌入链接` });
  }

  async function api(url: string, method: string, payload?: unknown) {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(url, { method, headers: payload ? { "Content-Type": "application/json" } : undefined, body: payload ? JSON.stringify(payload) : undefined });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "操作失败");
      return d;
    } catch (e) { setMsg({ ok: false, text: `❌ ${(e as Error).message}` }); return null; }
    finally { setBusy(false); }
  }

  const dupSlug = (section: Tab, slug: string) => !editing && slug && data?.existingSlugs[section]?.includes(slug.trim());

  // —— 选领域后自动带出该领域的文件夹路径前缀 —— //
  function onDomainChange(domain: string) {
    if (!domain || !data) { setA((s) => ({ ...s, domain })); return; }
    const info = data.domains[domain];
    setA((s) => ({ ...s, domain, slug: s.slug || `lighthouse/${info.folder}/` }));
  }

  // —— 提交（新建/更新） —— //
  async function saveArticle() {
    if (dupSlug("articles", a.slug)) { setMsg({ ok: false, text: "该文件路径已存在，请换一个" }); return; }
    const navTitle = a.navTitle || a.title;
    const payload = { ...a, navTitle, tags: a.tags ? a.tags.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : [] };
    const d = editing ? await api("/api/admin/article", "PUT", payload) : await api("/api/admin/article", "POST", payload);
    if (d) { setMsg({ ok: true, text: `✅ 已${editing ? "更新" : "保存"}：${d.slug}`, href: `/articles/${d.slug}` }); setDirty(false); try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } reload(); }
  }
  async function moveTo(section: Tab, slug: string, parentId: string, title: string) {
    const d = await api("/api/admin/nav", "POST", { section, op: "moveBySlug", slug, parentId, title });
    if (d) { setMsg({ ok: true, text: "✅ 已归类到所选菜单分类" }); reload(); }
  }
  async function saveMedia(section: Exclude<SectionKey, "articles">) {
    let item: Record<string, unknown> & { slug: string; title: string }; let navTitle: string;
    if (section === "images") {
      if (!gImages.length) { setMsg({ ok: false, text: "请先添加至少一张图片" }); return; }
      if (dupSlug("images", g.slug)) { setMsg({ ok: false, text: "该 slug 已存在" }); return; }
      item = { slug: g.slug, title: g.title, description: g.description, cover: g.cover || gImages[0].src, images: gImages, ...(g.episode ? { episode: g.episode } : {}), ...(g.draft ? { draft: true } : {}) };
      navTitle = g.navTitle || g.title;
    } else if (section === "videos") {
      if (dupSlug("videos", v.slug)) { setMsg({ ok: false, text: "该 slug 已存在" }); return; }
      item = { slug: v.slug, title: v.title, description: v.description, kind: v.kind, ...(v.kind === "embed" ? { embedUrl: v.embedUrl, ...(v.originalUrl ? { originalUrl: v.originalUrl } : {}) } : { src: v.src }), ...(v.episode ? { episode: v.episode } : {}), ...(v.draft ? { draft: true } : {}) };
      navTitle = v.navTitle || v.title;
    } else {
      if (dupSlug("audios", au.slug)) { setMsg({ ok: false, text: "该 slug 已存在" }); return; }
      item = { slug: au.slug, title: au.title, description: au.description, src: au.src, ...(au.cover ? { cover: au.cover } : {}), ...(au.episode ? { episode: au.episode } : {}), ...(au.draft ? { draft: true } : {}) };
      navTitle = au.navTitle || au.title;
    }
    const parentId = section === "images" ? g.navParentId : section === "videos" ? v.navParentId : au.navParentId;
    const d = editing ? await api("/api/admin/media", "PUT", { section, item, navTitle }) : await api("/api/admin/media", "POST", { section, item, navParentId: parentId, navTitle });
    if (d) { setMsg({ ok: true, text: `✅ 已${editing ? "更新" : "保存"}：${d.slug}`, href: `/${section}/${d.slug}` }); setDirty(false); reload(); }
  }

  async function runImport() {
    const items = imp.text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (!items.length) { setMsg({ ok: false, text: "请粘贴至少一条链接" }); return; }
    setImpResults([]);
    const d = await api("/api/admin/import", "POST", { type: imp.type, items, navParentId: imp.parent });
    if (d) { setImpResults(d.results || []); const okN = (d.results || []).filter((r: ImportResult) => r.ok).length; setMsg({ ok: true, text: `导入完成：成功 ${okN} / ${items.length}（均为草稿，去「管理内容」检查后发布）` }); reload(); }
  }

  // —— 载入已有内容到表单（编辑） —— //
  async function edit(section: Tab, slug: string) {
    setMsg(null);
    if (section === "articles") {
      const d = await api(`/api/admin/article?slug=${encodeURIComponent(slug)}`, "GET");
      if (!d) return;
      setA({ slug: d.slug, title: d.title, date: d.date, excerpt: d.excerpt, tags: (d.tags || []).join(", "), domain: d.domain, episode: d.episode, quote: d.quote, body: d.body, navParentId: "", navTitle: "", draft: Boolean(d.draft) });
    } else {
      const d = await api(`/api/admin/media?section=${section}&slug=${encodeURIComponent(slug)}`, "GET");
      if (!d) return;
      if (section === "images") { setG({ slug: d.slug, title: d.title, description: d.description || "", cover: d.cover || "", episode: d.episode || "", navParentId: "", navTitle: "", draft: Boolean(d.draft) }); setGImages(d.images || []); }
      else if (section === "videos") setV({ slug: d.slug, title: d.title, description: d.description || "", kind: d.kind || "embed", embedUrl: d.embedUrl || "", src: d.src || "", originalUrl: d.originalUrl || "", episode: d.episode || "", navParentId: "", navTitle: "", draft: Boolean(d.draft) });
      else setAu({ slug: d.slug, title: d.title, description: d.description || "", src: d.src || "", cover: d.cover || "", episode: d.episode || "", navParentId: "", navTitle: "", draft: Boolean(d.draft) });
    }
    setTab(section); setEditing(slug); setView("create"); setDirty(false);
  }
  async function del(section: Tab, slug: string) {
    if (!window.confirm(`确定删除「${slug}」吗？文件和菜单条目都会删除（不可撤销）。`)) return;
    const url = section === "articles" ? `/api/admin/article?slug=${encodeURIComponent(slug)}` : `/api/admin/media?section=${section}&slug=${encodeURIComponent(slug)}`;
    const d = await api(url, "DELETE");
    if (d) { setMsg({ ok: true, text: `🗑️ 已删除 ${slug}` }); reload(); }
  }

  async function publish() {
    const d = await api("/api/admin/publish", "POST", { message: "通过后台更新内容" });
    if (d) setMsg({ ok: true, text: `🚀 ${d.message}` });
  }

  const pick = (cb: (p: string[]) => void, multiple = false) => setPicker({ onPick: cb, multiple });

  const tabs: [Tab, string][] = [["articles", "📝 文章"], ["images", "🖼️ 图片"], ["videos", "🎬 视频"], ["audios", "🎧 音频"]];
  const cats = data?.sections?.[tab] ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">内容后台 · 可视化发布</h1>
        <button onClick={publish} disabled={busy} className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60">
          🚀 提交并发布到线上
        </button>
      </div>
      <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-foreground/80">
        ⚠️ 本后台仅在本地 <code className="text-primary">npm run dev</code> 下可用。可多次保存内容，最后点「发布」一次性提交推送上线。
      </p>

      <div className="mt-5 flex gap-2">
        {([["create", editing ? "✏️ 编辑中" : "➕ 新建"], ["manage", "🗂️ 管理内容"], ["import", "📥 导入"], ["menu", "🧭 菜单"], ["settings", "⚙️ 设置"]] as [View, string][]).map(([vw, label]) => (
          <button key={vw} onClick={() => { setView(vw); setMsg(null); }} className={`rounded-full px-4 py-1.5 text-sm font-medium ${view === vw ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>{label}</button>
        ))}
        {editing ? <button onClick={resetForms} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">取消编辑，改为新建</button> : null}
      </div>

      {msg ? (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-600"}`}>
          {msg.text}
          {msg.href ? <> · <a href={msg.href} target="_blank" rel="noreferrer" className="underline">在新标签预览 →</a></> : null}
        </div>
      ) : null}

      {(view === "create" || view === "manage") && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setMsg(null); }} className={`rounded-full px-3 py-1.5 text-sm ${tab === t ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground"}`}>{label}</button>
          ))}
        </div>
      )}

      {/* ===== 菜单管理 ===== */}
      {view === "menu" && data ? <div className="mt-6"><MenuManager navTree={data.navTree as never} onChanged={reload} /></div> : null}

      {/* ===== 设置：文章排版 ===== */}
      {view === "settings" ? (
        <div className="mt-6 space-y-4">
          <h2 className="text-base font-bold text-foreground">文章排版</h2>
          {!settings ? <p className="text-sm text-muted-foreground">加载中…</p> : (
            <>
              <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                <input type="checkbox" className="h-4 w-4" checked={settings.firstLineIndent} onChange={(e) => setSettings({ ...settings, firstLineIndent: e.target.checked })} />
                首行缩进两格（中文常见排版；取消则不缩进）
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                <input type="checkbox" className="h-4 w-4" checked={settings.justify} onChange={(e) => setSettings({ ...settings, justify: e.target.checked })} />
                两端对齐（取消则左对齐）
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Field label="正文字号" hint="如 1.05rem / 1.1rem"><input className={inputCls} value={settings.fontSize} onChange={(e) => setSettings({ ...settings, fontSize: e.target.value })} /></Field>
                <Field label="行高" hint="如 1.9 / 2.0"><input className={inputCls} type="number" step="0.05" value={settings.lineHeight} onChange={(e) => setSettings({ ...settings, lineHeight: Number(e.target.value) })} /></Field>
                <Field label="字间距" hint="如 0.02em"><input className={inputCls} value={settings.letterSpacing} onChange={(e) => setSettings({ ...settings, letterSpacing: e.target.value })} /></Field>
                <Field label="段落间距" hint="如 1.25rem"><input className={inputCls} value={settings.paragraphGap} onChange={(e) => setSettings({ ...settings, paragraphGap: e.target.value })} /></Field>
              </div>
              <button disabled={busy} onClick={saveSettings} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
                {busy ? "保存中…" : "保存排版设置"}
              </button>
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">改这里会统一影响**所有文章**正文的排版。保存后本地刷新即生效；线上需点右上角「🚀 发布」后生效。</p>
            </>
          )}
        </div>
      ) : null}

      {/* ===== 导入 ===== */}
      {view === "import" && data ? (
        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            {([["wechat", "📰 公众号文章"], ["bilibili", "📺 B站视频"]] as ["wechat" | "bilibili", string][]).map(([t, l]) => (
              <button key={t} onClick={() => { setImp({ ...imp, type: t }); setImpResults([]); }} className={`rounded-full px-4 py-1.5 text-sm ${imp.type === t ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>{l}</button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {imp.type === "wechat"
              ? "粘贴公众号文章链接（mp.weixin.qq.com/s/…），每行一个，可一次多条。"
              : "粘贴 B 站视频链接或 BV 号，每行一个，可一次多条。"}
          </p>
          <textarea className={`${inputCls} h-40 font-mono`} value={imp.text} onChange={(e) => setImp({ ...imp, text: e.target.value })}
            placeholder={imp.type === "wechat" ? "https://mp.weixin.qq.com/s/xxxxxxxx\nhttps://mp.weixin.qq.com/s/yyyyyyyy" : "BV1xx411c7XX\nhttps://www.bilibili.com/video/BV1yy..."} />
          <Field label="导入到哪个菜单分类">
            <select className={inputCls} value={imp.parent} onChange={(e) => setImp({ ...imp, parent: e.target.value })}>
              {(data.sections[imp.type === "wechat" ? "articles" : "videos"]).map((o) => <option key={o.id || "_t"} value={o.id}>{o.label}</option>)}
            </select>
          </Field>
          <button disabled={busy} onClick={runImport} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            {busy ? "导入中…（逐条抓取，请稍候）" : "开始导入（存为草稿）"}
          </button>
          {impResults.length ? (
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card text-sm">
              {impResults.map((r, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2">
                  <span>{r.ok ? "✅" : "❌"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-foreground">{r.ok ? r.title : r.error}</div>
                    <div className="truncate font-mono text-xs text-muted-foreground">{r.ok ? r.slug : r.input}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            导入内容均存为**草稿**、图片/封面已下载到本地；请到「管理内容」检查（公众号排版可能有损耗，可在编辑器微调），确认无误后取消草稿并点「发布」。
          </p>
        </div>
      ) : null}

      {/* ===== 管理内容（列表 + 编辑/删除） ===== */}
      {view === "manage" && data ? (
        <>
        <input className={`${inputCls} mt-4`} placeholder="🔍 搜索标题或路径…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {(() => { const list = (data.lists[tab] || []).filter((it) => !q || it.title.includes(q) || it.slug.includes(q)); return list.length === 0 ? <p className="p-4 text-sm text-muted-foreground">{q ? "没有匹配的内容。" : "该板块还没有内容。"}</p> :
            list.map((it) => (
              <div key={it.slug} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{it.title}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">{it.slug}</div>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground" title="浏览量 / 点赞">👁 {it.views ?? 0} · ♥ {it.likes ?? 0}</span>
                <button onClick={() => edit(tab, it.slug)} className="rounded-lg border border-border px-3 py-1 text-xs hover:border-primary/40">编辑</button>
                <button onClick={() => del(tab, it.slug)} className="rounded-lg px-3 py-1 text-xs text-rose-500 hover:bg-rose-500/10">删除</button>
              </div>
            )); })()}
        </div>
        </>
      ) : null}

      {/* ===== 新建 / 编辑表单 ===== */}
      {view === "create" && (
        <div className="mt-6 space-y-4">
          {editing ? <p className="text-xs text-muted-foreground">正在编辑：<code className="text-primary">{editing}</code>（slug 不可改）</p> : null}

          {tab === "articles" && (
            <>
              <Field label="标题 *"><input className={inputCls} value={a.title} onChange={(e) => { setA({ ...a, title: e.target.value }); markDirty(); }} /></Field>
              <Field label="文件路径(slug) *" hint="不带 .md，如 notes/my-diary">
                <input className={inputCls} value={a.slug} disabled={!!editing} onChange={(e) => setA({ ...a, slug: e.target.value })} placeholder="notes/my-diary" />
                {dupSlug("articles", a.slug) ? <span className="text-xs text-rose-500">⚠️ 该路径已存在</span> : null}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="日期"><input className={inputCls} type="date" value={a.date} onChange={(e) => setA({ ...a, date: e.target.value })} /></Field>
                <Field label="标签" hint="逗号分隔"><input className={inputCls} value={a.tags} onChange={(e) => setA({ ...a, tags: e.target.value })} /></Field>
              </div>
              <Field label="摘要"><input className={inputCls} value={a.excerpt} onChange={(e) => setA({ ...a, excerpt: e.target.value })} /></Field>
              <fieldset className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
                <legend className="px-2 text-sm font-semibold text-primary">与光同行主线（可选）</legend>
                <Field label="领域" hint="选了领域，这篇就归入该领域"><select className={inputCls} value={a.domain} onChange={(e) => onDomainChange(e.target.value)}>{DOMAINS.map(([val, l]) => <option key={val} value={val}>{l}</option>)}</select></Field>
                <div className="mt-3"><Field label="本期金句" hint="显示在文末金句卡；可换行（回车）写多行"><textarea className={`${inputCls} h-20`} value={a.quote} onChange={(e) => setA({ ...a, quote: e.target.value })} placeholder="一行一句，回车换行" /></Field></div>
              </fieldset>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">正文 *</span>
                <button type="button" onClick={() => setPreview(true)} className="text-xs text-primary hover:underline">👁 预览整篇</button>
              </div>
              <MarkdownEditor value={a.body} onChange={(b) => { setA((s) => ({ ...s, body: b })); markDirty(); }} onUpload={uploadFiles} />
              {!editing ? <Field label="挂到哪个菜单分类 *"><select className={inputCls} value={a.navParentId} onChange={(e) => setA({ ...a, navParentId: e.target.value })}>{cats.map((o) => <option key={o.id || "_t"} value={o.id}>{o.label}</option>)}</select></Field> : null}
              <Field label="菜单显示名(可选)" hint="留空：主线用「第NNN期·标题」，其它用标题"><input className={inputCls} value={a.navTitle} onChange={(e) => setA({ ...a, navTitle: e.target.value })} /></Field>
              <DraftToggle checked={a.draft} onChange={(c) => { setA({ ...a, draft: c }); markDirty(); }} />
              {editing ? <MoveToField cats={cats} onMove={(pid) => moveTo("articles", editing, pid, a.title)} /> : null}
              <FormFooter editing={!!editing} busy={busy} onSubmit={saveArticle} onDelete={() => del("articles", editing!)} />
            </>
          )}

          {tab === "images" && (
            <>
              <Field label="相册标题 *"><input className={inputCls} value={g.title} onChange={(e) => { setG({ ...g, title: e.target.value }); markDirty(); }} /></Field>
              <Field label="slug *"><input className={inputCls} value={g.slug} disabled={!!editing} onChange={(e) => setG({ ...g, slug: e.target.value })} placeholder="photography/spring" />{dupSlug("images", g.slug) ? <span className="text-xs text-rose-500">⚠️ 已存在</span> : null}</Field>
              <Field label="描述"><input className={inputCls} value={g.description} onChange={(e) => setG({ ...g, description: e.target.value })} /></Field>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">相册图片（{gImages.length} 张）</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => pick((ps) => { const add = ps.map((p) => ({ src: p, alt: "" })); setGImages((x) => [...x, ...add]); if (!g.cover && add[0]) setG((s) => ({ ...s, cover: add[0].src })); }, true)} className="rounded-lg border border-border px-2 py-1 text-xs hover:border-primary/40">图片库选择</button>
                    <label className="cursor-pointer rounded-lg bg-primary/10 px-2 py-1 text-xs text-primary">上传<input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => { const ps = await uploadFiles(e.target.files); const add = ps.map((p) => ({ src: p, alt: "" })); setGImages((x) => [...x, ...add]); if (!g.cover && add[0]) setG((s) => ({ ...s, cover: add[0].src })); }} /></label>
                  </div>
                </div>
                {gImages.map((im, i) => (
                  <div key={i} className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground/60">{i + 1}.</span>
                    <code className="flex-1 truncate text-xs text-muted-foreground">{im.src}</code>
                    <input className="w-32 rounded border border-border bg-card px-2 py-1 text-xs" placeholder="alt 描述" value={im.alt} onChange={(e) => setGImages((x) => x.map((y, j) => (j === i ? { ...y, alt: e.target.value } : y)))} />
                    <button title="上移" disabled={i === 0} onClick={() => setGImages((x) => { const n = [...x]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })} className="text-xs text-muted-foreground hover:text-primary disabled:opacity-30">↑</button>
                    <button title="下移" disabled={i === gImages.length - 1} onClick={() => setGImages((x) => { const n = [...x]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; return n; })} className="text-xs text-muted-foreground hover:text-primary disabled:opacity-30">↓</button>
                    <button className="text-xs text-rose-500" onClick={() => setGImages((x) => x.filter((_, j) => j !== i))}>删</button>
                  </div>
                ))}
              </div>
              <Field label="封面图路径" hint="默认第一张"><input className={inputCls} value={g.cover} onChange={(e) => setG({ ...g, cover: e.target.value })} /></Field>
              <Field label="一鱼三吃 episode（可选）" hint="如 L01-ep002"><input className={inputCls} value={g.episode} onChange={(e) => setG({ ...g, episode: e.target.value })} /></Field>
              {!editing ? <Field label="挂到哪个菜单分类 *"><select className={inputCls} value={g.navParentId} onChange={(e) => setG({ ...g, navParentId: e.target.value })}>{cats.map((o) => <option key={o.id || "_t"} value={o.id}>{o.label}</option>)}</select></Field> : null}
              <DraftToggle checked={g.draft} onChange={(c) => { setG({ ...g, draft: c }); markDirty(); }} />
              {editing ? <MoveToField cats={cats} onMove={(pid) => moveTo("images", editing, pid, g.title)} /> : null}
              <FormFooter editing={!!editing} busy={busy} onSubmit={() => saveMedia("images")} onDelete={() => del("images", editing!)} />
            </>
          )}

          {tab === "videos" && (
            <>
              <Field label="标题 *"><input className={inputCls} value={v.title} onChange={(e) => { setV({ ...v, title: e.target.value }); markDirty(); }} /></Field>
              <Field label="slug *"><input className={inputCls} value={v.slug} disabled={!!editing} onChange={(e) => setV({ ...v, slug: e.target.value })} placeholder="works/2026-summary" />{dupSlug("videos", v.slug) ? <span className="text-xs text-rose-500">⚠️ 已存在</span> : null}</Field>
              <Field label="描述"><input className={inputCls} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
              <Field label="类型"><select className={inputCls} value={v.kind} onChange={(e) => setV({ ...v, kind: e.target.value })}><option value="embed">嵌入（B站/YouTube）</option><option value="file">文件直链</option></select></Field>
              {v.kind === "embed"
                ? <>
                    <div className="flex items-end gap-2 rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
                      <div className="flex-1"><Field label="🅱️ B站链接 / BV号（自动转换）" hint="粘贴 https://www.bilibili.com/video/BVxxx 或 BVxxx"><input className={inputCls} value={bili} onChange={(e) => setBili(e.target.value)} placeholder="BV1xx411..." /></Field></div>
                      <button type="button" onClick={applyBilibili} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">转换</button>
                    </div>
                    <Field label="嵌入链接 embedUrl *"><input className={inputCls} value={v.embedUrl} onChange={(e) => setV({ ...v, embedUrl: e.target.value })} /></Field><Field label="原视频链接(可选)"><input className={inputCls} value={v.originalUrl} onChange={(e) => setV({ ...v, originalUrl: e.target.value })} /></Field></>
                : <Field label="视频直链 src *"><input className={inputCls} value={v.src} onChange={(e) => setV({ ...v, src: e.target.value })} /></Field>}
              <Field label="一鱼三吃 episode（可选）"><input className={inputCls} value={v.episode} onChange={(e) => setV({ ...v, episode: e.target.value })} /></Field>
              {!editing ? <Field label="挂到哪个菜单分类 *"><select className={inputCls} value={v.navParentId} onChange={(e) => setV({ ...v, navParentId: e.target.value })}>{cats.map((o) => <option key={o.id || "_t"} value={o.id}>{o.label}</option>)}</select></Field> : null}
              <DraftToggle checked={v.draft} onChange={(c) => { setV({ ...v, draft: c }); markDirty(); }} />
              {editing ? <MoveToField cats={cats} onMove={(pid) => moveTo("videos", editing, pid, v.title)} /> : null}
              <FormFooter editing={!!editing} busy={busy} onSubmit={() => saveMedia("videos")} onDelete={() => del("videos", editing!)} />
            </>
          )}

          {tab === "audios" && (
            <>
              <Field label="标题 *"><input className={inputCls} value={au.title} onChange={(e) => { setAu({ ...au, title: e.target.value }); markDirty(); }} /></Field>
              <Field label="slug *"><input className={inputCls} value={au.slug} disabled={!!editing} onChange={(e) => setAu({ ...au, slug: e.target.value })} placeholder="podcasts/ep2" />{dupSlug("audios", au.slug) ? <span className="text-xs text-rose-500">⚠️ 已存在</span> : null}</Field>
              <Field label="描述"><input className={inputCls} value={au.description} onChange={(e) => setAu({ ...au, description: e.target.value })} /></Field>
              <Field label="音频直链 src *"><input className={inputCls} value={au.src} onChange={(e) => setAu({ ...au, src: e.target.value })} /></Field>
              <div className="flex items-end gap-2">
                <div className="flex-1"><Field label="封面图(可选)"><input className={inputCls} value={au.cover} onChange={(e) => setAu({ ...au, cover: e.target.value })} /></Field></div>
                <button type="button" onClick={() => pick((ps) => setAu((s) => ({ ...s, cover: ps[0] })))} className="rounded-lg border border-border px-2 py-2 text-xs hover:border-primary/40">图片库</button>
              </div>
              <Field label="一鱼三吃 episode（可选）"><input className={inputCls} value={au.episode} onChange={(e) => setAu({ ...au, episode: e.target.value })} /></Field>
              {!editing ? <Field label="挂到哪个菜单分类 *"><select className={inputCls} value={au.navParentId} onChange={(e) => setAu({ ...au, navParentId: e.target.value })}>{cats.map((o) => <option key={o.id || "_t"} value={o.id}>{o.label}</option>)}</select></Field> : null}
              <DraftToggle checked={au.draft} onChange={(c) => { setAu({ ...au, draft: c }); markDirty(); }} />
              {editing ? <MoveToField cats={cats} onMove={(pid) => moveTo("audios", editing, pid, au.title)} /> : null}
              <FormFooter editing={!!editing} busy={busy} onSubmit={() => saveMedia("audios")} onDelete={() => del("audios", editing!)} />
            </>
          )}
        </div>
      )}

      {/* 整篇预览 */}
      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPreview(false)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-2xl bg-card p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h1 className="text-2xl font-bold text-foreground">{a.title || "未命名"}</h1>
            <div className="mt-4 text-sm leading-relaxed text-foreground [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:font-bold [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:my-2 [&_img]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_a]:text-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.body}</ReactMarkdown>
            </div>
          </div>
        </div>
      ) : null}

      {picker ? <ImagePicker open multiple={picker.multiple} onClose={() => setPicker(null)} onPick={(ps) => picker.onPick(ps)} /> : null}
    </main>
  );
}

function DraftToggle({ checked, onChange }: { checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      草稿（勾选后线上隐藏，仅本地预览；发布后取消勾选即公开）
    </label>
  );
}

function MoveToField({ cats, onMove }: { cats: Opt[]; onMove: (id: string) => void }) {
  const [pid, setPid] = useState("");
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1"><Field label="移动到菜单分类" hint="把这条内容挪到别的分类下"><select className={inputCls} value={pid} onChange={(e) => setPid(e.target.value)}>{cats.map((o) => <option key={o.id || "_t"} value={o.id}>{o.label}</option>)}</select></Field></div>
      <button type="button" onClick={() => onMove(pid)} className="rounded-lg border border-border px-3 py-2 text-sm hover:border-primary/40">移动</button>
    </div>
  );
}

function FormFooter({ editing, busy, onSubmit, onDelete }: { editing: boolean; busy: boolean; onSubmit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-3 pt-2">
      <button disabled={busy} onClick={onSubmit} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
        {busy ? "保存中…" : editing ? "更新并写入文件" : "保存并写入文件"}
      </button>
      {editing ? <button disabled={busy} onClick={onDelete} className="rounded-lg border border-rose-500/40 px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10">删除</button> : null}
    </div>
  );
}
