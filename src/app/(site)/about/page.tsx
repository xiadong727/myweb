import Link from "next/link";
import { Compass, FileText, Rss, Mail } from "lucide-react";
import { SITE_NAME } from "@/lib/site";

export const metadata = {
  title: "关于",
  description: `关于「${SITE_NAME}」与「与光同行」这件事。`,
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">关于</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {SITE_NAME}
      </h1>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/90">
        <p className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 text-lg leading-relaxed">
          用十年时间，把人类数千年的智慧结晶，打磨成每个家庭都能读懂、用得上的“思想工具”，留下一套能够穿越周期、可以代际传递的精神作品。
        </p>
        <p>
          这里是我记录与分享的地方——既有「与光同行」这条主线，一个领域一个领域地把经典智慧拆解、转译成能讲给孩子听、也能用在生活里的内容；也有日常的文字、影像与声音。
        </p>
        <p>不赶进度、不设期限，只求走得扎实。如果其中某一篇曾让你有片刻触动，于我便是莫大的鼓励。</p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link
          href="/lighthouse"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <Compass className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">与光同行 · 主线总览</span>
        </Link>
        <Link
          href="/articles"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">全部文章</span>
        </Link>
        <a
          href="/feed.xml"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <Rss className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">RSS 订阅</span>
        </a>
        <Link
          href="/contact"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <Mail className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">联系我</span>
        </Link>
      </div>
    </main>
  );
}
