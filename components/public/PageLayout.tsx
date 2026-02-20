'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SiteSettings {
  siteTitle?: string;
  logoUrl?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  colorBg?: string;
  colorText?: string;
  bgType?: string;
  bgValue?: string;
  donateEnabled?: boolean;
  donateLabel?: string;
  donateColor?: string;
  donateItems?: Array<{
    type: 'link' | 'account' | 'crypto' | 'qr';
    label: string;
    value: string;
  }>;
  menu?: Array<{ name: string; url: string }>;
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);

  useEffect(() => {
    // 사이트 설정 로드
    fetch('/api/admin/site-settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  const s = settings || {};

  // 배경 스타일 결정
  const getBackgroundStyle = () => {
    if (s.bgType === 'image' && s.bgValue) {
      return {
        backgroundImage: `url(${s.bgValue})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    } else if (s.bgType === 'gradient' && s.bgValue) {
      return {
        background: s.bgValue,
      };
    } else {
      return {
        backgroundColor: s.colorBg || '#FFFFFF',
      };
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        ...getBackgroundStyle(),
        color: s.colorText || '#1F2937',
      } as React.CSSProperties}
    >
      {/* 헤더 */}
      <header
        className="shadow-md"
        style={{ backgroundColor: s.colorPrimary || '#3B82F6' } as React.CSSProperties}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="flex items-center gap-3">
              {s.logoUrl && (
                <img src={s.logoUrl} alt="로고" className="h-8 w-auto" />
              )}
              <h1 className="text-2xl font-bold text-white">
                {s.siteTitle || 'Vibebox'}
              </h1>
            </Link>

            {/* 후원 버튼 */}
            {s.donateEnabled && s.donateItems && s.donateItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDonateModal(true)}
                className="px-4 py-2 rounded-lg font-semibold text-white transition hover:opacity-90 shadow-sm"
                style={{ backgroundColor: s.donateColor || '#FF6B6B' } as React.CSSProperties}
              >
                {s.donateLabel || '☕ 후원'}
              </button>
            )}
          </div>

          {/* 메뉴 */}
          {s.menu && s.menu.length > 0 && (
            <nav className="flex gap-2 flex-wrap">
              {s.menu.map((item) => (
                <Link
                  key={item.name}
                  href={`/menu/${encodeURIComponent(item.name)}`}
                  className="px-4 py-2 text-white hover:bg-white/20 rounded-lg transition"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main>{children}</main>

      {/* 후원 정보 모달 */}
      {showDonateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDonateModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">☕ 후원하기</h3>
              <button
                type="button"
                onClick={() => setShowDonateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {s.donateItems?.map((item, idx) => {
                if (item.type === 'link') {
                  return (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🔗 {item.label}
                      </label>
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-center font-medium"
                      >
                        {item.value}
                      </a>
                    </div>
                  );
                } else if (item.type === 'account') {
                  return (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        💳 {item.label}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.value}
                          readOnly
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.value);
                            alert('✅ 복사되었습니다!');
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                          복사
                        </button>
                      </div>
                    </div>
                  );
                } else if (item.type === 'crypto') {
                  return (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🪙 {item.label}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.value}
                          readOnly
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.value);
                            alert('✅ 복사되었습니다!');
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                          복사
                        </button>
                      </div>
                    </div>
                  );
                } else if (item.type === 'qr') {
                  return (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📱 {item.label}
                      </label>
                      <div className="flex justify-center">
                        <img
                          src={item.value}
                          alt={item.label}
                          className="w-48 h-48 object-contain border-2 border-gray-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 text-center">
                  후원해주셔서 감사합니다! 💝
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <footer
        className="mt-16 py-8 text-center"
        style={{
          borderTop: `1px solid ${s.colorPrimary || '#3B82F6'}`,
        } as React.CSSProperties}
      >
        <p className="text-gray-600 text-sm">
          © 2024 {s.siteTitle || 'Vibebox'}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
