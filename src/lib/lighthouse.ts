import { getArticleSummaries } from "./articles";
import { getAllGalleries } from "./galleries";
import { getAllVideos } from "./videos";
import { getAllAudios } from "./audios";
import { getNavigation } from "./navigation";
import { isNavGroup, type NavNode, type SectionKey } from "./types";
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

/** 从导航树里，把挂在「与光同行 · …」各领域子目录（id 形如 vid-lh-L08）下的内容 slug → 领域编号。
 *  这样：把作品放进对应领域的菜单目录，就会被算进该领域（无需再填 episode 键）。 */
function mediaDomainMap(section: SectionKey): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (nodes: NavNode[], domain: string | null) => {
    for (const n of nodes) {
      if (isNavGroup(n)) {
        const m = n.id.match(/-lh-(L\d\d)$/);
        walk(n.children, m ? m[1] : domain);
      } else if (domain) {
        map.set(n.slug, domain);
      }
    }
  };
  walk(getNavigation().trees[section].nodes, null);
  return map;
}

type DomainMaps = { images: Map<string, string>; videos: Map<string, string>; audios: Map<string, string> };
function buildDomainMaps(): DomainMaps {
  return { images: mediaDomainMap("images"), videos: mediaDomainMap("videos"), audios: mediaDomainMap("audios") };
}

/** 某领域下的全部作品，按文章/图片/视频/音频分类。
 *  归属规则：文章按 frontmatter 的 domain；图片/视频/音频按「episode 键前缀（如 L08-）」**或**「放在该领域的菜单目录下」。 */
export function getDomainWorks(code: string, maps: DomainMaps = buildDomainMaps()): DomainWorks {
  const has = (ep: string | undefined, slug: string, m: Map<string, string>) =>
    (typeof ep === "string" && ep.startsWith(`${code}-`)) || m.get(slug) === code;
  const articles = getArticleSummaries()
    .filter((a) => a.domain === code)
    .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0))
    .map((a) => ({ slug: a.slug, title: a.title, date: a.date ?? null }));
  const images = getAllGalleries().filter((g) => has(g.episode, g.slug, maps.images)).map((g) => ({ slug: g.slug, title: g.title, date: null }));
  const videos = getAllVideos().filter((v) => has(v.episode, v.slug, maps.videos)).map((v) => ({ slug: v.slug, title: v.title, date: null }));
  const audios = getAllAudios().filter((a) => has(a.episode, a.slug, maps.audios)).map((a) => ({ slug: a.slug, title: a.title, date: null }));
  return { articles, images, videos, audios };
}

/** 统计每个领域的作品数（文章+图片+视频+音频之和） */
export function getLighthouseDomainStats(): DomainStat[] {
  const maps = buildDomainMaps();
  return LIGHTHOUSE_DOMAINS.map((d) => {
    const w = getDomainWorks(d.code, maps);
    const count = w.articles.length + w.images.length + w.videos.length + w.audios.length;
    return {
      code: d.code,
      name: d.name,
      count,
      latestSlug: w.articles[w.articles.length - 1]?.slug ?? null,
    };
  });
}

/** 主线已更新的总作品数（= 各领域文章+图片+视频+音频之和） */
export function getLighthouseTotalEpisodes(): number {
  return getLighthouseDomainStats().reduce((sum, d) => sum + d.count, 0);
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
