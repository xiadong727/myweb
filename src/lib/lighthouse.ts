import { getArticleSummaries } from "./articles";

/** 与光同行 10 大领域（L01–L10），顺序即展示顺序 */
export const LIGHTHOUSE_DOMAINS: { code: string; name: string }[] = [
  { code: "L01", name: "哲学" },
  { code: "L02", name: "思维" },
  { code: "L03", name: "品格" },
  { code: "L04", name: "历史" },
  { code: "L05", name: "科学" },
  { code: "L06", name: "艺术" },
  { code: "L07", name: "人际" },
  { code: "L08", name: "财富" },
  { code: "L09", name: "生活" },
  { code: "L10", name: "心灵" },
];

const DOMAIN_CODES = new Set(LIGHTHOUSE_DOMAINS.map((d) => d.code));

export type DomainStat = {
  code: string;
  name: string;
  count: number;
  /** 该领域最新一期文章的 slug，无则为 null */
  latestSlug: string | null;
};

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
