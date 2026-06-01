import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ENABLED, createArticle, getArticle, updateArticle, deleteArticle } from "@/lib/admin";

export const dynamic = "force-dynamic";

function guard() {
  return ADMIN_ENABLED ? null : NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
}

function parse(body: Record<string, unknown>) {
  return {
    title: String(body.title ?? ""),
    date: body.date ? String(body.date) : undefined,
    excerpt: body.excerpt ? String(body.excerpt) : undefined,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
    domain: body.domain ? String(body.domain) : undefined,
    episode: body.episode != null && body.episode !== "" ? Number(body.episode) : undefined,
    quote: body.quote ? String(body.quote) : undefined,
    body: String(body.body ?? ""),
    navTitle: body.navTitle ? String(body.navTitle) : undefined,
  };
}

export async function GET(request: NextRequest) {
  const g = guard(); if (g) return g;
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
  try {
    return NextResponse.json(getArticle(slug));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  const g = guard(); if (g) return g;
  try {
    const body = await request.json();
    if (!body?.slug || !body?.title) return NextResponse.json({ error: "标题和文件路径必填" }, { status: 400 });
    return NextResponse.json({ ok: true, ...createArticle({ slug: String(body.slug), navParentId: String(body.navParentId ?? ""), ...parse(body) }) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const g = guard(); if (g) return g;
  try {
    const body = await request.json();
    if (!body?.slug || !body?.title) return NextResponse.json({ error: "缺少 slug 或标题" }, { status: 400 });
    return NextResponse.json({ ok: true, ...updateArticle(String(body.slug), parse(body)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const g = guard(); if (g) return g;
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, ...deleteArticle(slug) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
