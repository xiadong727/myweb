import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ENABLED, createMedia } from "@/lib/admin";
import type { SectionKey } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!ADMIN_ENABLED) {
    return NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const section = body?.section as Exclude<SectionKey, "articles">;
    if (!["images", "videos", "audios"].includes(section)) {
      return NextResponse.json({ error: "无效的板块" }, { status: 400 });
    }
    if (!body?.item?.slug || !body?.item?.title) {
      return NextResponse.json({ error: "标题和 slug 必填" }, { status: 400 });
    }
    const result = createMedia({
      section,
      item: body.item,
      navParentId: String(body.navParentId ?? ""),
      navTitle: body.navTitle ? String(body.navTitle) : undefined,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
