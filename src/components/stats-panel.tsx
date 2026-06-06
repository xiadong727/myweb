"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Image as ImageIcon, Video, Headphones, type LucideIcon } from "lucide-react";
import { RollingNumber } from "./rolling-number";

type Props = {
  totalWorks: number;
  articleCount: number;
  imageCount: number;
  videoCount: number;
  audioCount: number;
};

type Section = {
  href: string;
  label: string;
  sub: string;
  bar: string;
  count: number;
  icon: LucideIcon;
  color: string;
  glow: string;
};

/**
 * 首页数据面板：总作品数 / 总浏览量两个大数字 + 四个可点击的板块卡片
 * （文章/图片/视频/音频，点进对应作品列表）。所有数字数据就绪后同步翻滚。
 */
export function StatsPanel({ totalWorks, articleCount, imageCount, videoCount, audioCount }: Props) {
  const [views, setViews] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fallback = setTimeout(() => { if (!cancelled) setReady(true); }, 2500);
    (async () => {
      try {
        const res = await fetch("/api/metrics?total=1");
        const data = await res.json();
        if (!cancelled) setViews(data.views ?? 0);
      } catch {
        /* 用 0 */
      } finally {
        if (!cancelled) { clearTimeout(fallback); setReady(true); }
      }
    })();
    return () => { cancelled = true; clearTimeout(fallback); };
  }, []);

  const v = (n: number) => (ready ? n : 0);

  const bigTile = "rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.14] to-primary/[0.03] p-5 text-center shadow-lg shadow-primary/10 ring-1 ring-inset ring-white/40 backdrop-blur-sm";
  const bigNum = "text-5xl font-extrabold tabular-nums sm:text-6xl";

  const sections: Section[] = [
    { href: "/articles", label: "文章", sub: "记录思考", bar: "bg-blue-500", count: articleCount, icon: FileText, color: "text-blue-500", glow: "rgba(59,130,246,0.4)" },
    { href: "/images", label: "图片", sub: "定格美好", bar: "bg-emerald-500", count: imageCount, icon: ImageIcon, color: "text-emerald-500", glow: "rgba(16,185,129,0.4)" },
    { href: "/videos", label: "视频", sub: "分享生活", bar: "bg-rose-500", count: videoCount, icon: Video, color: "text-rose-500", glow: "rgba(244,63,94,0.4)" },
    { href: "/audios", label: "音频", sub: "聆听世界", bar: "bg-purple-500", count: audioCount, icon: Headphones, color: "text-purple-500", glow: "rgba(168,85,247,0.4)" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      <div className={`${bigTile} col-span-2`}>
        <RollingNumber value={v(totalWorks)} className={`${bigNum} text-orange-500`} style={{ filter: "drop-shadow(0 3px 6px rgba(249,115,22,0.4))" }} />
        <div className="mt-1.5 text-sm font-bold tracking-wide text-foreground/75" style={{ textShadow: "0 1px 1px rgba(255,255,255,0.6)" }}>总作品数</div>
      </div>
      <div className={`${bigTile} col-span-2`}>
        <RollingNumber value={v(views)} className={`${bigNum} text-rose-500`} style={{ filter: "drop-shadow(0 3px 6px rgba(236,72,153,0.4))" }} />
        <div className="mt-1.5 text-sm font-bold tracking-wide text-foreground/75" style={{ textShadow: "0 1px 1px rgba(255,255,255,0.6)" }}>总浏览量</div>
      </div>

      {/* 四个板块卡片：每个占 1 列，恰好两个对应上方一个大卡片，左边界对齐 */}
      {sections.map((s, i) => (
        <Link
          key={s.href}
          href={s.href}
          className="group overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.14] to-primary/[0.03] px-1.5 py-3 text-center shadow-lg shadow-primary/10 ring-1 ring-inset ring-white/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:px-3"
        >
          <RollingNumber value={v(s.count)} className={`block text-2xl font-extrabold tabular-nums ${s.color}`} style={{ filter: `drop-shadow(0 2px 5px ${s.glow})` }} />
          <div className="mt-1 flex items-center justify-center gap-1">
            <s.icon className={`icon-wiggle h-4 w-4 shrink-0 ${s.color}`} style={{ animationDelay: `${i * 0.5}s` }} />
            <span className="whitespace-nowrap text-[13px] font-bold text-foreground/75" style={{ textShadow: "0 1px 1px rgba(255,255,255,0.6)" }}>{s.label}</span>
          </div>
          {/* 点缀：副标题 + 同色小下划线 */}
          <div className="mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground/70">{s.sub}</div>
          <div className={`mx-auto mt-1 h-0.5 w-5 rounded-full ${s.bar} opacity-50 transition-all duration-300 group-hover:w-7 group-hover:opacity-80`} />
        </Link>
      ))}
    </div>
  );
}
