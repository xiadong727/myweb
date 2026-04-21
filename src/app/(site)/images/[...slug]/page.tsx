import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllGalleries, getGalleryBySlug } from "@/lib/galleries";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return getAllGalleries().map((g) => ({ slug: g.slug.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const g = getGalleryBySlug(path);
  if (!g) return { title: "未找到" };
  return { title: g.title };
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const gallery = getGalleryBySlug(path);
  if (!gallery) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{gallery.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{gallery.description}</p>
      </header>
      <div className="mt-10 columns-1 gap-4 sm:columns-2">
        {gallery.images.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="relative w-full">
              <Image
                src={img.src}
                alt={img.alt}
                width={1600}
                height={1000}
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {img.alt ? <p className="px-3 py-2 text-xs text-muted-foreground">{img.alt}</p> : null}
          </div>
        ))}
      </div>
    </main>
  );
}
