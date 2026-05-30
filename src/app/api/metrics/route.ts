import { NextResponse, type NextRequest } from "next/server";
import {
  readMetrics,
  incrView,
  changeLike,
  parseId,
  metricsEnabled,
  metricsSource,
} from "@/lib/metrics";

export const dynamic = "force-dynamic";

// 读取某个作品的浏览量与点赞数： GET /api/metrics?id=articles:my-slug
// 诊断：GET /api/metrics?debug=1 仅返回检测到的环境变量「名字」（不含密钥）
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  if (sp.get("debug") === "1") {
    const candidateNames = Object.keys(process.env).filter(
      (k) => k.endsWith("REST_API_URL") || k.endsWith("REST_API_TOKEN"),
    );
    return NextResponse.json({
      enabled: metricsEnabled,
      detectedFrom: metricsSource,
      candidateEnvNames: candidateNames,
    });
  }

  const id = parseId(sp.get("id"));
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
