import Link from "next/link";
import { Home, FileText } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      <p className="select-none font-mono text-[7rem] font-bold leading-none text-primary/15 sm:text-[9rem]">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        这里空空如也
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        你要找的页面可能被移动、删除了，或者从未存在过。不如回到首页，或去文章里逛逛。
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Home className="h-4 w-4" />
          回到首页
        </Link>
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
        >
          <FileText className="h-4 w-4 text-primary" />
          浏览文章
        </Link>
      </div>
    </main>
  );
}
