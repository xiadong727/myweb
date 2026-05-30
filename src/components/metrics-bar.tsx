"use client";

import { useEffect, useState } from "react";
import { Eye, Heart } from "lucide-react";

/** 浏览量 + 点赞按钮。数据来自 /api/metrics（后端 Upstash）。
 *  未配置数据库时自动隐藏；浏览量同一会话只记一次；点赞同一浏览器只算一次。 */
export function MetricsBar({ type, slug }: { type: string; slug: string }) {
  const id = `${type}:${slug}`;
  const [views, setViews] = useState<number | null>(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const viewedKey = `viewed:${id}`;

    (async () => {
      try {
        if (!cancelled) setLiked(localStorage.getItem(`liked:${id}`) === "1");
        const res = await fetch(`/api/metrics?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (cancelled) return;
        const on = Boolean(data.enabled);
        setEnabled(on);
        setLikes(data.likes ?? 0);
        let v = data.views ?? 0;
        if (on && sessionStorage.getItem(viewedKey) !== "1") {
          const r = await fetch(`/api/metrics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action: "view" }),
          });
          const d = await r.json();
          if (!cancelled && typeof d.views === "number") v = d.views;
          sessionStorage.setItem(viewedKey, "1");
        }
        if (!cancelled) setViews(v);
      } catch {
        if (!cancelled) setEnabled(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleLike = async () => {
    const likedKey = `liked:${id}`;
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    if (next) localStorage.setItem(likedKey, "1");
    else localStorage.removeItem(likedKey);
    try {
      const r = await fetch(`/api/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: next ? "like" : "unlike" }),
      });
      const d = await r.json();
      if (typeof d.likes === "number") setLikes(d.likes);
    } catch {
      /* 网络异常则保留乐观值 */
    }
  };

  if (!ready || !enabled) return null;

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5" title="浏览量">
        <Eye className="h-4 w-4" />
        {views ?? "—"}
      </span>
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        title={liked ? "取消点赞" : "点赞"}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition ${
          liked
            ? "border-rose-400/40 bg-rose-500/10 text-rose-500"
            : "border-border bg-card hover:border-rose-400/40 hover:text-rose-500"
        }`}
      >
        <Heart className={`h-4 w-4 transition ${liked ? "fill-current" : ""}`} />
        {likes}
      </button>
    </div>
  );
}
