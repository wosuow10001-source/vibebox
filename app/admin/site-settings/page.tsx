// app/admin/site-settings/page.tsx
'use client';

import { useEffect, useState } from 'react';

const DEFAULT_SETTINGS = {
  siteTitle: 'Vibebox',
  logoUrl: '',
  colorPrimary: '#3B82F6',
  colorSecondary: '#10B981',
  colorBg: '#FFFFFF',
  colorText: '#1F2937',
  donateEnabled: true,
  donateLabel: '☕ 커피 한잔 후원하기',
  donateColor: '#FF6B6B',
  donateItems: [], // 후원 정보 배열
  latestPostBtnColor: '#3B82F6', // 최신 게시글 보기 버튼 색상
  menu: [
    { name: '홈', url: '/' },
    { name: '블로그', url: '/tag/blog' },
    { name: '포트폴리오', url: '/tag/portfolio' },
  ],
  buttons: [
    { text: '구독하기', url: 'https://example.com/subscribe', color: '#3B82F6' },
  ],
  sections: [
    { title: '환영합니다', description: 'Vibebox에 오신 것을 환영합니다!', icon: '👋' },
  ],
};

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);
  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgPreview, setBgPreview] = useState<string>('');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/site-settings');
        const data = await res.json();
        
        // 기존 단일 필드를 배열로 마이그레이션
        if (data && !data.donateItems) {
          data.donateItems = [];
          if (data.donateUrl) {
            data.donateItems.push({ type: 'link', label: '후원 링크', value: data.donateUrl });
          }
          if (data.donateAccount) {
            data.donateItems.push({ type: 'account', label: '계좌번호', value: data.donateAccount });
          }
          if (data.donateCrypto) {
            data.donateItems.push({ type: 'crypto', label: '암호화폐 주소', value: data.donateCrypto });
          }
          if (data.donateQrImage) {
            data.donateItems.push({ type: 'qr', label: 'QR 코드', value: data.donateQrImage });
          }
        }
        
        setSettings(data || DEFAULT_SETTINGS);
        // 배경 이미지 미리보기 설정
        if (data?.bgType === 'image' && data?.bgValue) {
          setBgPreview(data.bgValue);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Save failed');
      alert('✅ 설정이 저장되었습니다!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('❌ 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBg(true);
    try {
      // 배경 이미지는 간단하게 직접 업로드 (presign 없이)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'background'); // 배경 이미지 표시

      const uploadRes = await fetch('/api/admin/assets/upload-background', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('배경 이미지 업로드 실패');
      }

      const { url } = await uploadRes.json();

      // 설정에 반영
      setSettings((prev: any) => ({
        ...prev,
        bgType: 'image',
        bgValue: url,
      }));
      setBgPreview(url);

      alert('✅ 배경 이미지가 업로드되었습니다!');
    } catch (error) {
      console.error('배경 이미지 업로드 실패:', error);
      alert('❌ 배경 이미지 업로드에 실패했습니다');
    } finally {
      setUploadingBg(false);
    }
  };

  const handleQrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'qr');

      const uploadRes = await fetch('/api/admin/assets/upload-background', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('QR 이미지 업로드 실패');
      }

      const { url } = await uploadRes.json();

      // 해당 아이템의 value 업데이트
      const newItems = [...(settings.donateItems || [])];
      newItems[itemIndex].value = url;
      setSettings((prev: any) => ({ ...prev, donateItems: newItems }));

      alert('✅ QR 이미지가 업로드되었습니다!');
    } catch (error) {
      console.error('QR 이미지 업로드 실패:', error);
      alert('❌ QR 이미지 업로드에 실패했습니다');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">⚙️ 사이트 설정</h1>

      <div className="space-y-8">
        {/* 기본 정보 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🏠 기본 정보
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사이트 제목
              </label>
              <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="사이트 제목을 입력하세요"
                  value={settings.siteTitle}
                  onChange={(e) =>
                    setSettings((prev: any) => ({ ...prev, siteTitle: e.target.value }))
                  }
                />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                로고 URL
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={settings.logoUrl || ''}
                placeholder="https://example.com/logo.png"
                onChange={(e) =>
                  setSettings((prev: any) => ({ ...prev, logoUrl: e.target.value }))
                }
              />
            </div>
          </div>
        </section>

        {/* 테마 색상 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🎨 테마 색상
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'colorPrimary', label: 'Primary Color (주요 색상)', icon: '🔵' },
              { key: 'colorSecondary', label: 'Secondary Color (보조 색상)', icon: '🟢' },
              { key: 'colorBg', label: 'Background Color (배경)', icon: '⬜' },
              { key: 'colorText', label: 'Text Color (텍스트)', icon: '🔤' },
            ].map(({ key, label, icon }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {icon} {label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-12 rounded border border-gray-300"
                    value={settings[key]}
                    aria-label={label}
                    onChange={(e) =>
                      setSettings((prev: any) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={label}
                    value={settings[key]}
                    aria-label={label}
                    title={label}
                    onChange={(e) =>
                      setSettings((prev: any) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 배경 꾸미기 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🖼️ 배경 꾸미기
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                배경 타입
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.bgType || 'color'}
                onChange={(e) =>
                  setSettings((prev: any) => ({ ...prev, bgType: e.target.value }))
                }
              >
                <option value="color">단색 배경</option>
                <option value="gradient">그라데이션</option>
                <option value="image">이미지</option>
              </select>
            </div>

            {settings.bgType === 'color' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배경 색상 (위의 "Background Color" 사용)
                </label>
                <p className="text-sm text-gray-500">
                  위의 "테마 색상" 섹션에서 "Background Color"를 변경하세요.
                </p>
              </div>
            )}

            {settings.bgType === 'gradient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  그라데이션 CSS
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="linear-gradient(to right, #667eea, #764ba2)"
                  value={settings.bgValue || ''}
                  onChange={(e) =>
                    setSettings((prev: any) => ({ ...prev, bgValue: e.target.value }))
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  예: linear-gradient(to right, #667eea, #764ba2)
                </p>
              </div>
            )}

            {settings.bgType === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    배경 이미지 업로드
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageUpload}
                    disabled={uploadingBg}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-50 file:text-purple-700
                      hover:file:bg-purple-100
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploadingBg && (
                    <p className="text-sm text-blue-600 mt-2">업로드 중...</p>
                  )}
                </div>

                {bgPreview && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">미리보기:</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={bgPreview}
                        alt="배경 이미지 미리보기"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    또는 이미지 URL 직접 입력
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/background.jpg"
                    value={settings.bgValue || ''}
                    onChange={(e) => {
                      setSettings((prev: any) => ({ ...prev, bgValue: e.target.value }));
                      setBgPreview(e.target.value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 메뉴 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            📋 메뉴
          </h2>
          <div className="space-y-4">
            {(settings.menu || []).map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    메뉴명
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="메뉴명을 입력하세요"
                    value={item.name}
                    onChange={(e) => {
                      const newMenu = [...settings.menu];
                      newMenu[idx].name = e.target.value;
                      setSettings((prev: any) => ({ ...prev, menu: newMenu }));
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="URL을 입력하세요"
                    value={item.url}
                    onChange={(e) => {
                      const newMenu = [...settings.menu];
                      newMenu[idx].url = e.target.value;
                      setSettings((prev: any) => ({ ...prev, menu: newMenu }));
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    const newMenu = settings.menu.filter((_: any, i: number) => i !== idx);
                    setSettings((prev: any) => ({ ...prev, menu: newMenu }));
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newMenu = [...(settings.menu || []), { name: '새 항목', url: '/' }];
                setSettings((prev: any) => ({ ...prev, menu: newMenu }));
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              + 메뉴 추가
            </button>
          </div>
        </section>

        {/* 버튼 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🔘 버튼
          </h2>
          <div className="space-y-4">
            {(settings.buttons || []).map((btn: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-end border-b pb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    버튼 텍스트
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={btn.text}
                    onChange={(e) => {
                      const newBtns = [...settings.buttons];
                      newBtns[idx].text = e.target.value;
                      setSettings((prev: any) => ({ ...prev, buttons: newBtns }));
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    링크 URL
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={btn.url}
                    onChange={(e) => {
                      const newBtns = [...settings.buttons];
                      newBtns[idx].url = e.target.value;
                      setSettings((prev: any) => ({ ...prev, buttons: newBtns }));
                    }}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    색상
                  </label>
                  <input
                    type="color"
                    className="w-full h-10 rounded border"
                    value={btn.color || '#3B82F6'}
                    onChange={(e) => {
                      const newBtns = [...settings.buttons];
                      newBtns[idx].color = e.target.value;
                      setSettings((prev: any) => ({ ...prev, buttons: newBtns }));
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    const newBtns = settings.buttons.filter((_: any, i: number) => i !== idx);
                    setSettings((prev: any) => ({ ...prev, buttons: newBtns }));
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newBtns = [
                  ...(settings.buttons || []),
                  { text: '새 버튼', url: 'https://example.com', color: '#3B82F6' },
                ];
                setSettings((prev: any) => ({ ...prev, buttons: newBtns }));
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              + 버튼 추가
            </button>
          </div>
        </section>

        {/* 후원 버튼 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🔘 최신 게시글 보기 버튼
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                버튼 배경 색상
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="h-10 w-16 rounded border border-gray-300"
                  value={settings.latestPostBtnColor || '#3B82F6'}
                  onChange={(e) =>
                    setSettings((prev: any) => ({ ...prev, latestPostBtnColor: e.target.value }))
                  }
                />
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="#3B82F6"
                  value={settings.latestPostBtnColor || '#3B82F6'}
                  onChange={(e) =>
                    setSettings((prev: any) => ({ ...prev, latestPostBtnColor: e.target.value }))
                  }
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 콘텐츠가 없을 때 표시되는 "최신 게시글 보기" 버튼의 배경 색상입니다.
              </p>
            </div>
          </div>
        </section>

        {/* 후원 버튼 */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            ☕ 커피 후원 버튼
          </h2>
          <div className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.donateEnabled}
                onChange={(e) =>
                  setSettings((prev: any) => ({
                    ...prev,
                    donateEnabled: e.target.checked,
                  }))
                }
                className="w-5 h-5"
              />
              <span className="text-gray-700 font-medium">후원 버튼 활성화</span>
            </label>

            {settings.donateEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    버튼 텍스트
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={settings.donateLabel}
                    onChange={(e) =>
                      setSettings((prev: any) => ({ ...prev, donateLabel: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    링크 URL (Ko-Fi, PayPal 등)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={settings.donateUrl}
                    onChange={(e) =>
                      setSettings((prev: any) => ({ ...prev, donateUrl: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    버튼 색상
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="h-10 w-16 rounded border border-gray-300"
                      value={settings.donateColor}
                      onChange={(e) =>
                        setSettings((prev: any) => ({ ...prev, donateColor: e.target.value }))
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      value={settings.donateColor}
                      onChange={(e) =>
                        setSettings((prev: any) => ({ ...prev, donateColor: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* 후원 정보 목록 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      💝 후원 정보 목록
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = [
                          ...(settings.donateItems || []),
                          { type: 'link', label: '새 항목', value: '' },
                        ];
                        setSettings((prev: any) => ({ ...prev, donateItems: newItems }));
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      + 항목 추가
                    </button>
                  </div>

                  {(settings.donateItems || []).map((item: any, idx: number) => (
                    <div key={idx} className="border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50">
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            타입
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            value={item.type}
                            onChange={(e) => {
                              const newItems = [...settings.donateItems];
                              newItems[idx].type = e.target.value;
                              // 타입 변경 시 value 초기화
                              if (e.target.value === 'qr') {
                                newItems[idx].value = '';
                              }
                              setSettings((prev: any) => ({ ...prev, donateItems: newItems }));
                            }}
                          >
                            <option value="link">🔗 링크</option>
                            <option value="account">💳 계좌번호</option>
                            <option value="crypto">🪙 암호화폐 주소</option>
                            <option value="qr">📱 QR 코드</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            라벨
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="예: 카카오페이, 토스, 비트코인"
                            value={item.label}
                            onChange={(e) => {
                              const newItems = [...settings.donateItems];
                              newItems[idx].label = e.target.value;
                              setSettings((prev: any) => ({ ...prev, donateItems: newItems }));
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = settings.donateItems.filter((_: any, i: number) => i !== idx);
                            setSettings((prev: any) => ({ ...prev, donateItems: newItems }));
                          }}
                          className="mt-6 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                        >
                          삭제
                        </button>
                      </div>

                      {/* 값 입력 (타입별로 다름) */}
                      {item.type === 'qr' ? (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            QR 이미지 업로드
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleQrImageUpload(e, idx)}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-purple-50 file:text-purple-700
                              hover:file:bg-purple-100"
                          />
                          {item.value && (
                            <div className="mt-2">
                              <img
                                src={item.value}
                                alt="QR 코드"
                                className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg bg-white"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {item.type === 'link' && '링크 URL'}
                            {item.type === 'account' && '계좌번호'}
                            {item.type === 'crypto' && '암호화폐 주소'}
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder={
                              item.type === 'link'
                                ? 'https://ko-fi.com/username'
                                : item.type === 'account'
                                ? '카카오뱅크 3333-01-1234567 (홍길동)'
                                : '0x1234...abcd 또는 bc1q...xyz'
                            }
                            value={item.value}
                            onChange={(e) => {
                              const newItems = [...settings.donateItems];
                              newItems[idx].value = e.target.value;
                              setSettings((prev: any) => ({ ...prev, donateItems: newItems }));
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {(!settings.donateItems || settings.donateItems.length === 0) && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      후원 정보가 없습니다. "+ 항목 추가" 버튼을 클릭하여 추가하세요.
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> 여러 개의 후원 방법을 추가할 수 있습니다. 링크, 계좌번호, 암호화폐 주소, QR 코드 등을 자유롭게 조합하세요.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 저장 버튼 */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? '저장 중...' : '💾 모든 설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
