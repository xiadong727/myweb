"use client";

import { useEffect, useState } from "react";
import { uploadFiles, fetchImageLibrary } from "@/lib/admin-client";

/** 图片选择器：从图片库挑选已有图片，或上传新图（自动压缩）。 */
export function ImagePicker({ open, multiple, onClose, onPick }: {
  open: boolean;
  multiple?: boolean;
  onClose: () => void;
  onPick: (paths: string[]) => void;
}) {
  const [imgs, setImgs] = useState<string[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchImageLibrary()
      .then((list) => { if (!cancelled) { setImgs(list); setSel([]); } })
      .catch(() => { if (!cancelled) { setImgs([]); setSel([]); } });
    return () => { cancelled = true; };
  }, [open]);

  if (!open) return null;

  const toggle = (p: string) => {
    if (multiple) setSel((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
    else { onPick([p]); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">图片库</h3>
          <label className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            {busy ? "上传中…" : "上传新图"}
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={async (e) => { setBusy(true); try { const ps = await uploadFiles(e.target.files); setImgs((x) => [...ps, ...x]); } finally { setBusy(false); } }} />
          </label>
        </div>
        {imgs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">图片库为空，点右上角上传。</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {imgs.map((p) => (
              <button key={p} type="button" onClick={() => toggle(p)} className={`relative overflow-hidden rounded-lg border-2 ${sel.includes(p) ? "border-primary" : "border-transparent"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" className="h-24 w-full object-cover" />
                {sel.includes(p) ? <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">✓</span> : null}
              </button>
            ))}
          </div>
        )}
        {multiple ? (
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">取消</button>
            <button type="button" disabled={!sel.length} onClick={() => { onPick(sel); onClose(); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              选用 {sel.length} 张
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
