---
title: 架构随笔
date: "2026-04-05"
excerpt: 左侧树状导航 + 全局搜索 + 三类作品路由的简单拆分方式。
tags:
  - 架构
---

## 路由

- `/articles/[...slug]` 映射到 `content/articles/{slug}.md`
- `/images/[...slug]` 读取 `data/galleries.json` 中对应 `slug` 的图集
- `/videos/[...slug]` 读取 `data/videos.json`

## 搜索

构建前脚本扫描标题与正文摘要，生成 `public/search-index.json`，前端用 MiniSearch 在内存中检索。
