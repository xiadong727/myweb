import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ENABLED, getSiteSettings, saveArticleStyleSetting } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!ADMIN_ENABLED) return NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
  return NextResponse.json(getSiteSettings());
}

export async function POST(request: NextRequest) {
  if (!ADMIN_ENABLED) return NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
  try {
    const body = await request.json();
    const article = body?.article ?? {};
    const saved = saveArticleStyleSetting({
      firstLineIndent: Boolean(article.firstLineIndent),
      justify: Boolean(article.justify),
      fontSize: String(article.fontSize || "1.05rem"),
      lineHeight: Number(article.lineHeight) || 1.9,
      letterSpacing: String(article.letterSpacing ?? "0.02em"),
      paragraphGap: String(article.paragraphGap || "1.25rem"),
    });
    return NextResponse.json({ ok: true, article: saved });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
