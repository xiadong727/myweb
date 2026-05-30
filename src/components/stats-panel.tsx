"use client";

import { useEffect, useState } from "react";
import { RollingNumber } from "./rolling-number";

type Props = {
  totalWorks: number;
  articleCount: number;
  imageCount: number;
  videoCount: number;
  audioCount: number;
};

/**
 * 首页数据面板：先取「总浏览量」，待数据就绪后让**所有**数字（总作品数/总浏览量/
 * 文章/图片/视频/音频）在同一时刻一起翻滚——避免总浏览量因异步而落后。
 */
export function StatsPanel({ totalWorks, articleCount, imageCount, videoCount, audioCount }: Props) {
  const [views, setViews] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // 兜底：即使接口慢/失败，最多 2.5s 后也让数字开始滚动
    const fallback = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 2500);

    (async () => {
      try {
        const res = await fetch("/api/metrics?total=1");
        const data = await res.json();
        if (!cancelled) setViews(data.views ?? 0);
      } catch {
        /* 忽略，用 0 */
      } finally {
        if (!cancelled) {
          clearTimeout(fallback);
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, []);

  // ready 之前所有数字都停在 0；ready 翻转的同一帧，全部一起滚到目标值
  const v = (n: number) => (ready ? n : 0);

  const bigTile = "rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.14] to-primary/[0.03] p-5 text-center shadow-lg shadow-primary/10 ring-1 ring-inset ring-white/40 backdrop-blur-sm";
  const bigNum = "text-5xl font-extrabold tabular-nums sm:text-6xl";
  const breakdown = [
    { n: articleCount, label: "文章", color: "text-blue-500", glow: "rgba(59,130,246,0.4)" },
    { n: imageCount, label: "图片", color: "text-emerald-500", glow: "rgba(16,185,129,0.4)" },
    { n: videoCount, label: "视频", color: "text-rose-500", glow: "rgba(244,63,94,0.4)" },
    { n: audioCount, label: "音频", color: "text-purple-500", glow: "rgba(168,85,247,0.4)" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className={bigTile}>
        <RollingNumber
          value={v(totalWorks)}
          className={`${bigNum} text-orange-500`}
          style={{ filter: "drop-shadow(0 3px 6px rgba(249,115,22,0.4))" }}
        />
        <div className="mt-1.5 text-xs font-medium tracking-wider text-muted-foreground">总作品数</div>
      </div>
      <div className={bigTile}>
        <RollingNumber
          value={v(views)}
          className={`${bigNum} text-rose-500`}
          style={{ filter: "drop-shadow(0 3px 6px rgba(236,72,153,0.4))" }}
        />
        <div className="mt-1.5 text-xs font-medium tracking-wider text-muted-foreground">总浏览量</div>
      </div>
      <div className="col-span-2 grid grid-cols-4 divide-x divide-primary/10 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] to-transparent shadow-md ring-1 ring-inset ring-white/30 backdrop-blur-sm">
        {breakdown.map((s) => (
          <div key={s.label} className="py-3.5 text-center">
            <RollingNumber
              value={v(s.n)}
              className={`text-2xl font-extrabold tabular-nums ${s.color}`}
              style={{ filter: `drop-shadow(0 2px 5px ${s.glow})` }}
            />
            <div className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
