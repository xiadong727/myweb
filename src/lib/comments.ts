// Giscus 评论配置（基于 GitHub Discussions，免费、无需数据库）。
// 开通步骤见《网站使用指南》。两个 ID 从 https://giscus.app 生成后填到 Vercel 环境变量：
//   NEXT_PUBLIC_GISCUS_REPO_ID、NEXT_PUBLIC_GISCUS_CATEGORY_ID
// （也可以直接把下面引号里的空字符串替换成你的值。）

export const GISCUS = {
  repo: "xiadong727/myweb",
  // 已为你预填仓库 ID（即 giscus 的 data-repo-id）
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "R_kgDOSIy1hg",
  category: "Announcements",
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "DIC_kwDOSIy1hs4C-Kjw",
};

/** 两个 ID 都填了才启用；否则评论区自动隐藏 */
export const commentsEnabled = Boolean(GISCUS.repoId && GISCUS.categoryId);
