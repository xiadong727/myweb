import { getArticleSummaries } from "./articles";
import { getAllGalleries } from "./galleries";
import { getAllVideos } from "./videos";
import { getAllAudios } from "./audios";
import type { SectionKey } from "./types";

/**
 * 「一鱼三吃」同期关联键。
 * 文章从 frontmatter 的 domain + episode 推导（如 domain="L01"、episode=1 → "L01-ep001"）；
 * 图片/视频/音频在各自 JSON 里手动写 `episode: "L01-ep001"` 即可与文章互相链接。
 */
export function episodeKeyFromArticle(meta: {
  domain?: string;
  episode?: number;
}): string | null {
  if (!meta.domain || meta.episode == null) return null;
  return `${meta.domain}-ep${String(meta.episode).padStart(3, "0")}`;
}

export type EpisodeLink = {
  type: SectionKey;
  slug: string;
  title: string;
};

/** 收集某一期 key 对应的全部媒介（文章/图片/视频/音频） */
export function getEpisodeLinks(key: string): EpisodeLink[] {
  const links: EpisodeLink[] = [];

  for (const a of getArticleSummaries()) {
    if (episodeKeyFromArticle(a) === key) {
      links.push({ type: "articles", slug: a.slug, title: a.title });
    }
  }
  for (const g of getAllGalleries()) {
    if (g.episode === key) links.push({ type: "images", slug: g.slug, title: g.title });
  }
  for (const v of getAllVideos()) {
    if (v.episode === key) links.push({ type: "videos", slug: v.slug, title: v.title });
  }
  for (const au of getAllAudios()) {
    if (au.episode === key) links.push({ type: "audios", slug: au.slug, title: au.title });
  }

  return links;
}

/** 取得「除当前条目外」的同期其它媒介，用于详情页底部互链卡片 */
export function getRelatedEpisodeLinks(
  key: string | null,
  current: { type: SectionKey; slug: string },
): EpisodeLink[] {
  if (!key) return [];
  return getEpisodeLinks(key).filter(
    (l) => !(l.type === current.type && l.slug === current.slug),
  );
}
