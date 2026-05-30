"use client";

import { useState } from "react";
import { Play } from "lucide-react";

type Props = {
  kind?: string;
  embedUrl?: string;
  src?: string;
  poster?: string;
  title: string;
};

/** 视频播放器：embed 类型默认只显示封面+播放键，点击后才加载 iframe，
 *  避免一进页面就拉取（可能被墙/很慢的）第三方播放器，国内打开更快。 */
export function VideoPlayer({ kind, embedUrl, src, poster, title }: Props) {
  const [playing, setPlaying] = useState(false);

  if (kind === "embed" && embedUrl) {
    if (!playing) {
      return (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`播放视频：${title}`}
          className="group relative flex aspect-video w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#241a12] to-[#3c2a1b]"
          style={
            poster
              ? { backgroundImage: `url(${poster})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          <span className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-110">
            <Play className="ml-1 h-7 w-7 fill-current text-[#3c2a1b]" />
          </span>
          <span className="absolute bottom-3 text-xs text-white/70">点击播放</span>
        </button>
      );
    }
    return (
      <div className="aspect-video w-full">
        <iframe
          title={title}
          src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (kind === "file" && src) {
    return (
      <video controls className="aspect-video w-full" poster={poster} preload="none">
        <source src={src} />
        您的浏览器不支持 HTML5 视频。
      </video>
    );
  }

  return <div className="p-8 text-center text-sm text-muted-foreground">未配置可用的视频源。</div>;
}
