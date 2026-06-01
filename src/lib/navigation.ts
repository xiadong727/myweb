import fs from "fs";
import path from "path";
import type { SiteNavigation, NavNode, SectionKey } from "./types";
import { isNavGroup } from "./types";
import { DRAFTS_VISIBLE } from "./site";
import { getDraftArticleSlugs } from "./articles";
import { getDraftGallerySlugs } from "./galleries";
import { getDraftVideoSlugs } from "./videos";
import { getDraftAudioSlugs } from "./audios";

function pruneDrafts(nodes: NavNode[], drafts: Set<string>): NavNode[] {
  const out: NavNode[] = [];
  for (const n of nodes) {
    if (isNavGroup(n)) out.push({ ...n, children: pruneDrafts(n.children, drafts) });
    else if (!drafts.has(n.slug)) out.push(n);
  }
  return out;
}

export function getNavigation(): SiteNavigation {
  const p = path.join(process.cwd(), "data/navigation.json");
  const nav = JSON.parse(fs.readFileSync(p, "utf8")) as SiteNavigation;
  if (DRAFTS_VISIBLE) return nav; // 本地开发：草稿照常显示，便于预览

  // 线上：从导航里剪掉草稿内容的入口
  const draftBySection: Record<SectionKey, Set<string>> = {
    articles: getDraftArticleSlugs(),
    images: getDraftGallerySlugs(),
    videos: getDraftVideoSlugs(),
    audios: getDraftAudioSlugs(),
  };
  (Object.keys(nav.trees) as SectionKey[]).forEach((k) => {
    nav.trees[k].nodes = pruneDrafts(nav.trees[k].nodes, draftBySection[k]);
  });
  return nav;
}
