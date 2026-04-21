import Link from "next/link";
import Image from "next/image";
import { getAllGalleries } from "@/lib/galleries";

export const metadata = {
  title: "图片",
};

export default function ImagesIndexPage() {
  const galleries = getAllGalleries();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">图片</h1>
      <p className="mt-2 text-sm text-muted-foreground">图集见 data/galleries.json</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {galleries.map((g) => (
          <Link
            key={g.slug}
            href={`/images/${g.slug}`}
            className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/25 hover:shadow-md"
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
              <h2 className="font-semibold text-foreground">{g.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
