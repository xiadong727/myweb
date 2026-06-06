import { notFound } from "next/navigation";
import Link from "next/link";
import { FolderOpen, FileText, ChevronRight } from "lucide-react";
import { getArticleCategories, getCategoryArticles } from "@/lib/categories";
import { catColor } from "@/lib/category-color";
import { MetricsInline } from "@/components/metrics-inline";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getArticleCategories().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const cat = getCategoryArticles(id);
  return { title: cat ? cat.title : "专栏" };
}

export default async function TopicPage({ params }: Props) {
  const { id } = await params;
  const cat = getCategoryArticles(id);
  if (!cat) notFound();
  const col = catColor(cat.colorIndex);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-12">
      <header className={`overflow-hidden rounded-3xl border ${col.ring} ${col.soft} p-7 sm:p-9`}>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <FolderOpen className={`h-4 w-4 ${col.text}`} />
          专栏
        </p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{cat.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          共 <span className={`font-semibold ${col.text}`}>{cat.count}</span> 篇 · 按发布时间排列
        </p>
      </header>

      {cat.articles.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          这个专栏还在路上，内容建设中…
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {cat.articles.map((item, i) => (
            <li key={item.slug}>
              <Link
                href={`/articles/${item.slug}`}
                className={`group flex items-start gap-4 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${col.ring} ${i % 2 === 0 ? col.tintA : col.tintB}`}
              >
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${col.soft}`}>
                  <FileText className={`h-5 w-5 ${col.text}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[15px] font-bold leading-snug text-foreground transition group-hover:text-primary sm:text-base">{item.title}</h2>
                  {item.excerpt ? <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{item.excerpt}</p> : null}
                  <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted-foreground/90">
                    {item.date ? <span>{item.date}</span> : null}
                    <MetricsInline type="articles" slug={item.slug} />
                  </div>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
