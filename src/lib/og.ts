/**
 * 为 OG 分享图按需加载「思源黑体」子集（只下载这段文字用到的字形，体积很小）。
 * 通过 Google Fonts 的 text= 子集接口获取 TTF；失败时返回 null（图仍会生成，只是中文用默认字体）。
 * 注：本地若无法访问 Google Fonts 会返回 null，部署到 Vercel 时正常。
 */
export async function loadOgFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const family = "Noto+Sans+SC:wght@700";
    const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
    // 用极旧的 UA，促使 Google 返回 ttf（satori 不支持 woff2）
    const css = await fetch(url, {
      headers: { "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)" },
    }).then((r) => r.text());
    const m = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:opentype|truetype)'\)/);
    if (!m) return null;
    const res = await fetch(m[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}
