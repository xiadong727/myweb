import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ENABLED, createMedia, getMediaItem, updateMedia, deleteMedia } from "@/lib/admin";
import type { SectionKey } from "@/lib/types";

export const dynamic = "force-dynamic";

type MediaSection = Exclude<SectionKey, "articles">;
const VALID = ["images", "videos", "audios"];

function guard() {
  return ADMIN_ENABLED ? null : NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
}

export async function GET(request: NextRequest) {
  const g = guard(); if (g) return g;
  const section = request.nextUrl.searchParams.get("section") as MediaSection;
  const slug = request.nextUrl.searchParams.get("slug");
  if (!VALID.includes(section) || !slug) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  try {
    return NextResponse.json(getMediaItem(section, slug));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  const g = guard(); if (g) return g;
  try {
    const body = await request.json();
    const section = body?.section as MediaSection;
    if (!VALID.includes(section)) return NextResponse.json({ error: "无效的板块" }, { status: 400 });
    if (!body?.item?.slug || !body?.item?.title) return NextResponse.json({ error: "标题和 slug 必填" }, { status: 400 });
    return NextResponse.json({ ok: true, ...createMedia({ section, item: body.item, navParentId: String(body.navParentId ?? ""), navTitle: body.navTitle ? String(body.navTitle) : undefined }) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const g = guard(); if (g) return g;
  try {
    const body = await request.json();
    const section = body?.section as MediaSection;
    if (!VALID.includes(section)) return NextResponse.json({ error: "无效的板块" }, { status: 400 });
    if (!body?.item?.slug || !body?.item?.title) return NextResponse.json({ error: "标题和 slug 必填" }, { status: 400 });
    return NextResponse.json({ ok: true, ...updateMedia(section, String(body.item.slug), body.item, body.navTitle ? String(body.navTitle) : undefined) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const g = guard(); if (g) return g;
  const section = request.nextUrl.searchParams.get("section") as MediaSection;
  const slug = request.nextUrl.searchParams.get("slug");
  if (!VALID.includes(section) || !slug) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, ...deleteMedia(section, slug) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
