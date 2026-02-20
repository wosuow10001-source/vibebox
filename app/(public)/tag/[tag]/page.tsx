// app/(public)/tag/[tag]/page.tsx
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { SlotRenderer } from "@/components/public/SlotRenderer";
import type { Metadata } from "next";

export async function generateStaticParams() {
  try {
    const tags = await prisma.tag.findMany({
      select: { slug: true },
    });
    return tags.map((t) => ({ tag: t.slug }));
  } catch (error) {
    console.warn('generateStaticParams (tag) DB error, returning empty array', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag} - 태그 콘텐츠`,
    description: `#${tag} 태그에 해당하는 모든 콘텐츠`,
    robots: { index: true, follow: true },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;

  // DEV mode: file fallback
  if (process.env.DEV_LOGIN === "true") {
    // 1. 파일에서 콘텐츠 읽기
    const filePath = path.join(process.cwd(), "data", "contents.json");
    let contents = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      contents = JSON.parse(raw);
    } catch (e) {
      return <div className="text-center py-20">콘텐츠를 찾을 수 없습니다.</div>;
    }
    // 2. 태그로 필터링 (tags 배열에 tag가 포함된 것)
    const filtered = contents.filter((c: any) => {
      const isPublished = c.status === "PUBLISHED";
      const hasTags = Array.isArray(c.tags);
      const hasTag = hasTags && c.tags.includes(tag);
      
      console.log(`콘텐츠: ${c.title}, 상태: ${c.status}, 태그: ${c.tags}, 매칭: ${hasTag}`);
      
      return isPublished && hasTag;
    });
    
    console.log(`태그 '${tag}'로 필터링된 콘텐츠: ${filtered.length}개`);
    
    return (
      <>
        <SlotRenderer placement="HOME_TOP" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">#{tag}</h1>
          <p className="text-gray-600 mb-6">{filtered.length}개의 콘텐츠</p>
          
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">이 태그에 해당하는 콘텐츠가 없습니다.</p>
              <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                메인 페이지로 돌아가기
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c: any) => (
                <ContentCard key={c.id} content={c} />
              ))}
            </div>
          )}
        </div>
        <SlotRenderer placement="HOME_FOOTER" />
      </>
    );
  }

  try {
    const tagData = await prisma.tag.findUnique({
      where: { slug: tag },
      include: {
        contents: {
          where: { content: { status: "PUBLISHED" } },
          include: { content: { include: { tags: { include: { tag: true } } } } },
        },
      },
    });

    if (!tagData) {
      return <div className="text-center py-20">태그를 찾을 수 없습니다.</div>;
    }

    const contents = tagData.contents.map((ct) => ct.content);

    return (
      <>
        <SlotRenderer placement="HOME_TOP" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">#{tagData.name}</h1>
          <p className="text-gray-600 mb-6">{contents.length}개의 콘텐츠</p>
          
          {contents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">이 태그에 해당하는 콘텐츠가 없습니다.</p>
              <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                메인 페이지로 돌아가기
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((c: any) => (
                <ContentCard key={c.id} content={c} />
              ))}
            </div>
          )}
        </div>
        <SlotRenderer placement="HOME_FOOTER" />
      </>
    );
  } catch (error) {
    console.error('TagPage DB error:', error);
    return <div className="text-center py-20">문제가 발생했습니다. 나중에 다시 시도해주세요.</div>;
  }
}


// ContentCard 컴포넌트
function ContentCard({ content }: { content: any }) {
  function normalizeSlug(s: string) {
    return (s || "").toString().trim().replace(/\s+/g, "-").replace(/\/+$/, "").toLowerCase();
  }
  const normSlug = normalizeSlug(content.slug);
  
  // VIDEO, IMAGE, HTML_APP은 /a/ (상세 페이지)로 / POST는 /p/ (글 페이지)로
  const href =
    !content.type || content.type === 'POST'
      ? `/p/${normSlug}`
      : `/a/${normSlug}`;

  // 썸네일 이미지 결정 (우선순위: coverImage > asset 기반)
  let thumbUrl = content.coverImage;
  let isVideo = false;
  let videoUrl = '';
  
  if (!thumbUrl && content.type === 'IMAGE' && content.assets?.length > 0) {
    const assetId = typeof content.assets[0] === 'string' ? content.assets[0] : content.assets[0]?.id;
    if (assetId) {
      thumbUrl = `/uploads/${assetId}/index.png`;
    }
  } else if (!thumbUrl && content.type === 'VIDEO' && content.assets?.length > 0) {
    const assetId = typeof content.assets[0] === 'string' ? content.assets[0] : content.assets[0]?.id;
    if (assetId) {
      videoUrl = `/uploads/${assetId}/index.mp4`;
      isVideo = true;
    }
  }

  return (
    <Link
      href={href}
      className="group block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-all"
    >
      <div className="aspect-video overflow-hidden bg-gray-200 flex items-center justify-center relative">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : isVideo && videoUrl ? (
          <div className="relative w-full h-full bg-black">
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              preload="metadata"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white bg-black/30 group-hover:bg-black/40 transition-colors">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-sm font-semibold">영상 재생</span>
            </div>
          </div>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg group-hover:text-blue-600 transition line-clamp-2">
          {content.title}
        </h3>
        {content.description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {content.description}
          </p>
        )}
        <div className="flex gap-2 mt-3 flex-wrap">
          {Array.isArray(content.tags) && content.tags.length > 0 && content.tags.slice(0, 3).map((item: any) => {
            // tags가 객체 배열 {tag: {name, slug}} 형식인 경우
            if (item && typeof item === 'object' && item.tag) {
              return (
                <Link
                  key={item.tag.slug}
                  href={`/tag/${item.tag.slug}`}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-blue-100 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  #{item.tag.name}
                </Link>
              );
            }
            // tags가 문자열 배열인 경우
            if (typeof item === 'string') {
              return (
                <span
                  key={item}
                  className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                >
                  #{item}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
    </Link>
  );
}
