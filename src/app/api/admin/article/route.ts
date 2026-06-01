import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ENABLED, createArticle } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!ADMIN_ENABLED) {
    return NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
  }
  try {
    const body = await request.json();
    if (!body?.slug || !body?.title) {
      return NextResponse.json({ error: "标题和文件路径必填" }, { status: 400 });
    }
    const result = createArticle({
      slug: String(body.slug),
      title: String(body.title),
      date: body.date ? String(body.date) : undefined,
      excerpt: body.excerpt ? String(body.excerpt) : undefined,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
      domain: body.domain ? String(body.domain) : undefined,
      episode: body.episode != null && body.episode !== "" ? Number(body.episode) : undefined,
      quote: body.quote ? String(body.quote) : undefined,
      body: String(body.body ?? ""),
      navParentId: String(body.navParentId ?? ""),
      navTitle: body.navTitle ? String(body.navTitle) : undefined,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
