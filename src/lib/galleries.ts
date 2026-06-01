import fs from "fs";
import path from "path";
import type { GalleryItem } from "./types";
import { DRAFTS_VISIBLE } from "./site";

function readAll(): GalleryItem[] {
  const p = path.join(process.cwd(), "data/galleries.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8")) as GalleryItem[];
}

/** 公开列表：线上隐藏草稿 */
export function getAllGalleries(): GalleryItem[] {
  const all = readAll();
  return DRAFTS_VISIBLE ? all : all.filter((g) => !g.draft);
}

export function getGalleryBySlug(slug: string): GalleryItem | undefined {
  return getAllGalleries().find((g) => g.slug === slug);
}

/** 草稿 slug 集合（用于导航剪枝） */
export function getDraftGallerySlugs(): Set<string> {
  return new Set(readAll().filter((g) => g.draft).map((g) => g.slug));
}
