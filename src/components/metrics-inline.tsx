"use client";

import { useEffect, useState } from "react";
import { Eye, Heart } from "lucide-react";

type M = { views: number; likes: number };

// 共享批处理器：同一渲染周期内挂载的所有行合并成一次请求
const pending = new Map<string, ((m: M) => void)[]>();
let scheduled = false;
let batchEnabled = true;

function flush() {
  scheduled = false;
  const ids = Array.from(pending.keys());
  if (!ids.length) return;
  const subs = new Map(pending);
  pending.clear();
  fetch("/api/metrics/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  })
    .then((r) => r.json())
    .then((data) => {
      batchEnabled = Boolean(data.enabled);
      for (const id of ids) {
        const m: M = data.metrics?.[id] ?? { views: 0, likes: 0 };
        subs.get(id)?.forEach((cb) => cb(m));
      }
    })
    .catch(() => {
      batchEnabled = false;
      for (const id of ids) subs.get(id)?.forEach((cb) => cb({ views: 0, likes: 0 }));
    });
}

function request(id: string, cb: (m: M) => void) {
  const arr = pending.get(id) ?? [];
  arr.push(cb);
  pending.set(id, arr);
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(flush);
  }
}

/** 列表行里的只读计数：👁 浏览量 · ♥ 点赞。未配置数据库时自动隐藏。 */
export function MetricsInline({ type, slug }: { type: string; slug: string }) {
  const id = `${type}:${slug}`;
  const [m, setM] = useState<M | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;
    request(id, (res) => {
      if (cancelled) return;
      setM(res);
      setEnabled(batchEnabled);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (m === null || !enabled) return null;

  return (
    <span className="inline-flex items-center gap-2.5 font-mono text-[11px] text-muted-foreground/70">
      <span className="inline-flex items-center gap-1" title="浏览量">
        <Eye className="h-3.5 w-3.5" />
        {m.views}
      </span>
      <span className="inline-flex items-center gap-1" title="点赞">
        <Heart className="h-3.5 w-3.5" />
        {m.likes}
      </span>
    </span>
  );
}
