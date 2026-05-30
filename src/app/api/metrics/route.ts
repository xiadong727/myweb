import { NextResponse, type NextRequest } from "next/server";
import { readMetrics, incrView, changeLike, parseId, metricsEnabled } from "@/lib/metrics";

export const dynamic = "force-dynamic";

// 读取某个作品的浏览量与点赞数： GET /api/metrics?id=articles:my-slug
export async function GET(request: NextRequest) {
  const id = parseId(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const m = await readMetrics(id);
  return NextResponse.json({ ...m, enabled: metricsEnabled });
}

// 记录浏览或点赞： POST /api/metrics  body: { id, action: "view" | "like" | "unlike" }
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { id: rawId, action } = (body ?? {}) as { id?: unknown; action?: unknown };
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  if (action === "view") {
    const views = await incrView(id);
    return NextResponse.json({ views, enabled: metricsEnabled });
  }
  if (action === "like" || action === "unlike") {
    const likes = await changeLike(id, action === "like" ? 1 : -1);
    return NextResponse.json({ likes, enabled: metricsEnabled });
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
