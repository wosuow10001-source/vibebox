// app/admin/content/[id]/page.tsx
"use client";

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CONTENT_TYPES = ['POST', 'HTML_APP', 'PROJECT', 'GAME', 'IMAGE', 'VIDEO', 'LINK'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditContentPage({ params: paramsPromise }: PageProps) {
  const router = useRouter();
  const { id: contentId } = use(paramsPromise);

  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [availableMenus, setAvailableMenus] = useState<Array<{ name: string; url: string }>>([]);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  console.log('📋 Component Props - contentId:', contentId);

  useEffect(() => {
    if (!contentId) {
      console.warn('⚠️ No contentId available');
      setError('콘텐츠 ID를 찾을 수 없습니다');
      setLoading(false);
      return;
    }

    console.log('📥 Fetching content with ID:', contentId);

    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/admin/content/${contentId}`);
        
        if (!res.ok) {
          throw new Error(`응답 오류: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('✅ Content loaded:', data);
        setFormData(data);
        setThumbnailPreview(data.coverImage || '');
        setSelectedMenus(data.menus || []); // 기존 메뉴 로드
        setError(null);
      } catch (error) {
        console.error('❌ Failed to fetch content:', error);
        setError(error instanceof Error ? error.message : '콘텐츠 로드 실패');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentId]);

  // 사이트 설정에서 메뉴 목록 가져오기
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch('/api/admin/site-settings');
        const settings = await res.json();
        if (settings.menu && Array.isArray(settings.menu)) {
          setAvailableMenus(settings.menu);
        }
      } catch (error) {
        console.error('Failed to fetch menus:', error);
      }
    };
    fetchMenus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contentId) {
      console.error('❌ No contentId available');
      alert('콘텐츠 ID를 찾을 수 없습니다');
      return;
    }

    try {
      // Parse tags: if it's a string, split by comma; if already an array, keep as is
      const tagsArray = typeof formData.tags === 'string' 
        ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : Array.isArray(formData.tags) 
          ? formData.tags.map((t: any) => typeof t === 'string' ? t : t.tag?.name || '')
          : [];

      console.log('📤 콘텐츠 저장 요청:', { 
        contentId, 
        title: formData.title,
        tagsCount: tagsArray.length 
      });

      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
          menus: selectedMenus, // 메뉴 배열 추가
        }),
      });

      console.log('📨 서버 응답 상태:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ 오류 응답:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const savedData = await response.json();
      console.log('✅ 저장 성공:', savedData);
      alert('저장되었습니다');
      router.push('/admin/content');
    } catch (error) {
      console.error('❌ 저장 실패:', error);
      alert('저장 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploadingThumbnail(true);
    try {
      // 썸네일 업로드
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'thumbnail');

      const uploadRes = await fetch('/api/admin/assets/upload-background', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!uploadRes.ok) {
        throw new Error('썸네일 업로드 실패');
      }

      const { url } = await uploadRes.json();

      // 썸네일 URL 저장
      setFormData((prev: any) => ({ ...prev, coverImage: url }));
      setThumbnailPreview(url);

      alert('✅ 썸네일이 업로드되었습니다!');
    } catch (error) {
      console.error('썸네일 업로드 실패:', error);
      alert('❌ 썸네일 업로드에 실패했습니다');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  if (loading) return <div className="admin-content">로딩 중...</div>;
  if (error) return <div className="admin-content"><div className="text-red-600">❌ 오류: {error}</div></div>;
  if (!formData) return <div className="admin-content">❌ 콘텐츠를 찾을 수 없습니다</div>;

  return (
    <div className="admin-content max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">콘텐츠 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 썸네일 업로드 섹션 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🖼️ 썸네일 이미지</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                썸네일 업로드 (선택)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                disabled={uploadingThumbnail}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {uploadingThumbnail && (
                <p className="text-sm text-blue-600 mt-2">업로드 중...</p>
              )}
            </div>

            {thumbnailPreview && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">미리보기:</p>
                <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={thumbnailPreview}
                    alt="썸네일 미리보기"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev: any) => ({ ...prev, coverImage: '' }));
                      setThumbnailPreview('');
                    }}
                    className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">
              💡 썸네일은 메인 페이지와 목록에서 표시됩니다. 권장 크기: 1200x630px
            </p>
          </div>
        </div>

        {/* 업로드된 파일 표시 */}
        {formData.assets && formData.assets.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📎 업로드된 파일</h2>
            <div className="space-y-2">
              {formData.assets.map((asset: any, idx: number) => {
                const assetId = typeof asset === 'string' ? asset : asset.id;
                const assetName = typeof asset === 'string' ? asset : (asset.originalName || asset.name || assetId);
                
                // 파일 URL 생성
                let fileUrl = '';
                if (typeof asset === 'object' && asset.cdnUrl) {
                  fileUrl = asset.cdnUrl;
                } else {
                  // DEV 모드: /uploads/[assetId]/ 경로
                  fileUrl = `/uploads/${assetId}/`;
                }

                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-medium text-gray-900">{assetName}</p>
                        <p className="text-xs text-gray-500">Asset ID: {assetId}</p>
                      </div>
                    </div>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                    >
                      보기
                    </a>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              💡 파일을 변경하려면 새 콘텐츠를 작성하거나 파일 업로드 페이지를 이용하세요.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="title" className="form-label">제목</label>
            <input
              id="title"
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug" className="form-label">슬러그</label>
            <input
              id="slug"
              type="text"
              name="slug"
              className="form-input"
              value={formData.slug}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">타입</label>
            <select id="type" name="type" className="form-input" value={formData.type} onChange={handleChange}>
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">상태</label>
            <select id="status" name="status" className="form-input" value={formData.status} onChange={handleChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="pinned"
                checked={formData.pinned || false}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, pinned: e.target.checked }))}
                className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
              />
              <span className="text-sm font-medium text-gray-700">
                📌 홈 페이지에 고정
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              고정된 콘텐츠는 홈 페이지 상단에 우선 표시됩니다.
            </p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">설명</label>
          <textarea
            id="description"
            name="description"
            className="form-input"
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="body" className="form-label">본문</label>
          <textarea
            id="body"
            name="body"
            className="form-input"
            rows={10}
            placeholder="본문을 입력하세요"
            value={formData.body || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags" className="form-label">태그 (쉼표로 구분)</label>
          <input
            id="tags"
            type="text"
            name="tags"
            className="form-input"
            placeholder="태그를 쉼표로 구분하여 입력하세요"
            value={
              Array.isArray(formData.tags)
                ? formData.tags.map((t: any) => (typeof t === 'string' ? t : t.tag?.name || '')).join(', ')
                : (formData.tags || '')
            }
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                tags: e.target.value,
              }))
            }
          />
        </div>

        {/* SEO 설정 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 SEO 설정</h2>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="seoTitle" className="form-label">SEO 제목</label>
              <input
                id="seoTitle"
                type="text"
                name="seoTitle"
                className="form-input"
                placeholder="검색 엔진에 표시될 제목"
                value={formData.seoTitle || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="seoDescription" className="form-label">SEO 설명</label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                className="form-input"
                rows={2}
                placeholder="검색 엔진에 표시될 설명"
                value={formData.seoDescription || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ogImage" className="form-label">OG 이미지 URL (선택)</label>
              <input
                id="ogImage"
                type="text"
                name="ogImage"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={formData.ogImage || ''}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                소셜 미디어 공유 시 표시될 이미지 (비워두면 썸네일 사용)
              </p>
            </div>
          </div>
        </div>

        {/* 메뉴 선택 섹션 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📁 메뉴 선택</h2>
          <p className="text-sm text-gray-600 mb-4">
            이 콘텐츠를 표시할 메뉴를 선택하세요. 여러 개 선택 가능합니다.
          </p>
          
          {availableMenus.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {availableMenus.map((menu) => (
                  <button
                    key={menu.name}
                    type="button"
                    onClick={() => {
                      if (selectedMenus.includes(menu.name)) {
                        setSelectedMenus(selectedMenus.filter(m => m !== menu.name));
                      } else {
                        setSelectedMenus([...selectedMenus, menu.name]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedMenus.includes(menu.name)
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
                    }`}
                  >
                    {selectedMenus.includes(menu.name) ? '✓ ' : ''}📁 {menu.name}
                  </button>
                ))}
              </div>
              
              {selectedMenus.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded border border-green-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">선택된 메뉴:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMenus.map((menu) => (
                      <span
                        key={menu}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        📁 {menu}
                        <button
                          type="button"
                          onClick={() => setSelectedMenus(selectedMenus.filter(m => m !== menu))}
                          className="hover:text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              사이트 설정에 메뉴가 없습니다. 먼저 사이트 설정에서 메뉴를 추가하세요.
            </p>
          )}
        </div>

        {/* 태그 섹션 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">#️⃣ 태그</h2>
          <p className="text-sm text-gray-600 mb-4">
            콘텐츠를 분류하기 위한 태그를 입력하세요. 쉼표로 구분합니다.
          </p>
          <input
            type="text"
            name="tags"
            className="form-input"
            placeholder="예: React, JavaScript, Tutorial"
            value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 태그는 검색과 분류에 사용됩니다. 메뉴와는 별개입니다.
          </p>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="form-button">
            저장
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="form-button-secondary"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
