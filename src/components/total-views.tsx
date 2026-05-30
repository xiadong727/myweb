"use client";

import { useEffect, useState } from "react";

/** 全站作品总浏览量（只读，不自增）。数据来自 /api/metrics?total=1。 */
export function TotalViews({ className }: { className?: string }) {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/metrics?total=1");
        const data = await res.json();
        if (!cancelled) setN(data.views ?? 0);
      } catch {
        /* 忽略：保持占位 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <span className={className}>{n ?? "—"}</span>;
}
