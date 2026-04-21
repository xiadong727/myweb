import { notFound } from "next/navigation";
import Image from "next/image";
import { getAllAudios, getAudioBySlug } from "@/lib/audios";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return getAllAudios().map((a) => ({ slug: a.slug.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const a = getAudioBySlug(path);
  if (!a) return { title: "未找到" };
  return { title: a.title };
}

export default async function AudioPage({ params }: Props) {
  const { slug } = await params;
  const path = slug.join("/");
  const audio = getAudioBySlug(path);
  if (!audio) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {audio.cover && (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-border shadow-sm sm:h-40 sm:w-40">
            <Image src={audio.cover} alt={audio.title} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {audio.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {audio.description}
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm">
        <audio controls className="w-full" preload="metadata">
          <source src={audio.src} />
          您的浏览器不支持 HTML5 音频。
        </audio>
      </div>
    </main>
  );
}
