'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SiteSettings {
  siteTitle?: string;
  logoUrl?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  colorBg?: string;
  colorText?: string;
  bgType?: string;
  bgValue?: string;
}

export function AdminPageLayout({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const pathname = usePathname();

  // 로그인 페이지에서는 사이트 설정 로드하지 않음
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    // 사이트 설정 로드
    fetch('/api/admin/site-settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Failed to load settings:', err));
  }, [isLoginPage]);

  const s = settings || {};

  // 배경 스타일 결정 (관리자 페이지는 약간 투명하게)
  const getBackgroundStyle = () => {
    if (s.bgType === 'image' && s.bgValue) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(${s.bgValue})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    } else if (s.bgType === 'gradient' && s.bgValue) {
      return {
        background: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), ${s.bgValue}`,
      };
    } else {
      return {
        backgroundColor: s.colorBg || '#F3F4F6',
      };
    }
  };

  const menuItems = [
    { name: '대시보드', path: '/admin', icon: '📊' },
    { name: '콘텐츠 관리', path: '/admin/content', icon: '📝' },
    { name: '새 콘텐츠', path: '/admin/content/new', icon: '➕' },
    { name: '파일 업로드', path: '/admin/upload-direct', icon: '📤' },
    { name: '에셋 관리', path: '/admin/assets', icon: '🖼️' },
    { name: '수익화', path: '/admin/monetization', icon: '💰' },
    { name: '앱 관리', path: '/admin/apps', icon: '🧩' },
    { name: '사이트 설정', path: '/admin/site-settings', icon: '⚙️' },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        ...getBackgroundStyle(),
        color: s.colorText || '#1F2937',
      } as React.CSSProperties}
    >
      {/* 관리자 헤더 */}
      <header
        className="shadow-md border-b-2"
        style={{ 
          backgroundColor: s.colorPrimary || '#3B82F6',
          borderBottomColor: s.colorSecondary || '#10B981',
        } as React.CSSProperties}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="flex items-center gap-3">
              {s.logoUrl && (
                <img src={s.logoUrl} alt="로고" className="h-8 w-auto" />
              )}
              <h1 className="text-2xl font-bold text-white">
                {s.siteTitle || 'Vibebox'} <span className="text-sm opacity-75">관리자</span>
              </h1>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
              >
                🌐 사이트 보기
              </Link>
              <Link
                href="/admin/login"
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                🚪 로그아웃
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 관리자 네비게이션 */}
      <nav 
        className="shadow-sm"
        style={{ backgroundColor: s.colorSecondary || '#10B981' } as React.CSSProperties}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-gray-900 font-semibold shadow-sm'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto">{children}</main>

      {/* 푸터 */}
      <footer
        className="mt-16 py-6 text-center border-t"
        style={{
          borderTopColor: s.colorPrimary || '#3B82F6',
        } as React.CSSProperties}
      >
        <p className="text-gray-600 text-sm">
          © 2024 {s.siteTitle || 'Vibebox'} Admin Panel
        </p>
      </footer>
    </div>
  );
}
