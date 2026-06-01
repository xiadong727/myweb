import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ENABLED } from "@/lib/admin";
import { importWeChat, importBilibili } from "@/lib/import";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!ADMIN_ENABLED) return NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
  try {
    const body = await request.json();
    const type = body?.type as "wechat" | "bilibili";
    const items: string[] = Array.isArray(body?.items) ? body.items.map(String).map((s: string) => s.trim()).filter(Boolean) : [];
    const navParentId = String(body?.navParentId ?? "");
    if (!["wechat", "bilibili"].includes(type)) return NextResponse.json({ error: "无效的导入类型" }, { status: 400 });
    if (items.length === 0) return NextResponse.json({ error: "请至少粘贴一条链接" }, { status: 400 });

    const results: { input: string; ok: boolean; title?: string; slug?: string; error?: string }[] = [];
    for (const input of items) {
      try {
        const r = type === "wechat" ? await importWeChat(input, navParentId) : await importBilibili(input, navParentId);
        results.push({ input, ok: true, title: r.title, slug: r.slug });
      } catch (e) {
        results.push({ input, ok: false, error: (e as Error).message });
      }
    }
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
