import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ENABLED, gitPublish } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!ADMIN_ENABLED) return NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
  try {
    const body = await request.json().catch(() => ({}));
    const result = gitPublish(String(body?.message ?? "更新内容"));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
