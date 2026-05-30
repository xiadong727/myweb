"use client";

import { useEffect, useState } from "react";

/** 站点访问人数：每个浏览器只计一次（localStorage 去重），复用 /api/metrics 后端。 */
export function SiteVisits({ className }: { className?: string }) {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = "site:home";
    (async () => {
      try {
        const res = await fetch(`/api/metrics?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        let v = data.views ?? 0;
        if (data.enabled && !localStorage.getItem("site-visited")) {
          const r = await fetch("/api/metrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action: "view" }),
          });
          const d = await r.json();
          if (typeof d.views === "number") v = d.views;
          localStorage.setItem("site-visited", "1");
        }
        if (!cancelled) setN(v);
      } catch {
        /* 忽略：保持占位 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <div className={className}>{n ?? "—"}</div>;
}
