import fs from "fs";
import path from "path";
import type { AudioItem } from "./types";

export function getAllAudios(): AudioItem[] {
  const p = path.join(process.cwd(), "data/audios.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as AudioItem[];
}

export function getAudioBySlug(slug: string): AudioItem | undefined {
  return getAllAudios().find((a) => a.slug === slug);
}
