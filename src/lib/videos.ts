import fs from "fs";
import path from "path";
import type { VideoItem } from "./types";

export function getAllVideos(): VideoItem[] {
  const p = path.join(process.cwd(), "data/videos.json");
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as VideoItem[];
}

export function getVideoBySlug(slug: string): VideoItem | undefined {
  return getAllVideos().find((v) => v.slug === slug);
}
