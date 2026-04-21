import Link from "next/link";
import { getAllVideos } from "@/lib/videos";

export const metadata = {
  title: "视频",
};

export default function VideosIndexPage() {
  const videos = getAllVideos();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">视频</h1>
      <p className="mt-2 text-sm text-muted-foreground">元数据在 data/videos.json</p>
      <ul className="mt-8 space-y-3">
        {videos.map((v) => (
          <li key={v.slug}>
            <Link
              href={`/videos/${v.slug}`}
              className="block rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition hover:border-primary/25"
            >
              <div className="font-medium text-foreground">{v.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
              <div className="mt-2 font-mono text-[11px] text-muted-foreground/90">
                {v.kind === "embed" ? "嵌入" : "文件"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
