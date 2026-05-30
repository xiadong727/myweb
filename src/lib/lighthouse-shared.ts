// 客户端安全：本文件不得 import 任何使用 fs/path 的服务端模块（如 articles.ts）。
// 静态常量与类型放这里，服务端数据函数放 lighthouse.ts。

export type Layer = "道" | "法" | "术" | "器";

/** 主线规划的总期数（10 年 520 期） */
export const LIGHTHOUSE_TARGET_TOTAL = 520;

/** 与光同行 10 大领域（L01–L10），顺序即展示顺序；layer 为「道·法·术·器」分层 */
export const LIGHTHOUSE_DOMAINS: { code: string; name: string; layer: Layer }[] = [
  { code: "L01", name: "哲学", layer: "道" },
  { code: "L02", name: "思维", layer: "法" },
  { code: "L03", name: "品格", layer: "术" },
  { code: "L04", name: "历史", layer: "器" },
  { code: "L05", name: "科学", layer: "器" },
  { code: "L06", name: "艺术", layer: "器" },
  { code: "L07", name: "人际", layer: "术" },
  { code: "L08", name: "财富", layer: "术" },
  { code: "L09", name: "生活", layer: "术" },
  { code: "L10", name: "心灵", layer: "道" },
];

/** 「道·法·术·器」四层，顺序即筛选器展示顺序 */
export const LIGHTHOUSE_LAYERS: Layer[] = ["道", "法", "术", "器"];

export type DomainStat = {
  code: string;
  name: string;
  count: number;
  /** 该领域最新一期文章的 slug，无则为 null */
  latestSlug: string | null;
};

/** 一期主线内容的精简信息 */
export type EpisodeEntry = {
  episode: number | null;
  slug: string;
  title: string;
  date: string | null;
};

/** 一个领域及其已发布的所有期 */
export type DomainGroup = {
  code: string;
  name: string;
  layer: Layer;
  count: number;
  episodes: EpisodeEntry[];
};

/** 总览页所需的全部数据 */
export type LighthouseOverview = {
  domains: DomainGroup[];
  /** 按发布日期倒序的最近几期 */
  recent: (EpisodeEntry & { code: string; name: string })[];
  publishedTotal: number;
  targetTotal: number;
  openedDomains: number;
};
