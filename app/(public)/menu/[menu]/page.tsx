// app/(public)/menu/[menu]/page.tsx
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface Content {
  id: string;
  title: string;
  slug: string;
  type: string;
  description?: string;
  excerpt?: string;
  coverImage?: string;
  assets?: string[];
  menus?: string[];
  tags?: string[];
  publishedAt?: string;
}

async function getContentsByMenu(menuName: string): Promise<Content[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'contents.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const allContents: Content[] = JSON.parse(fileContents);
    
    // 해당 메뉴에 속한 콘텐츠만 필터링
    return allContents.filter(content => 
      content.menus?.includes(menuName)
    );
  } catch (error) {
    console.error('Failed to load contents:', error);
    return [];
  }
}

export default async function MenuPage({
  params,
}: {
  params: { menu: string };
}) {
  const menuName = decodeURIComponent(params.menu);
  const contents = await getContentsByMenu(menuName);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        📁 {menuName}
      </h1>

      {contents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg mb-4">
            이 메뉴에 콘텐츠가 없습니다.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            홈으로 돌아가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => {
            const thumbnail = content.coverImage || 
              (content.assets && content.assets.length > 0 
                ? `/uploads/${content.assets[0]}/index.jpg` 
                : null);

            return (
              <Link
                key={content.id}
                href={`/a/${content.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
              >
                {thumbnail && (
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={thumbnail}
                      alt={content.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {content.title}
                  </h2>
                  {content.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {content.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {content.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
