import fs from "fs";
import path from "path";
import type { GalleryItem } from "./types";

export function getAllGalleries(): GalleryItem[] {
  const p = path.join(process.cwd(), "data/galleries.json");
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as GalleryItem[];
}

export function getGalleryBySlug(slug: string): GalleryItem | undefined {
  return getAllGalleries().find((g) => g.slug === slug);
}
