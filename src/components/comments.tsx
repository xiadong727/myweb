"use client";

import { useEffect, useRef } from "react";
import { GISCUS, commentsEnabled } from "@/lib/comments";

/** Giscus 评论区。未配置（缺少 repoId / categoryId）时自动隐藏。 */
export function Comments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!commentsEnabled || !el || el.hasChildNodes()) return;
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-repo", GISCUS.repo);
    s.setAttribute("data-repo-id", GISCUS.repoId);
    s.setAttribute("data-category", GISCUS.category);
    s.setAttribute("data-category-id", GISCUS.categoryId);
    s.setAttribute("data-mapping", "pathname");
    s.setAttribute("data-strict", "1");
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-emit-metadata", "0");
    s.setAttribute("data-input-position", "top");
    s.setAttribute("data-theme", "preferred_color_scheme");
    s.setAttribute("data-lang", "zh-CN");
    s.setAttribute("loading", "lazy");
    el.appendChild(s);
  }, []);

  if (!commentsEnabled) return null;

  return (
    <section className="mx-auto mt-12 max-w-4xl border-t border-border px-4 pt-8 sm:px-8 lg:px-12">
      <h2 className="mb-5 text-lg font-bold tracking-tight text-foreground">评论</h2>
      <div ref={ref} />
    </section>
  );
}
