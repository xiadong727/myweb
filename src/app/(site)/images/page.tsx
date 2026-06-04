import Link from "next/link";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { getAllGalleries } from "@/lib/galleries";
import { MetricsInline } from "@/components/metrics-inline";

export const metadata = { title: "图片" };

export default function ImagesIndexPage() {
  const galleries = [...getAllGalleries()].sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? 1 : -1)); // 发布时间倒序

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
          <ImageIcon className="h-6 w-6 text-emerald-500" />
          图片
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">共 {galleries.length} 组 · 按发布时间排列</p>
      </header>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleries.map((g, i) => (
          <Link
            key={g.slug}
            href={`/images/${g.slug}`}
            className={`group overflow-hidden rounded-2xl border border-primary/10 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-md ${i % 2 === 0 ? "bg-primary/[0.06]" : "bg-primary/[0.02]"}`}
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={g.cover}
                alt={g.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
            <div className="p-4">
              <h2 className="text-[15px] font-bold leading-snug text-foreground transition group-hover:text-emerald-500 sm:text-base">{g.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>
              <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted-foreground/90">
                {g.date ? <span>{g.date}</span> : null}
                <MetricsInline type="images" slug={g.slug} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
