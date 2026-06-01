// 客户端工具：上传前在浏览器里压缩大图（canvas），并调用上传接口。

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || /(svg|gif)/i.test(file.type)) return file;
  try {
    const img = await createImageBitmap(file);
    const maxW = 1600;
    const scale = Math.min(1, maxW / img.width);
    if (scale === 1 && file.size < 400_000) return file; // 已经够小
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    const base = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadFiles(files: FileList | File[] | null): Promise<string[]> {
  if (!files) return [];
  const arr = Array.from(files);
  if (arr.length === 0) return [];
  const fd = new FormData();
  for (const f of arr) fd.append("file", await compressImage(f));
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "上传失败");
  return d.paths as string[];
}

export async function fetchImageLibrary(): Promise<string[]> {
  const r = await fetch("/api/admin/upload");
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "读取图片库失败");
  return d.images as string[];
}
