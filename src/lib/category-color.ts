// 栏目（顶层分类）配色 —— 全站统一来源。客户端安全：纯常量，勿引入 fs。
// 按顶层分类在「文章导航树」里的位置索引循环取色，确保同一分类在侧栏 / 首页磁贴 / 分类页处处同色。
// 各变体都写成字面量类名，保证 Tailwind JIT 能生成。

export type CategoryColor = {
  dot: string;   // 圆点底色
  text: string;  // 图标 / 文字
  soft: string;  // 浅色底（磁贴 / 徽标背景）
  ring: string;  // 边框
};

export const CATEGORY_PALETTE: CategoryColor[] = [
  { dot: "bg-orange-400", text: "text-orange-500", soft: "bg-orange-400/10", ring: "border-orange-400/30" },
  { dot: "bg-emerald-400", text: "text-emerald-500", soft: "bg-emerald-400/10", ring: "border-emerald-400/30" },
  { dot: "bg-sky-400", text: "text-sky-500", soft: "bg-sky-400/10", ring: "border-sky-400/30" },
  { dot: "bg-rose-400", text: "text-rose-500", soft: "bg-rose-400/10", ring: "border-rose-400/30" },
  { dot: "bg-violet-400", text: "text-violet-500", soft: "bg-violet-400/10", ring: "border-violet-400/30" },
  { dot: "bg-amber-400", text: "text-amber-500", soft: "bg-amber-400/10", ring: "border-amber-400/30" },
  { dot: "bg-teal-400", text: "text-teal-500", soft: "bg-teal-400/10", ring: "border-teal-400/30" },
  { dot: "bg-pink-400", text: "text-pink-500", soft: "bg-pink-400/10", ring: "border-pink-400/30" },
];

export function catColor(index: number): CategoryColor {
  return CATEGORY_PALETTE[((index % CATEGORY_PALETTE.length) + CATEGORY_PALETTE.length) % CATEGORY_PALETTE.length];
}
