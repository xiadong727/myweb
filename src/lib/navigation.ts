import fs from "fs";
import path from "path";
import type { SiteNavigation } from "./types";

export function getNavigation(): SiteNavigation {
  const p = path.join(process.cwd(), "data/navigation.json");
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as SiteNavigation;
}
