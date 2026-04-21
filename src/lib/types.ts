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
};

export type VideoItem = {
  slug: string;
  title: string;
  description: string;
  kind: "embed" | "file";
  embedUrl?: string;
  src?: string;
  poster?: string;
};

export type AudioItem = {
  slug: string;
  title: string;
  description: string;
  src: string;
  cover?: string;
};

export type ArticleMeta = {
  title: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
};
