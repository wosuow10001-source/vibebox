// lib/seo.ts
import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL!;

export function buildMetadata({
  title,
  description,
  ogImage,
  canonical,
  noIndex = false,
}: {
  title: string;
  description?: string | null;
  ogImage?: string | null;
  canonical?: string | null;
  noIndex?: boolean;
}): Metadata {
  return {
    title,
    description: description ?? undefined,
    alternates: { canonical: canonical ?? BASE },
    openGraph: {
      title,
      description: description ?? undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function ArticleJsonLd({ content }: { content: any }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: content.title,
    description: content.description,
    image: content.ogImage,
    datePublished: content.publishedAt,
    dateModified: content.updatedAt,
    url: `${BASE}/p/${content.slug}`,
  };
}

export function WebAppJsonLd({ content }: { content: any }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: content.title,
    description: content.description,
    url: `${BASE}/a/${content.slug}`,
    applicationCategory: "WebApplication",
  };
}

export function VideoJsonLd({
  content,
  videoUrl,
}: {
  content: any;
  videoUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: content.title,
    description: content.description,
    thumbnailUrl: content.coverImage,
    uploadDate: content.publishedAt,
    contentUrl: videoUrl,
    url: `${BASE}/p/${content.slug}`,
  };
}
