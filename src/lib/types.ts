export type NavLeaf = {
  id: string;
  title: string;
  slug: string;
};

export type NavGroup = {
  id: string;
  title: string;
  children: NavNode[];
};

export type NavNode = NavGroup | NavLeaf;

export function isNavGroup(n: NavNode): n is NavGroup {
  return "children" in n;
}

export type SectionKey = "articles" | "images" | "videos" | "audios";

export type SiteNavigation = {
  site: { title: string; tagline: string };
  trees: Record<
    SectionKey,
    {
      label: string;
      nodes: NavNode[];
    }
  >;
};

export type GalleryItem = {
  slug: string;
  title: string;
  description: string;
  cover: string;
  images: { src: string; alt: string }[];
  /** 「一鱼三吃」同期关联键，如 "L01-ep001"；填写后会与同键的文章/音频/视频互相链接 */
  episode?: string;
  /** 草稿：为 true 时线上隐藏，仅本地预览 */
  draft?: boolean;
  /** 发布日期 YYYY-MM-DD（可选；列表按它倒序） */
  date?: string;
};

export type VideoItem = {
  slug: string;
  title: string;
  description: string;
  kind: "embed" | "file";
  embedUrl?: string;
  src?: string;
  poster?: string;
  originalUrl?: string;
  /** 「一鱼三吃」同期关联键，如 "L01-ep001" */
  episode?: string;
  /** 草稿：为 true 时线上隐藏，仅本地预览 */
  draft?: boolean;
  /** 发布日期 YYYY-MM-DD（可选；列表按它倒序） */
  date?: string;
};

export type AudioItem = {
  slug: string;
  title: string;
  description: string;
  src: string;
  cover?: string;
  /** 「一鱼三吃」同期关联键，如 "L01-ep001" */
  episode?: string;
  /** 草稿：为 true 时线上隐藏，仅本地预览 */
  draft?: boolean;
  /** 发布日期 YYYY-MM-DD（可选；列表按它倒序） */
  date?: string;
};

export type ArticleMeta = {
  title: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
  // —— 智慧灯塔系列专属（均为可选）——
  series?: string;
  episode?: number;
  year?: number;
  domain?: string;
  layer?: "道" | "法" | "术" | "器";
  quote?: string;
  forKids?: string;
  books?: string[];
  score?: number;
  media?: { audio?: boolean; video?: boolean };
  access?: "free" | "member";
  /** 草稿：为 true 时线上隐藏，仅本地预览 */
  draft?: boolean;
};
