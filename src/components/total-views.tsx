"use client";

import { useEffect, useState } from "react";
import { CountUp } from "./count-up";

/** 全站作品总浏览量（只读，不自增）。数据来自 /api/metrics?total=1，加载后滚动到位。 */
export function TotalViews({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/metrics?total=1");
        const data = await res.json();
        if (!cancelled) setN(data.views ?? 0);
      } catch {
        if (!cancelled) setN(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <CountUp value={n ?? 0} className={className} style={style} />;
}
