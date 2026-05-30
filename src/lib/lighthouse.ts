import { getArticleSummaries } from "./articles";
import {
  LIGHTHOUSE_DOMAINS,
  LIGHTHOUSE_TARGET_TOTAL,
  type DomainStat,
  type EpisodeEntry,
  type DomainGroup,
  type LighthouseOverview,
} from "./lighthouse-shared";

// 重新导出静态常量与类型，方便其它服务端模块从 "@/lib/lighthouse" 一处引入。
// 客户端组件请直接从 "@/lib/lighthouse-shared" 引入，避免打包进 fs 依赖。
export * from "./lighthouse-shared";

const DOMAIN_CODES = new Set(LIGHTHOUSE_DOMAINS.map((d) => d.code));

/** 统计每个领域已更新的期数，以及最新一期的链接 */
export function getLighthouseDomainStats(): DomainStat[] {
  const articles = getArticleSummaries().filter(
    (a) => a.domain && DOMAIN_CODES.has(a.domain),
  );
  return LIGHTHOUSE_DOMAINS.map((d) => {
    const inDomain = articles
      .filter((a) => a.domain === d.code)
      .sort((a, b) => (b.episode ?? 0) - (a.episode ?? 0));
    return {
      code: d.code,
      name: d.name,
      count: inDomain.length,
      latestSlug: inDomain[0]?.slug ?? null,
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
    return { code: d.code, name: d.name, layer: d.layer, count: episodes.length, episodes };
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
    targetTotal: LIGHTHOUSE_TARGET_TOTAL,
    openedDomains: domains.filter((d) => d.count > 0).length,
  };
}
