import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getArticleSummaries } from "@/lib/articles";
import { getAllGalleries } from "@/lib/galleries";
import { getAllVideos } from "@/lib/videos";
import { getAllAudios } from "@/lib/audios";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/lighthouse`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/images`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/videos`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/audios`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const articles: MetadataRoute.Sitemap = getArticleSummaries().map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: a.date ? new Date(a.date) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const images: MetadataRoute.Sitemap = getAllGalleries().map((g) => ({
    url: `${SITE_URL}/images/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const videos: MetadataRoute.Sitemap = getAllVideos().map((v) => ({
    url: `${SITE_URL}/videos/${v.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const audios: MetadataRoute.Sitemap = getAllAudios().map((a) => ({
    url: `${SITE_URL}/audios/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...articles, ...images, ...videos, ...audios];
}
