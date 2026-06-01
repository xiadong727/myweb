import fs from "fs";
import path from "path";
import type { VideoItem } from "./types";
import { DRAFTS_VISIBLE } from "./site";

function readAll(): VideoItem[] {
  const p = path.join(process.cwd(), "data/videos.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8")) as VideoItem[];
}

export function getAllVideos(): VideoItem[] {
  const all = readAll();
  return DRAFTS_VISIBLE ? all : all.filter((v) => !v.draft);
}

export function getVideoBySlug(slug: string): VideoItem | undefined {
  return getAllVideos().find((v) => v.slug === slug);
}

export function getDraftVideoSlugs(): Set<string> {
  return new Set(readAll().filter((v) => v.draft).map((v) => v.slug));
}
