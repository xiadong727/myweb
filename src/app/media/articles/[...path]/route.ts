import fs from "fs";
import path from "path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ROOT = path.join(process.cwd(), "content", "articles");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

function isUnderRoot(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  const rootResolved = path.resolve(ROOT);
  return resolved === rootResolved || resolved.startsWith(rootResolved + path.sep);
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path: segments } = await ctx.params;
  if (!segments?.length) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const decoded = segments.map((p) => decodeURIComponent(p));
  const candidate = path.normalize(path.join(ROOT, ...decoded));

  if (!isUnderRoot(candidate)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const st = fs.statSync(candidate);
    if (!st.isFile()) {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }

  const buf = fs.readFileSync(candidate);
  const ext = path.extname(candidate).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";

  return new NextResponse(buf, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
