"use client";

import { useState } from "react";
import { Download } from "lucide-react";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    if (ch === "\n") {
      lines.push(line);
      line = "";
      continue;
    }
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** 金句卡：把 frontmatter 里的 quote 渲染成可下载的分享图（纯 canvas，无第三方依赖） */
export function QuoteCard({ quote, source }: { quote: string; source?: string }) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      const W = 1080;
      const H = 1350;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#241a12");
      bg.addColorStop(1, "#3c2a1b");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(214,164,95,0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(48, 48, W - 96, H - 96);

      ctx.fillStyle = "rgba(214,164,95,0.85)";
      ctx.textBaseline = "top";
      ctx.font = '700 180px Georgia, "Times New Roman", serif';
      ctx.fillText("“", 104, 120);

      const fontSize = 56;
      ctx.fillStyle = "#f3e9dc";
      ctx.font = `600 ${fontSize}px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`;
      const lines = wrapText(ctx, quote, W - 240);
      const lineHeight = fontSize * 1.7;
      let y = (H - lines.length * lineHeight) / 2;
      ctx.textBaseline = "middle";
      for (const line of lines) {
        ctx.fillText(line, 120, y + lineHeight / 2);
        y += lineHeight;
      }

      ctx.textBaseline = "alphabetic";
      if (source) {
        ctx.fillStyle = "rgba(214,164,95,0.9)";
        ctx.font = '500 30px "Noto Sans SC", "PingFang SC", sans-serif';
        ctx.fillText(`— ${source}`, 120, H - 200);
      }
      ctx.fillStyle = "rgba(243,233,220,0.6)";
      ctx.font = '400 26px "Noto Sans SC", "PingFang SC", sans-serif';
      ctx.fillText("拾光共长 · 与光同行", 120, H - 150);

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `金句卡-${(source || "quote").slice(0, 12)}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-12 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 sm:p-6">
      <blockquote className="whitespace-pre-line text-[1.15rem] font-medium leading-relaxed text-foreground/90">
        {quote}
        {source ? (
          <footer className="mt-2 text-sm font-normal text-muted-foreground">— {source}</footer>
        ) : null}
      </blockquote>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {busy ? "生成中…" : "保存金句卡"}
        </button>
      </div>
    </section>
  );
}
