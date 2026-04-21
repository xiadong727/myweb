---
title: 静态站点起步
date: "2026-04-01"
excerpt: 用 Next.js 搭建可部署的个人作品站：内容在仓库里、构建时生成搜索索引。
tags:
  - Next.js
  - 静态站点
---

## 为什么选静态站点

访问时直接由 CDN 下发预先构建好的页面，**无需**为每位访客在服务器上实时查库拼页。对个人作品展示来说，通常**更快、更便宜、更省心**。

## 内容放哪里

- **文章**：`content/articles/` 下的 Markdown，随 Git 版本管理。
- **图集 / 视频元数据**：`data/` 下的 JSON，树状导航在 `data/navigation.json` 配置。

## 下一步

把本站部署到 Vercel 或 Cloudflare Pages，绑定自己的域名，即可完成上线。
