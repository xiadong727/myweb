import { notFound } from "next/navigation";
import { getAllGalleries, getGalleryBySlug } from "@/lib/galleries";
import { EpisodeNav } from "@/components/episode-nav";
import { MetricsBar } from "@/components/metrics-bar";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { getRelatedEpisodeLinks } from "@/lib/episode";

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
        <div className="mt-4">
          <MetricsBar type="images" slug={path} />
        </div>
      </header>
      <GalleryLightbox images={gallery.images} />

      <EpisodeNav
        links={getRelatedEpisodeLinks(gallery.episode ?? null, { type: "images", slug: path })}
      />
    </main>
  );
}
