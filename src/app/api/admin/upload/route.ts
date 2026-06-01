import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ENABLED, saveImage, listImages } from "@/lib/admin";

export const dynamic = "force-dynamic";

// 图片库：列出 public/images 已有图片
export async function GET() {
  if (!ADMIN_ENABLED) return NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
  return NextResponse.json({ images: listImages() });
}

export async function POST(request: NextRequest) {
  if (!ADMIN_ENABLED) {
    return NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
  }
  try {
    const form = await request.formData();
    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    if (files.length === 0) return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    const paths: string[] = [];
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer());
      paths.push(saveImage(f.name, buf));
    }
    return NextResponse.json({ ok: true, paths });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
