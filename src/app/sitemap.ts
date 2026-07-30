import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { DINOSAURS } from "@/lib/dinosaurs";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/collection`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    ...DINOSAURS.map((d) => ({
      url: `${SITE_URL}/dinosaurs/${d.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
