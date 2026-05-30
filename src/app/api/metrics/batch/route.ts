import { NextResponse, type NextRequest } from "next/server";
import { readManyMetrics, parseId, metricsEnabled } from "@/lib/metrics";

export const dynamic = "force-dynamic";

// 批量读取计数： POST /api/metrics/batch  body: { ids: string[] }
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const rawIds = (body as { ids?: unknown })?.ids;
  const ids = Array.isArray(rawIds)
    ? (rawIds.map(parseId).filter(Boolean) as string[]).slice(0, 100)
    : [];
  const metrics = await readManyMetrics(ids);
  return NextResponse.json({ metrics, enabled: metricsEnabled });
}
