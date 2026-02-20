'use client';

import Link from 'next/link';
import './SiteRenderer.css';

interface SiteSettings {
  colorPrimary?: string;
  latestPostBtnColor?: string; // 최신 게시글 보기 버튼 색상
  sections?: Array<{ title: string; description?: string; icon?: string }>;
  buttons?: Array<{ text: string; url: string; color?: string }>;
}

export function SiteRenderer({
  settings,
  contents,
}: {
  settings: SiteSettings | null;
  contents: any[];
}) {
  const s = settings || ({} as SiteSettings);

  // 고정된 콘텐츠와 일반 콘텐츠 분리
  const pinnedContents = contents.filter(c => c.pinned);
  const regularContents = contents.filter(c => !c.pinned);

  return (
    <div className="site-container">
      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* 추가 버튼들 */}
        {s.buttons && s.buttons.length > 0 && (
          <div className="mb-12 flex gap-3 flex-wrap">
            {s.buttons.map((btn, idx) => (
              <a
                key={idx}
                href={btn.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg font-semibold text-white transition hover:opacity-90 shadow-md site-button"
                style={{ backgroundColor: btn.color || '#3B82F6' }}
              >
                {btn.text}
              </a>
            ))}
          </div>
        )}

        {/* 고정된 콘텐츠 섹션 */}
        {pinnedContents.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl">📌</span>
              <h2 className="text-3xl font-bold">고정된 콘텐츠</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedContents.map((c) => (
                <ContentCard key={c.id} content={c} isPinned={true} />
              ))}
            </div>
          </section>
        )}

        {/* 섹션 */}
        {s.sections && s.sections.length > 0 ? (
          <div className="space-y-16">
            {s.sections.map((section, idx) => (
              <section key={idx} className="space-y-6">
                <div className="text-center mb-8">
                  {section.icon && <div className="text-5xl mb-3">{section.icon}</div>}
                  <h2 className="text-4xl font-bold">{section.title}</h2>
                  {section.description && (
                    <p className="text-gray-600 mt-3 text-lg">{section.description}</p>
                  )}
                </div>
                {regularContents.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularContents.slice(0, 6).map((c) => (
                      <ContentCard key={c.id} content={c} isPinned={false} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          // 기본 섹션 (설정이 없을 때)
          <>
            {regularContents.length > 0 ? (
              <section>
                <h2 className="text-3xl font-bold mb-6">최신 콘텐츠</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularContents.map((c) => (
                    <ContentCard key={c.id} content={c} isPinned={false} />
                  ))}
                </div>
              </section>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-3xl font-bold mb-3">Vibebox에 오신 것을 환영합니다!</h2>
                <p className="text-gray-600 text-lg mb-8">
                  현재 표시할 공개 콘텐츠가 없습니다. 최신 게시글을 확인해보세요.
                </p>
                <Link
                  href="/"
                  className="inline-block px-8 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition"
                  style={{ backgroundColor: s.latestPostBtnColor || s.colorPrimary || '#3B82F6' } as React.CSSProperties}
                >
                  최신 게시글 보기
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ContentCard({ content, isPinned }: { content: any; isPinned?: boolean }) {
  // type이 없으면 POST로 간주 (업로드 콘텐츠 호환)
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
  let thumbUrl = content.coverImage; // 업로드한 썸네일 우선
  let isVideo = false;
  let videoUrl = '';
  
  if (!thumbUrl && content.type === 'IMAGE' && content.assets?.length > 0) {
    const assetId = typeof content.assets[0] === 'string' ? content.assets[0] : content.assets[0]?.id;
    if (assetId) {
      thumbUrl = `/uploads/${assetId}/index.png`;
    }
  } else if (!thumbUrl && content.type === 'VIDEO' && content.assets?.length > 0) {
    // VIDEO는 video 태그로 썸네일 표시
    const assetId = typeof content.assets[0] === 'string' ? content.assets[0] : content.assets[0]?.id;
    if (assetId) {
      videoUrl = `/uploads/${assetId}/index.mp4`;
      isVideo = true;
    }
  }

  return (
    <a
      href={href}
      className="group block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-all"
    >
      <div className="aspect-video overflow-hidden bg-gray-200 flex items-center justify-center relative">
        {isPinned && (
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
            📌 고정
          </div>
        )}
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
    </a>
  );
}
