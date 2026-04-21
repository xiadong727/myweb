import { notFound } from "next/navigation";
import { getAllVideos, getVideoBySlug } from "@/lib/videos";

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
      </header>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-muted/40 shadow-inner">
        {video.kind === "embed" && video.embedUrl ? (
          <div className="aspect-video w-full">
            <iframe
              title={video.title}
              src={video.embedUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : video.kind === "file" && video.src ? (
          <video
            controls
            className="aspect-video w-full"
            poster={video.poster}
            preload="metadata"
          >
            <source src={video.src} />
            您的浏览器不支持 HTML5 视频。
          </video>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">未配置可用的视频源。</div>
        )}
      </div>
    </main>
  );
}
