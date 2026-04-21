import Link from "next/link";
import { getAllAudios } from "@/lib/audios";

export const metadata = {
  title: "音频",
};

export default function AudiosIndexPage() {
  const audios = getAllAudios();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">音频</h1>
      <p className="mt-2 text-sm text-muted-foreground">元数据在 data/audios.json</p>
      <ul className="mt-8 space-y-3">
        {audios.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/audios/${a.slug}`}
              className="block rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition hover:border-primary/25 hover:shadow-md"
            >
              <div className="font-medium text-foreground">{a.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
