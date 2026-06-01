import { NextResponse } from "next/server";
import { ADMIN_ENABLED, getAdminOptions } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!ADMIN_ENABLED) {
    return NextResponse.json({ error: "后台仅在本地开发可用" }, { status: 403 });
  }
  return NextResponse.json(getAdminOptions());
}
