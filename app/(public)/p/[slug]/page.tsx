// app/(public)/p/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { buildMetadata, ArticleJsonLd, WebAppJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/public/JsonLd";
import { SlotRenderer } from "@/components/public/SlotRenderer";
import { HtmlAppViewer } from "@/components/public/HtmlAppViewer";
import type { Metadata } from "next";

export async function generateStaticParams() {
  if (process.env.DEV_LOGIN === "true") {
    // DEV 모드: 파일에서 slug 목록 반환
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "data", "contents.json");
      const file = await fs.readFile(filePath, "utf-8");
      const contents = JSON.parse(file);
      if (!Array.isArray(contents)) return [];
      return contents.filter((c: any) => c.status === "PUBLISHED").map((c: any) => ({ slug: c.slug }));
    } catch (e) {
      return [];
    }
  }
  try {
    const contents = await prisma.content.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return contents.map((c) => ({ slug: c.slug }));
  } catch (error) {
    console.warn('generateStaticParams (post) DB error, returning empty array', error);
    return [];
  }
}

const DEMO_POSTS: { [key: string]: any } = {
  "nextjs-15-features": {
    id: "1",
    title: "Next.js 15 새 기능",
    slug: "nextjs-15-features",
    type: "POST",
    status: "PUBLISHED",
    description: "Next.js 15의 최신 기능들을 소개합니다",
    body: "<h2>Overview</h2><p>Next.js 15는 많은 개선사항과 새로운 기능을 포함하고 있습니다.</p>",
    seoTitle: "Next.js 15 새 기능 | Vibebox",
    seoDescription: "Next.js 15의 최신 기능 및 개선사항 소개",
    tags: [],
    assets: [],
  },
  "react-19-guide": {
    id: "2",
    title: "React 19 마이그레이션 가이드",
    slug: "react-19-guide",
    type: "POST",
    status: "PUBLISHED",
    description: "React 19로 업그레이드하는 방법을 안내합니다",
    body: "<h2>마이그레이션 가이드</h2><p>이 가이드는 React 18에서 19로 업그레이드하는 과정을 설명합니다.</p>",
    seoTitle: "React 19 마이그레이션 가이드 | Vibebox",
    seoDescription: "React 18에서 19로 성공적으로 마이그레이션하는 방법",
    tags: [],
    assets: [],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // DEV mode: file fallback
  if (process.env.DEV_LOGIN === "true") {
    // 1. 파일에서 콘텐츠 읽기
    const filePath = path.join(process.cwd(), "data", "contents.json");
    let contents = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      contents = JSON.parse(raw);
    } catch (e) {
      // fallback: 데모
      if (DEMO_POSTS[slug]) {
        const demoPost = DEMO_POSTS[slug];
        return buildMetadata({
          title: demoPost.seoTitle || demoPost.title,
          description: demoPost.seoDescription || demoPost.description,
          ogImage: demoPost.ogImage,
          canonical: demoPost.canonicalUrl,
        });
      }
      return { title: "Not Found" };
    }
    // 2. slug로 콘텐츠 찾기
    const content = contents.find((c: any) => c.slug === slug && c.status === "PUBLISHED");
    if (!content) {
      return { title: "Not Found" };
    }
    return buildMetadata({
      title: content.seoTitle || content.title,
      description: content.seoDescription || content.description,
      ogImage: content.ogImage || content.coverImage,
      canonical: content.canonicalUrl,
    });
  }

  try {
    const content = await prisma.content.findUnique({
      where: { slug },
    });

    if (!content || content.status !== "PUBLISHED") {
      return { title: "Not Found" };
    }

    return buildMetadata({
      title: content.seoTitle || content.title,
      description: content.seoDescription || content.description,
      ogImage: content.ogImage || content.coverImage,
      canonical: content.canonicalUrl,
    });
  } catch (error) {
    console.warn('generateMetadata (post) DB error, falling back to file:', error?.message || error);
    // DB failed (likely no credentials) - try file fallback
    try {
      const filePath = path.join(process.cwd(), "data", "contents.json");
      const raw = fs.readFileSync(filePath, "utf-8");
      const contents = JSON.parse(raw || "[]");
      const content = contents.find((c: any) => c.slug === slug && c.status === "PUBLISHED");
      if (!content) return { title: "Not Found" };
      return buildMetadata({
        title: content.seoTitle || content.title,
        description: content.seoDescription || content.description,
        ogImage: content.ogImage || content.coverImage,
        canonical: content.canonicalUrl,
      });
    } catch (e) {
      console.warn('generateMetadata fallback failed:', e);
      return { title: "Not Found" };
    }
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // DEV mode: file fallback
  if (process.env.DEV_LOGIN === "true") {
    // 1. 파일에서 콘텐츠 읽기
    const filePath = path.join(process.cwd(), "data", "contents.json");
    let contents = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      contents = JSON.parse(raw);
    } catch (e) {
      // fallback: 데모
      if (DEMO_POSTS[slug]) {
        const content = DEMO_POSTS[slug];
        const tags = content.tags.map((t: any) => t.slug).join(",");
        return (
          <>
            <JsonLd data={ArticleJsonLd({ content })} />
            <SlotRenderer placement="DETAIL_TOP" context={{ pageType: "post", tags: tags.split(",") }} />
            <article className="max-w-4xl mx-auto px-4 py-8">
              <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
              {content.description && <p className="text-gray-600 text-lg mb-6">{content.description}</p>}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.body || "" }} />
              {content.tags?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-8">
                  {content.tags.map((tag: any) => (
                    <a key={tag.slug} href={`/tag/${tag.slug}`} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      #{tag.name}
                    </a>
                  ))}
                </div>
              )}
            </article>
            <SlotRenderer placement="DETAIL_MID" />
            <SlotRenderer placement="DETAIL_BOTTOM" />
          </>
        );
      }
      return <div className="text-center py-20">콘텐츠를 찾을 수 없습니다.</div>;
    }
    // 2. slug로 콘텐츠 찾기 (normalize)
    function normalizeSlug(s: string) {
      return (s || "").toString().trim().replace(/\s+/g, "-").replace(/\/+$/, "").toLowerCase();
    }
    const normSlug = normalizeSlug(slug);
    const content = contents.find((c: any) => normalizeSlug(c.slug) === normSlug && c.status === "PUBLISHED");
    if (!content) {
      return <div className="text-center py-20">콘텐츠를 찾을 수 없습니다.</div>;
    }

    // ⚠️ HTML_APP 타입이면 HTML 앱 렌더링으로 처리
    if (content.type === "HTML_APP") {
      // assets에서 index.html 파일 찾기
      let appUrl = "";
      if (content.assets && content.assets.length > 0) {
        const asset = content.assets[0];
        const assetId = typeof asset === "string" ? asset : asset.id;
        const candidates = [
          path.join(process.cwd(), 'public', 'uploads', assetId, 'index.html'),
          path.join(process.cwd(), 'public', 'uploads', assetId, 'index.htm'),
          path.join(process.cwd(), 'public', 'uploads', `${assetId}.html`),
        ];
        const found = candidates.find((p) => fs.existsSync(p));
        if (found) {
          const rel = path.relative(path.join(process.cwd(), 'public'), found).split(path.sep).join('/');
          appUrl = `/${rel}`;
        } else {
          appUrl = `/uploads/${assetId}/index.html`;
        }
      }
      if (!appUrl) {
        return <div className="text-center py-20">앱 파일을 찾을 수 없습니다.</div>;
      }
      return (
        <>
          <JsonLd data={WebAppJsonLd({ content })} />
          <SlotRenderer placement="DETAIL_TOP" context={{ pageType: "html_app" }} />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
            {content.description && <p className="text-gray-600 mb-6">{content.description}</p>}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <HtmlAppViewer cdnUrl={appUrl} title={content.title} />
            </div>
          </div>
          <SlotRenderer placement="DETAIL_MID" />
          <SlotRenderer placement="DETAIL_BOTTOM" />
        </>
      );
    }

    // 3. 태그 변환 (구조 맞추기) - POST 타입만
    const tags = Array.isArray(content.tags)
      ? content.tags.map((t: any) => (typeof t === "string" ? t : t?.slug || t)).join(",")
      : "";
    // 본문이 없으면 안내 메시지 출력
    const htmlBody = content.body || content.content || content.excerpt || "";
    return (
      <>
        <JsonLd data={ArticleJsonLd({ content })} />
        <SlotRenderer placement="DETAIL_TOP" context={{ pageType: "post", tags: tags.split(",") }} />
        <article className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
          {content.description && <p className="text-gray-600 text-lg mb-6">{content.description}</p>}
          {htmlBody ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlBody }} />
          ) : (
            <div className="text-gray-400 text-center py-12">본문이 없는 콘텐츠입니다. 관리자에서 내용을 입력해 주세요.</div>
          )}
          {Array.isArray(content.tags) && content.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-8">
              {content.tags.map((tag: any, idx: number) => (
                <a key={typeof tag === "string" ? tag : tag?.slug || idx} href={typeof tag === "string" ? `/tag/${tag}` : `/tag/${tag?.slug || tag}`}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  #{typeof tag === "string" ? tag : tag?.name || tag?.slug || tag}
                </a>
              ))}
            </div>
          )}
        </article>
        <SlotRenderer placement="DETAIL_MID" />
        <SlotRenderer placement="DETAIL_BOTTOM" />
      </>
    );
  }

  try {
    const content = await prisma.content.findUnique({
      where: { slug },
      include: { tags: { include: { tag: true } }, assets: true },
    });

    if (!content || content.status !== "PUBLISHED") {
      return <div className="text-center py-20">콘텐츠를 찾을 수 없습니다.</div>;
    }

    // ⚠️ HTML_APP 타입이면 HTML 앱 렌더링으로 처리
    if (content.type === "HTML_APP") {
      const htmlAsset = content.assets?.[0];
      const appUrl = htmlAsset?.cdnUrl || "";
      if (!appUrl) {
        return <div className="text-center py-20">앱 파일을 찾을 수 없습니다.</div>;
      }
      return (
        <>
          <JsonLd data={WebAppJsonLd({ content })} />
          <SlotRenderer placement="DETAIL_TOP" context={{ pageType: "html_app" }} />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
            {content.description && <p className="text-gray-600 mb-6">{content.description}</p>}
            <div className="flex gap-2 mb-6 flex-wrap">
              {content.tags.map(({ tag }) => (
                <a key={tag.slug} href={`/tag/${tag.slug}`} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  #{tag.name}
                </a>
              ))}
            </div>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <HtmlAppViewer cdnUrl={appUrl} title={content.title} />
            </div>
          </div>
          <SlotRenderer placement="DETAIL_MID" />
          <SlotRenderer placement="DETAIL_BOTTOM" />
        </>
      );
    }

    const tags = content.tags.map((t) => t.tag.slug).join(",");

    return (
      <>
        <JsonLd data={ArticleJsonLd({ content })} />
        <SlotRenderer placement="DETAIL_TOP" context={{ pageType: "post", tags: tags.split(",") }} />

      <article className="max-w-3xl mx-auto px-4 py-8">
        {content.coverImage && (
          <img
            src={content.coverImage}
            alt={content.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
        {content.description && (
          <p className="text-gray-600 text-lg mb-6">{content.description}</p>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {content.tags.map(({ tag }) => (
            <a
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition"
            >
              #{tag.name}
            </a>
          ))}
        </div>

        <div className="prose prose-sm max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: content.body || "" }} />
        </div>

        <p className="text-sm text-gray-500">
          작성일: {new Date(content.publishedAt || "").toLocaleDateString("ko-KR")}
        </p>
      </article>

      <SlotRenderer placement="DETAIL_MID" context={{ pageType: "post", tags: tags.split(",") }} />
      <SlotRenderer placement="DETAIL_BOTTOM" context={{ pageType: "post" }} />
    </>
    );
  } catch (error) {
    console.error('PostPage DB error, falling back to file:', error?.message || error);
    // Try to fallback to file-based content if DB is not available
    try {
      const filePath = path.join(process.cwd(), "data", "contents.json");
      const raw = fs.readFileSync(filePath, "utf-8");
      const contents = JSON.parse(raw || "[]");
      const normalizeSlug = (s: string) => (s || "").toString().trim().replace(/\s+/g, "-").replace(/\/+$/, "").toLowerCase();
      const normSlug = normalizeSlug(slug);
      const content = contents.find((c: any) => normalizeSlug(c.slug) === normSlug && c.status === "PUBLISHED");
      if (!content) {
        return <div className="text-center py-20">콘텐츠를 찾을 수 없습니다.</div>;
      }

      // ⚠️ HTML_APP 타입이면 HTML 앱 렌더링으로 처리
      if (content.type === "HTML_APP") {
        let appUrl = "";
        if (content.assets && content.assets.length > 0) {
          const asset = content.assets[0];
          const assetId = typeof asset === "string" ? asset : asset.id;
          const candidates = [
            path.join(process.cwd(), 'public', 'uploads', assetId, 'index.html'),
            path.join(process.cwd(), 'public', 'uploads', assetId, 'index.htm'),
            path.join(process.cwd(), 'public', 'uploads', `${assetId}.html`),
          ];
          const found = candidates.find((p) => fs.existsSync(p));
          if (found) {
            const rel = path.relative(path.join(process.cwd(), 'public'), found).split(path.sep).join('/');
            appUrl = `/${rel}`;
          } else {
            appUrl = `/uploads/${assetId}/index.html`;
          }
        }
        if (!appUrl) {
          return <div className="text-center py-20">앱 파일을 찾을 수 없습니다.</div>;
        }
        return (
          <>
            <JsonLd data={WebAppJsonLd({ content })} />
            <SlotRenderer placement="DETAIL_TOP" context={{ pageType: "html_app" }} />
            <div className="max-w-7xl mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
              {content.description && <p className="text-gray-600 mb-6">{content.description}</p>}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <HtmlAppViewer cdnUrl={appUrl} title={content.title} />
              </div>
            </div>
            <SlotRenderer placement="DETAIL_MID" />
            <SlotRenderer placement="DETAIL_BOTTOM" />
          </>
        );
      }

      const tags = Array.isArray(content.tags) ? content.tags.map((t: any) => (typeof t === "string" ? t : t?.slug || t)).join(",") : "";
      const htmlBody = content.body || content.content || content.excerpt || "";
      return (
        <>
          <JsonLd data={ArticleJsonLd({ content })} />
          <SlotRenderer placement="DETAIL_TOP" context={{ pageType: "post", tags: tags.split(",") }} />
          <article className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            {content.description && <p className="text-gray-600 text-lg mb-6">{content.description}</p>}
            {htmlBody ? (
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlBody }} />
            ) : (
              <div className="text-gray-400 text-center py-12">본문이 없는 콘텐츠입니다. 관리자에서 내용을 입력해 주세요.</div>
            )}
          </article>
          <SlotRenderer placement="DETAIL_MID" />
          <SlotRenderer placement="DETAIL_BOTTOM" />
        </>
      );
    } catch (e) {
      console.error('PostPage fallback failed:', e);
      return <div className="text-center py-20">문제가 발생했습니다. 나중에 다시 시도해주세요.</div>;
    }
  }
}
