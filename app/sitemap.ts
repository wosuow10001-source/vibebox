// app/sitemap.ts
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL!;

    const contents = await prisma.content.findMany({
      where: { status: "PUBLISHED" },
      select: { type: true, slug: true, updatedAt: true },
    });

    const tags = await prisma.tag.findMany({
      select: { slug: true },
    });

    const contentUrls = contents.map((c) => ({
      url: `${base}/${c.type === "POST" ? "p" : "a"}/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const tagUrls = tags.map((t) => ({
      url: `${base}/tag/${t.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

    return [
      {
        url: base,
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
      ...contentUrls,
      ...tagUrls,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [];
  }
}
