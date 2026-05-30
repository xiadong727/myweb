"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Img = { src: string; alt: string };

/** 图集网格 + 点击放大的灯箱（支持左右切换、Esc 关闭） */
export function GalleryLightbox({ images }: { images: Img[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(
    () => setOpen((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const next = useCallback(
    () => setOpen((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, prev, next]);

  return (
    <>
      <div className="mt-10 columns-1 gap-4 sm:columns-2">
        {images.map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={1600}
              height={1000}
              className="h-auto w-full object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {img.alt ? <p className="px-3 py-2 text-xs text-muted-foreground">{img.alt}</p> : null}
          </button>
        ))}
      </div>

      {open !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            aria-label="关闭"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/90 transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="上一张"
              className="absolute left-2 rounded-full bg-white/10 p-2 text-white/90 transition hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : null}

          <figure className="flex max-h-[90vh] max-w-[92vw] flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[open].src}
              alt={images[open].alt}
              className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
            />
            <figcaption className="mt-3 text-center text-sm text-white/70">
              {images[open].alt ? <span>{images[open].alt} · </span> : null}
              {open + 1} / {images.length}
            </figcaption>
          </figure>

          {images.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="下一张"
              className="absolute right-2 rounded-full bg-white/10 p-2 text-white/90 transition hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
