// app/admin/content/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CONTENT_TYPES = ['POST', 'HTML_APP', 'PROJECT', 'GAME', 'IMAGE', 'VIDEO', 'LINK'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export default function NewContentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    body: '',
    type: 'POST',
    status: 'DRAFT',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    coverImage: '', // 썸네일 이미지 URL
    pinned: false, // 홈 고정 여부
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploadedAssets, setUploadedAssets] = useState<Array<{ assetId: string; cdnUrl: string; name: string }>>([]);
  const [availableMenus, setAvailableMenus] = useState<Array<{ name: string; url: string }>>([]);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const assetIdsParam = params.get('assetIds') || params.get('assetId');
    const assetUrlsParam = params.get('assetUrls') || params.get('assetUrl');
    const slugParam = params.get('slug');
    const titleParam = params.get('title');
    const typeParam = params.get('type');
    
    if (!assetIdsParam) return;
    const ids = assetIdsParam.split(',').map((s) => s.trim()).filter(Boolean);
    const urls = assetUrlsParam ? assetUrlsParam.split(',').map((u) => decodeURIComponent(u)) : [];
    const assets = ids.map((id, idx) => ({ assetId: id, cdnUrl: urls[idx] || '', name: '' }));
    if (assets.length > 0) setUploadedAssets((prev) => [...prev, ...assets]);
    
    // URL에서 slug, title, type 파라미터 받기
    if (slugParam) {
      setFormData((prev) => ({ ...prev, slug: decodeURIComponent(slugParam) }));
    }
    if (titleParam) {
      setFormData((prev) => ({ ...prev, title: decodeURIComponent(titleParam) }));
    }
    if (typeParam && CONTENT_TYPES.includes(typeParam)) {
      setFormData((prev) => ({ ...prev, type: typeParam }));
    }
  }, []);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 태그는 별도로 유지
      const tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags, // 태그 배열
          menus: selectedMenus, // 메뉴 배열 (별도)
          assetIds: uploadedAssets.map((a) => a.assetId),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert('콘텐츠가 생성되었습니다');
        router.push(`/admin/content/${data.id}`);
        router.refresh();
      } else {
        throw new Error('생성 실패');
      }
    } catch (error) {
      console.error('Create failed:', error);
      alert('콘텐츠 생성 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: Array<{ assetId: string; cdnUrl: string; name: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const presignRes = await fetch('/api/admin/assets/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            category: formData.type.toLowerCase(),
            contentType: formData.type,
          }),
        });

        if (!presignRes.ok) throw new Error('Presign failed');
        const { uploadUrl, cdnUrl, assetId } = await presignRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        if (!uploadRes.ok) throw new Error('Upload failed');

        uploaded.push({ assetId, cdnUrl, name: file.name });
        setUploadedAssets((prev) => [...prev, { assetId, cdnUrl, name: file.name }]);
      } catch (err) {
        console.error('File upload failed', err);
        alert(`업로드 실패: ${file.name}`);
      }
    }

    setUploading(false);
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
      // 썸네일 업로드 (배경 이미지 API 재사용)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'thumbnail');

      const uploadRes = await fetch('/api/admin/assets/upload-background', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('썸네일 업로드 실패');
      }

      const { url } = await uploadRes.json();

      // 썸네일 URL 저장
      setFormData((prev) => ({ ...prev, coverImage: url }));
      setThumbnailPreview(url);

      alert('✅ 썸네일이 업로드되었습니다!');
    } catch (error) {
      console.error('썸네일 업로드 실패:', error);
      alert('❌ 썸네일 업로드에 실패했습니다');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  return (
    <div className="admin-content max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">새 콘텐츠 작성</h1>

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
                      setFormData((prev) => ({ ...prev, coverImage: '' }));
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">파일 업로드</label>
            <input
              type="file"
              multiple
              className="mt-1"
              title="파일 업로드"
              aria-label="파일 업로드"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {uploading && <p className="text-sm text-gray-500">업로드 중...</p>}
            {uploadedAssets.length > 0 && (
              <ul className="mt-2 text-sm">
                {uploadedAssets.map((a) => (
                  <li key={a.assetId} className="truncate">
                    {a.name} — <a href={a.cdnUrl} target="_blank" rel="noreferrer" className="text-blue-600">보기</a>
                  </li>
                ))}
              </ul>
            )}
            <label className="form-label">제목 *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="콘텐츠 제목"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">슬러그 (URL) *</label>
            <input
              type="text"
              name="slug"
              className="form-input"
              value={formData.slug}
              onChange={handleChange}
              placeholder="my-first-post"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">타입</label>
            <select
              name="type"
              className="form-input"
              title="타입"
              value={formData.type}
              onChange={handleChange}
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">상태</label>
            <select
              name="status"
              className="form-input"
              title="상태"
              value={formData.status}
              onChange={handleChange}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'PUBLISHED' ? '발행' : s === 'DRAFT' ? '임시저장' : '보관'}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, pinned: e.target.checked }))}
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
          <label className="form-label">설명</label>
          <textarea
            name="description"
            className="form-input"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="콘텐츠 설명"
          />
        </div>

        <div className="form-group">
          <label className="form-label">콘텐츠 본문</label>
          <textarea
            name="body"
            className="form-input"
            rows={10}
            value={formData.body}
            onChange={handleChange}
            placeholder="마크다운 또는 HTML"
          />
        </div>

        {/* 메뉴 선택 섹션 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📂 메뉴 선택</h2>
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
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
                    }`}
                  >
                    {selectedMenus.includes(menu.name) ? '✓ ' : ''}📁 {menu.name}
                  </button>
                ))}
              </div>
              
              {selectedMenus.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded border border-purple-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">선택된 메뉴:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMenus.map((menu) => (
                      <span
                        key={menu}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
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

        <div className="form-group">
          <label className="form-label">추가 태그 (쉼표로 구분, 선택)</label>
          <input
            type="text"
            name="tags"
            className="form-input"
            value={formData.tags}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 위에서 선택한 메뉴 외에 추가 태그를 입력할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">SEO 제목</label>
            <input
              type="text"
              name="seoTitle"
              className="form-input"
              value={formData.seoTitle}
              onChange={handleChange}
              title="SEO 제목"
              placeholder="SEO에 표시될 제목"
            />
          </div>

          <div className="form-group">
            <label className="form-label">SEO 설명</label>
            <input
              type="text"
              name="seoDescription"
              className="form-input"
              value={formData.seoDescription}
              onChange={handleChange}
              title="SEO 설명"
              placeholder="SEO에 표시될 설명"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="form-button">
            {loading ? '저장 중...' : '💾 저장'}
          </button>
          <button type="button" onClick={() => router.back()} className="form-button-secondary" disabled={loading}>
            취소
          </button>
        </div>

        {loading && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⏳ 저장 중입니다... 페이지를 닫거나 새로고침하지 마세요.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
