import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getAllVideos, getVideoBySlug } from "@/lib/videos";
import { EpisodeNav } from "@/components/episode-nav";
import { MetricsBar } from "@/components/metrics-bar";
import { VideoPlayer } from "@/components/video-player";
import { getRelatedEpisodeLinks } from "@/lib/episode";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return getAllVideos().map((v) => ({ slug: v.slug.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const v = getVideoBySlug(path);
  if (!v) return { title: "未找到" };
  return { title: v.title };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const video = getVideoBySlug(path);
  if (!video) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{video.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{video.description}</p>
        
        {video.originalUrl ? (
          <div className="mt-6">
            <a
              href={video.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <ExternalLink className="h-4 w-4" />
              去 Bilibili 观看高清完整版
            </a>
          </div>
        ) : null}
        <div className="mt-6">
          <MetricsBar type="videos" slug={path} />
        </div>
      </header>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-muted/40 shadow-inner">
        <VideoPlayer
          kind={video.kind}
          embedUrl={video.embedUrl}
          src={video.src}
          poster={video.poster}
          title={video.title}
        />
      </div>

      <EpisodeNav
        links={getRelatedEpisodeLinks(video.episode ?? null, { type: "videos", slug: path })}
      />
    </main>
  );
}
