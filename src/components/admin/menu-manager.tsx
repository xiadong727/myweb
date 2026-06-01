"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Pencil, Plus, Trash2, FolderOpen, FileText } from "lucide-react";
import type { SectionKey, NavNode } from "@/lib/types";
import { isNavGroup } from "@/lib/types";

type Trees = Record<SectionKey, { label: string; nodes: NavNode[] }>;

export function MenuManager({ navTree, onChanged }: { navTree: Trees; onChanged: () => void }) {
  const [section, setSection] = useState<SectionKey>("articles");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function op(payload: Record<string, unknown>) {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/admin/nav", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, ...payload }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "操作失败");
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const tabs: [SectionKey, string][] = [["articles", "文章"], ["images", "图片"], ["videos", "视频"], ["audios", "音频"]];
  const nodes = navTree?.[section]?.nodes ?? [];

  const renderNodes = (list: NavNode[], depth: number) =>
    list.map((n) => {
      const group = isNavGroup(n);
      return (
        <div key={n.id}>
          <div className="flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-muted/50" style={{ paddingLeft: depth * 20 + 8 }}>
            {group ? <FolderOpen className="h-4 w-4 shrink-0 text-primary" /> : <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />}
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{n.title}</span>
            <button title="上移" disabled={busy} onClick={() => op({ op: "move", id: n.id, dir: "up" })} className="rounded p-1 text-muted-foreground hover:text-primary"><ChevronUp className="h-4 w-4" /></button>
            <button title="下移" disabled={busy} onClick={() => op({ op: "move", id: n.id, dir: "down" })} className="rounded p-1 text-muted-foreground hover:text-primary"><ChevronDown className="h-4 w-4" /></button>
            <button title="重命名" disabled={busy} onClick={() => { const t = window.prompt("新名称：", n.title); if (t && t.trim()) op({ op: "rename", id: n.id, title: t.trim() }); }} className="rounded p-1 text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
            {group ? <button title="新建子分类" disabled={busy} onClick={() => { const t = window.prompt("子分类名称："); if (t && t.trim()) op({ op: "addCategory", parentId: n.id, title: t.trim() }); }} className="rounded p-1 text-muted-foreground hover:text-primary"><Plus className="h-4 w-4" /></button> : null}
            <button title="删除" disabled={busy} onClick={() => { if (window.confirm(`确定删除「${n.title}」吗？${group ? "（分类需先清空）" : "（仅从菜单移除，不删内容文件）"}`)) op({ op: "delete", id: n.id }); }} className="rounded p-1 text-muted-foreground hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
          </div>
          {group && n.children.length > 0 ? renderNodes(n.children, depth + 1) : null}
        </div>
      );
    });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {tabs.map(([s, label]) => (
            <button key={s} onClick={() => setSection(s)} className={`rounded-full px-3 py-1 text-sm ${section === s ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>{label}</button>
          ))}
        </div>
        <button disabled={busy} onClick={() => { const t = window.prompt("新顶层分类名称："); if (t && t.trim()) op({ op: "addCategory", parentId: "", title: t.trim() }); }} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:border-primary/40">
          <Plus className="h-4 w-4" /> 新建顶层分类
        </button>
      </div>
      {err ? <p className="mt-3 rounded bg-rose-500/10 px-3 py-2 text-sm text-rose-600">{err}</p> : null}
      <p className="mt-3 text-xs text-muted-foreground">提示：删除「内容条目」只是从菜单移除，不会删除内容文件；要彻底删除内容请到「管理内容」里删。</p>
      <div className="mt-2 rounded-xl border border-border bg-card p-2">{nodes.length ? renderNodes(nodes, 0) : <p className="p-4 text-sm text-muted-foreground">暂无内容。</p>}</div>
    </div>
  );
}
