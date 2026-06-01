"use client";

import { useEffect, useRef, useState } from "react";

type Opt = { id: string; label: string };
type Options = { sections: Record<string, Opt[]> };
type Tab = "articles" | "images" | "videos" | "audios";

const DOMAINS = [
  ["", "（不是与光同行主线）"],
  ["L01", "L01 哲学"], ["L02", "L02 思维"], ["L03", "L03 品格"], ["L04", "L04 历史"],
  ["L05", "L05 科学"], ["L06", "L06 艺术"], ["L07", "L07 人际"], ["L08", "L08 财富"],
  ["L09", "L09 生活"], ["L10", "L10 心灵"],
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint ? <span className="ml-2 text-xs text-muted-foreground">{hint}</span> : null}
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("articles");
  const [opts, setOpts] = useState<Options | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/options")
      .then((r) => r.json())
      .then((d) => (d.error ? setMsg({ ok: false, text: d.error }) : setOpts(d)))
      .catch(() => setMsg({ ok: false, text: "无法连接后台接口（请确认在本地 npm run dev 下打开）" }));
  }, []);

  // —— 文章 —— //
  const [a, setA] = useState({ slug: "", title: "", date: "", excerpt: "", tags: "", domain: "", episode: "", quote: "", body: "", navParentId: "", navTitle: "" });
  // —— 图片 —— //
  const [g, setG] = useState({ slug: "", title: "", description: "", cover: "", episode: "", navParentId: "", navTitle: "" });
  const [gImages, setGImages] = useState<{ src: string; alt: string }[]>([]);
  // —— 视频 —— //
  const [v, setV] = useState({ slug: "", title: "", description: "", kind: "embed", embedUrl: "", src: "", originalUrl: "", episode: "", navParentId: "", navTitle: "" });
  // —— 音频 —— //
  const [au, setAu] = useState({ slug: "", title: "", description: "", src: "", cover: "", episode: "", navParentId: "", navTitle: "" });

  const uploadRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("file", f));
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "上传失败");
    return d.paths as string[];
  }

  async function submit(url: string, payload: unknown) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "保存失败");
      setMsg({ ok: true, text: `✅ 已生成：${d.file || d.slug}。请到 Cursor 左侧「源代码管理」提交并推送即可上线。` });
      return true;
    } catch (e) {
      setMsg({ ok: false, text: `❌ ${(e as Error).message}` });
      return false;
    } finally {
      setBusy(false);
    }
  }

  const epKey = (domain: string, episode: string) =>
    domain && episode ? `${domain}-ep${String(Number(episode)).padStart(3, "0")}` : "";

  const tabs: [Tab, string][] = [["articles", "📝 文章"], ["images", "🖼️ 图片"], ["videos", "🎬 视频"], ["audios", "🎧 音频"]];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">内容后台 · 可视化发布</h1>
      <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-foreground/80">
        ⚠️ 本后台**仅在本地** <code className="text-primary">npm run dev</code> 下可用。填表 → 保存（自动写好文件并挂好菜单）→ 到 Cursor 提交推送即上线。线上无法写入，属正常。
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(([t, label]) => (
          <button
            key={t}
            onClick={() => { setTab(t); setMsg(null); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === t ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {msg ? (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-600"}`}>{msg.text}</div>
      ) : null}

      <div className="mt-6 space-y-4">
        {/* ============ 文章 ============ */}
        {tab === "articles" && (
          <>
            <Field label="标题 *"><input className={inputCls} value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} /></Field>
            <Field label="文件路径(slug) *" hint="content/articles/ 下的路径，不带 .md，如 notes/my-diary 或 lighthouse/L01-philosophy/ep002-xxx">
              <input className={inputCls} value={a.slug} onChange={(e) => setA({ ...a, slug: e.target.value })} placeholder="notes/my-diary" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="日期"><input className={inputCls} type="date" value={a.date} onChange={(e) => setA({ ...a, date: e.target.value })} /></Field>
              <Field label="标签" hint="逗号分隔"><input className={inputCls} value={a.tags} onChange={(e) => setA({ ...a, tags: e.target.value })} placeholder="随笔, 思考" /></Field>
            </div>
            <Field label="摘要"><input className={inputCls} value={a.excerpt} onChange={(e) => setA({ ...a, excerpt: e.target.value })} /></Field>

            <fieldset className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
              <legend className="px-2 text-sm font-semibold text-primary">与光同行主线（可选）</legend>
              <div className="grid grid-cols-2 gap-4">
                <Field label="领域"><select className={inputCls} value={a.domain} onChange={(e) => setA({ ...a, domain: e.target.value })}>{DOMAINS.map(([v2, l]) => <option key={v2} value={v2}>{l}</option>)}</select></Field>
                <Field label="期号" hint="数字"><input className={inputCls} type="number" value={a.episode} onChange={(e) => setA({ ...a, episode: e.target.value })} /></Field>
              </div>
              <div className="mt-3"><Field label="本期金句" hint="会显示在首页与文末金句卡"><input className={inputCls} value={a.quote} onChange={(e) => setA({ ...a, quote: e.target.value })} /></Field></div>
              {epKey(a.domain, a.episode) ? <p className="mt-2 text-xs text-muted-foreground">一鱼三吃关联键：<code className="text-primary">{epKey(a.domain, a.episode)}</code>（配套图/音/视频填这个即可互链）</p> : null}
            </fieldset>

            <Field label="正文 (Markdown) *">
              <textarea className={`${inputCls} h-64 font-mono`} value={a.body} onChange={(e) => setA({ ...a, body: e.target.value })} placeholder="直接写 Markdown……" />
            </Field>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <span className="text-muted-foreground">插图：</span>
              <input ref={uploadRef} type="file" accept="image/*" multiple className="ml-2 text-xs"
                onChange={async (e) => {
                  try { const ps = await upload(e.target.files); if (ps.length) { setA((s) => ({ ...s, body: `${s.body}\n${ps.map((p) => `![](${p})`).join("\n")}\n` })); setMsg({ ok: true, text: `已上传 ${ps.length} 张并插入正文末尾` }); } }
                  catch (err) { setMsg({ ok: false, text: (err as Error).message }); }
                }} />
              <p className="mt-1 text-xs text-muted-foreground">选择图片会上传到 public/images 并把 Markdown 自动追加到正文末尾。</p>
            </div>

            <CategoryAndSubmit section="articles" opts={opts} parentId={a.navParentId} setParentId={(id) => setA({ ...a, navParentId: id })} navTitle={a.navTitle} setNavTitle={(t) => setA({ ...a, navTitle: t })}
              busy={busy} onSubmit={() => submit("/api/admin/article", { ...a, tags: a.tags ? a.tags.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : [] })} />
          </>
        )}

        {/* ============ 图片 ============ */}
        {tab === "images" && (
          <>
            <Field label="相册标题 *"><input className={inputCls} value={g.title} onChange={(e) => setG({ ...g, title: e.target.value })} /></Field>
            <Field label="slug *" hint="如 photography/spring"><input className={inputCls} value={g.slug} onChange={(e) => setG({ ...g, slug: e.target.value })} /></Field>
            <Field label="描述"><input className={inputCls} value={g.description} onChange={(e) => setG({ ...g, description: e.target.value })} /></Field>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">相册图片（{gImages.length} 张）</span>
                <input type="file" accept="image/*" multiple className="text-xs"
                  onChange={async (e) => { try { const ps = await upload(e.target.files); const add = ps.map((p) => ({ src: p, alt: "" })); setGImages((x) => [...x, ...add]); if (!g.cover && add[0]) setG((s) => ({ ...s, cover: add[0].src })); } catch (err) { setMsg({ ok: false, text: (err as Error).message }); } }} />
              </div>
              {gImages.map((im, i) => (
                <div key={i} className="mt-2 flex items-center gap-2">
                  <code className="flex-1 truncate text-xs text-muted-foreground">{im.src}</code>
                  <input className="w-40 rounded border border-border bg-card px-2 py-1 text-xs" placeholder="alt 描述" value={im.alt} onChange={(e) => setGImages((x) => x.map((y, j) => (j === i ? { ...y, alt: e.target.value } : y)))} />
                  <button className="text-xs text-rose-500" onClick={() => setGImages((x) => x.filter((_, j) => j !== i))}>删</button>
                </div>
              ))}
            </div>
            <Field label="封面图路径" hint="默认用第一张"><input className={inputCls} value={g.cover} onChange={(e) => setG({ ...g, cover: e.target.value })} /></Field>
            <Field label="一鱼三吃关联键 episode（可选）" hint="如 L01-ep002"><input className={inputCls} value={g.episode} onChange={(e) => setG({ ...g, episode: e.target.value })} /></Field>
            <CategoryAndSubmit section="images" opts={opts} parentId={g.navParentId} setParentId={(id) => setG({ ...g, navParentId: id })} navTitle={g.navTitle} setNavTitle={(t) => setG({ ...g, navTitle: t })}
              busy={busy} onSubmit={() => { if (!gImages.length) { setMsg({ ok: false, text: "请先上传至少一张图片" }); return Promise.resolve(false); } return submit("/api/admin/media", { section: "images", navParentId: g.navParentId, navTitle: g.navTitle, item: { slug: g.slug, title: g.title, description: g.description, cover: g.cover || gImages[0].src, images: gImages, ...(g.episode ? { episode: g.episode } : {}) } }); }} />
          </>
        )}

        {/* ============ 视频 ============ */}
        {tab === "videos" && (
          <>
            <Field label="标题 *"><input className={inputCls} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
            <Field label="slug *" hint="如 works/2026-summary"><input className={inputCls} value={v.slug} onChange={(e) => setV({ ...v, slug: e.target.value })} /></Field>
            <Field label="描述"><input className={inputCls} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
            <Field label="类型"><select className={inputCls} value={v.kind} onChange={(e) => setV({ ...v, kind: e.target.value })}><option value="embed">嵌入（B站/YouTube）</option><option value="file">文件直链</option></select></Field>
            {v.kind === "embed"
              ? <><Field label="嵌入链接 embedUrl *" hint="B站播放器 iframe 链接"><input className={inputCls} value={v.embedUrl} onChange={(e) => setV({ ...v, embedUrl: e.target.value })} /></Field>
                  <Field label="原视频链接(可选)"><input className={inputCls} value={v.originalUrl} onChange={(e) => setV({ ...v, originalUrl: e.target.value })} /></Field></>
              : <Field label="视频直链 src *"><input className={inputCls} value={v.src} onChange={(e) => setV({ ...v, src: e.target.value })} /></Field>}
            <Field label="一鱼三吃关联键 episode（可选）" hint="如 L01-ep002"><input className={inputCls} value={v.episode} onChange={(e) => setV({ ...v, episode: e.target.value })} /></Field>
            <CategoryAndSubmit section="videos" opts={opts} parentId={v.navParentId} setParentId={(id) => setV({ ...v, navParentId: id })} navTitle={v.navTitle} setNavTitle={(t) => setV({ ...v, navTitle: t })}
              busy={busy} onSubmit={() => submit("/api/admin/media", { section: "videos", navParentId: v.navParentId, navTitle: v.navTitle, item: { slug: v.slug, title: v.title, description: v.description, kind: v.kind, ...(v.kind === "embed" ? { embedUrl: v.embedUrl, ...(v.originalUrl ? { originalUrl: v.originalUrl } : {}) } : { src: v.src }), ...(v.episode ? { episode: v.episode } : {}) } })} />
          </>
        )}

        {/* ============ 音频 ============ */}
        {tab === "audios" && (
          <>
            <Field label="标题 *"><input className={inputCls} value={au.title} onChange={(e) => setAu({ ...au, title: e.target.value })} /></Field>
            <Field label="slug *" hint="如 podcasts/ep2"><input className={inputCls} value={au.slug} onChange={(e) => setAu({ ...au, slug: e.target.value })} /></Field>
            <Field label="描述"><input className={inputCls} value={au.description} onChange={(e) => setAu({ ...au, description: e.target.value })} /></Field>
            <Field label="音频直链 src *"><input className={inputCls} value={au.src} onChange={(e) => setAu({ ...au, src: e.target.value })} /></Field>
            <div className="flex items-end gap-3">
              <div className="flex-1"><Field label="封面图路径(可选)"><input className={inputCls} value={au.cover} onChange={(e) => setAu({ ...au, cover: e.target.value })} /></Field></div>
              <input type="file" accept="image/*" className="text-xs" onChange={async (e) => { try { const ps = await upload(e.target.files); if (ps[0]) setAu((s) => ({ ...s, cover: ps[0] })); } catch (err) { setMsg({ ok: false, text: (err as Error).message }); } }} />
            </div>
            <Field label="一鱼三吃关联键 episode（可选）" hint="如 L01-ep002"><input className={inputCls} value={au.episode} onChange={(e) => setAu({ ...au, episode: e.target.value })} /></Field>
            <CategoryAndSubmit section="audios" opts={opts} parentId={au.navParentId} setParentId={(id) => setAu({ ...au, navParentId: id })} navTitle={au.navTitle} setNavTitle={(t) => setAu({ ...au, navTitle: t })}
              busy={busy} onSubmit={() => submit("/api/admin/media", { section: "audios", navParentId: au.navParentId, navTitle: au.navTitle, item: { slug: au.slug, title: au.title, description: au.description, src: au.src, ...(au.cover ? { cover: au.cover } : {}), ...(au.episode ? { episode: au.episode } : {}) } })} />
          </>
        )}
      </div>
    </main>
  );
}

function CategoryAndSubmit({ section, opts, parentId, setParentId, navTitle, setNavTitle, busy, onSubmit }: {
  section: string; opts: Options | null; parentId: string; setParentId: (id: string) => void;
  navTitle: string; setNavTitle: (t: string) => void; busy: boolean; onSubmit: () => Promise<boolean> | boolean;
}) {
  const list = opts?.sections?.[section] ?? [];
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Field label="挂到哪个菜单分类 *">
        <select className={inputCls} value={parentId} onChange={(e) => setParentId(e.target.value)}>
          {list.map((o) => <option key={o.id || "_top"} value={o.id}>{o.label}</option>)}
        </select>
      </Field>
      <div className="mt-3"><Field label="菜单显示名(可选)" hint="留空则用标题"><input className={inputCls} value={navTitle} onChange={(e) => setNavTitle(e.target.value)} /></Field></div>
      <button disabled={busy} onClick={() => onSubmit()} className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
        {busy ? "保存中…" : "保存并写入文件"}
      </button>
    </div>
  );
}
