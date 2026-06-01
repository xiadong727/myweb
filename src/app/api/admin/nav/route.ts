import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ENABLED, navOp } from "@/lib/admin";
import type { SectionKey } from "@/lib/types";

export const dynamic = "force-dynamic";
const VALID = ["articles", "images", "videos", "audios"];

export async function POST(request: NextRequest) {
  if (!ADMIN_ENABLED) return NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
  try {
    const body = await request.json();
    const section = body?.section as SectionKey;
    if (!VALID.includes(section)) return NextResponse.json({ error: "无效的板块" }, { status: 400 });
    return NextResponse.json(navOp(section, String(body.op), {
      id: body.id ? String(body.id) : undefined,
      title: body.title ? String(body.title) : undefined,
      parentId: body.parentId ? String(body.parentId) : undefined,
      dir: body.dir === "up" || body.dir === "down" ? body.dir : undefined,
    }));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
