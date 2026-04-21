export const THEME_IDS = [
  "warm",
  "wisdom",
  "moments",
  "stellar",
  "forge",
  "spring",
  "summer",
  "autumn",
  "winter",
] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const THEME_STORAGE_KEY = "portfolio-theme";

export const themes: Record<
  ThemeId,
  { label: string; description: string }
> = {
  warm: {
    label: "暖光亲子",
    description: "米杏与柔橙，温柔陪伴感",
  },
  wisdom: {
    label: "阅见智慧",
    description: "纸感灰蓝，沉静阅读",
  },
  moments: {
    label: "自然时光",
    description: "薄荷森绿，日常与户外",
  },
  stellar: {
    label: "极夜星轨",
    description: "深空蓝黑 · 青紫极光 · 专业科技",
  },
  forge: {
    label: "锻界深灰",
    description: "石墨基底 · 琥珀微光 · 简约大气",
  },
  spring: {
    label: "春之复苏",
    description: "浅草新绿与樱粉，生机盎然",
  },
  summer: {
    label: "夏之繁星",
    description: "晴空湛蓝与明黄，活力清透",
  },
  autumn: {
    label: "秋之丰野",
    description: "枫红与暖金，岁月沉淀",
  },
  winter: {
    label: "冬之初雪",
    description: "冰蓝与霜白，纯净空灵",
  },
};

export function isThemeId(v: string | null): v is ThemeId {
  return v !== null && THEME_IDS.includes(v as ThemeId);
}
