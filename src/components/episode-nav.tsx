import Link from "next/link";
import { FileText, Image as ImageIcon, Video, Headphones } from "lucide-react";
import type { EpisodeLink } from "@/lib/episode";
import type { SectionKey } from "@/lib/types";

const SECTION_META: Record<SectionKey, { base: string; label: string; Icon: typeof FileText }> = {
  articles: { base: "/articles", label: "本期文章", Icon: FileText },
  images: { base: "/images", label: "本期图片", Icon: ImageIcon },
  videos: { base: "/videos", label: "本期视频", Icon: Video },
  audios: { base: "/audios", label: "本期音频", Icon: Headphones },
};

/** 「一鱼三吃」互链卡片：展示同一期的其它媒介入口 */
export function EpisodeNav({ links }: { links: EpisodeLink[] }) {
  if (!links.length) return null;

  return (
    <nav
      aria-label="本期其它内容"
      className="mt-12 rounded-xl border border-border bg-muted/30 p-4 sm:p-5"
    >
      <p className="mb-3 text-sm font-semibold text-foreground/80">🐟 一鱼三吃 · 本期其它形式</p>
      <ul className="flex flex-wrap gap-2.5">
        {links.map((l) => {
          const { base, label, Icon } = SECTION_META[l.type];
          return (
            <li key={`${l.type}/${l.slug}`}>
              <Link
                href={`${base}/${l.slug}`}
                className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:border-primary/40 hover:bg-primary/5"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground transition group-hover:text-foreground">
                  <span className="mr-1.5 text-xs text-primary/80">{label}</span>
                  {l.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
