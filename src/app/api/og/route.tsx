import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { loadOgFont } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

const SIZE = { width: 1200, height: 630 };

// 文章分享图： /api/og?title=<标题>
export async function GET(request: NextRequest) {
  const raw = (request.nextUrl.searchParams.get("title") ?? "").slice(0, 80);
  const title = raw || SITE_NAME;
  const brand = `${SITE_NAME} · 与光同行`;

  const fontData = await loadOgFont(`${title}${brand}认知陪伴记录美好“”·—、，。：！？`);
  const fonts = fontData
    ? [{ name: "NotoSC", data: fontData, weight: 700 as const, style: "normal" as const }]
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #241a12 0%, #3c2a1b 100%)",
          color: "#f3e9dc",
          fontFamily: fontData ? "NotoSC" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, color: "#d6a45f" }}>
          {brand}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 22 ? 64 : 78,
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26,
            color: "rgba(243,233,220,0.6)",
          }}
        >
          认知 · 陪伴 · 记录美好
        </div>
      </div>
    ),
    {
      ...SIZE,
      ...(fonts ? { fonts } : {}),
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
