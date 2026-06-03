import { getArticleSummaries } from "./articles";
import { getAllGalleries } from "./galleries";
import { getAllVideos } from "./videos";
import { getAllAudios } from "./audios";
import {
  LIGHTHOUSE_DOMAINS,
  type DomainStat,
  type EpisodeEntry,
  type DomainGroup,
  type LighthouseOverview,
} from "./lighthouse-shared";

// 重新导出静态常量与类型，方便其它服务端模块从 "@/lib/lighthouse" 一处引入。
// 客户端组件请直接从 "@/lib/lighthouse-shared" 引入，避免打包进 fs 依赖。
export * from "./lighthouse-shared";

const DOMAIN_CODES = new Set(LIGHTHOUSE_DOMAINS.map((d) => d.code));

export type DomainWork = { slug: string; title: string; date: string | null };
export type DomainWorks = {
  articles: DomainWork[];
  images: DomainWork[];
  videos: DomainWork[];
  audios: DomainWork[];
};

/** 某领域下的全部作品，按文章/图片/视频/音频分类。
 *  文章按 frontmatter 的 domain 归属；图片/视频/音频按「一鱼三吃」键 episode 前缀（如 L01-）归属。 */
export function getDomainWorks(code: string): DomainWorks {
  const inDomain = (ep?: string) => typeof ep === "string" && ep.startsWith(`${code}-`);
  const articles = getArticleSummaries()
    .filter((a) => a.domain === code)
    .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0))
    .map((a) => ({ slug: a.slug, title: a.title, date: a.date ?? null }));
  const images = getAllGalleries().filter((g) => inDomain(g.episode)).map((g) => ({ slug: g.slug, title: g.title, date: null }));
  const videos = getAllVideos().filter((v) => inDomain(v.episode)).map((v) => ({ slug: v.slug, title: v.title, date: null }));
  const audios = getAllAudios().filter((a) => inDomain(a.episode)).map((a) => ({ slug: a.slug, title: a.title, date: null }));
  return { articles, images, videos, audios };
}

/** 统计每个领域的作品数（文章+图片+视频+音频之和） */
export function getLighthouseDomainStats(): DomainStat[] {
  return LIGHTHOUSE_DOMAINS.map((d) => {
    const w = getDomainWorks(d.code);
    const count = w.articles.length + w.images.length + w.videos.length + w.audios.length;
    return {
      code: d.code,
      name: d.name,
      count,
      latestSlug: w.articles[w.articles.length - 1]?.slug ?? null,
    };
  });
}

/** 主线已更新的总期数 */
export function getLighthouseTotalEpisodes(): number {
  return getArticleSummaries().filter((a) => a.domain && DOMAIN_CODES.has(a.domain)).length;
}

/** 汇总「与光同行」总览页所需数据：按领域分组 + 最近更新 + 总进度 */
export function getLighthouseOverview(recentLimit = 5): LighthouseOverview {
  const articles = getArticleSummaries().filter(
    (a) => a.domain && DOMAIN_CODES.has(a.domain),
  );

  const domains: DomainGroup[] = LIGHTHOUSE_DOMAINS.map((d) => {
    const episodes: EpisodeEntry[] = articles
      .filter((a) => a.domain === d.code)
      .map((a) => ({
        episode: a.episode ?? null,
        slug: a.slug,
        title: a.title,
        date: a.date ?? null,
      }))
      .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0));
    return { code: d.code, name: d.name, count: episodes.length, episodes };
  });

  const nameByCode = new Map(LIGHTHOUSE_DOMAINS.map((d) => [d.code, d.name]));
  const recent = articles
    .filter((a) => a.date)
    .sort((a, b) => ((a.date as string) < (b.date as string) ? 1 : -1))
    .slice(0, recentLimit)
    .map((a) => ({
      episode: a.episode ?? null,
      slug: a.slug,
      title: a.title,
      date: a.date ?? null,
      code: a.domain as string,
      name: nameByCode.get(a.domain as string) ?? "",
    }));

  return {
    domains,
    recent,
    publishedTotal: articles.length,
    openedDomains: domains.filter((d) => d.count > 0).length,
  };
}
