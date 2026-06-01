import fs from "fs";
import path from "path";
import type { AudioItem } from "./types";
import { DRAFTS_VISIBLE } from "./site";

function readAll(): AudioItem[] {
  const p = path.join(process.cwd(), "data/audios.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8")) as AudioItem[];
}

export function getAllAudios(): AudioItem[] {
  const all = readAll();
  return DRAFTS_VISIBLE ? all : all.filter((a) => !a.draft);
}

export function getAudioBySlug(slug: string): AudioItem | undefined {
  return getAllAudios().find((a) => a.slug === slug);
}

export function getDraftAudioSlugs(): Set<string> {
  return new Set(readAll().filter((a) => a.draft).map((a) => a.slug));
}
