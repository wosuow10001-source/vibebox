'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface App {
  id: string;
  name: string;
  description?: string;
  publicPath: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AppsManagePage() {
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 토큰 가져오기 (localStorage에서)
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (!storedToken) {
      router.push('/admin/login');
      return;
    }
    setToken(storedToken);
    loadApps(storedToken);
  }, []);

  // 앱 목록 로드
  const loadApps = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/apps/list', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!res.ok) throw new Error('Failed to load apps');
      const data = await res.json();
      setApps(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // HTML 파일 업로드
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) {
      setError('인증이 필요합니다');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('html') && !file.name.endsWith('.html')) {
      setError('❌ HTML 파일만 업로드 가능합니다');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadedUrl(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-html', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      const result = await res.json();
      setUploadedUrl(result.publicUrl);
      setUploadedUrl(`✅ 업로드 성공! AppID: ${result.appId} → ${result.publicUrl}`);
      
      // 목록 새로고침
      await loadApps(token);
    } catch (err: any) {
      setError(`❌ 업로드 실패: ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
      // 파일 입력 초기화
      if (e.target) e.target.value = '';
    }
  };

  // 앱 활성화
  const handleActivate = async (appId: string) => {
    if (!token) {
      setError('인증이 필요합니다');
      return;
    }

    try {
      const res = await fetch('/api/admin/apps/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Activation failed');
      }

      // 목록 새로고침
      await loadApps(token);
      setError(null);
    } catch (err: any) {
      setError(`❌ 활성화 실패: ${err.message}`);
      console.error(err);
    }
  };

  // 앱 비활성화
  const handleDeactivate = async (appId: string) => {
    if (!token) {
      setError('인증이 필요합니다');
      return;
    }

    try {
      const res = await fetch('/api/admin/apps/deactivate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Deactivation failed');
      }

      // 목록 새로고침
      await loadApps(token);
      setError(null);
    } catch (err: any) {
      setError(`❌ 비활성화 실패: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🌐 HTML 앱 관리</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 업로드 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📤 HTML 파일 업로드</h2>
          <p className="text-gray-600 mb-4">CSS와 JavaScript가 포함된 단일 HTML 파일을 업로드하세요.</p>

          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".html,text/html"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id="html-file-input"
            />
            <label
              htmlFor="html-file-input"
              className={`cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? '업로드 중...' : '📂 파일 선택'}
            </label>
          </div>

          {/* 성공/실패 메시지 */}
          {uploadedUrl && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">{uploadedUrl}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* 앱 목록 섹션 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📋 업로드된 앱 목록</h2>

          {loading ? (
            <p className="text-gray-500">로딩 중...</p>
          ) : apps.length === 0 ? (
            <p className="text-gray-500">업로드된 앱이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">앱 이름</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Public URL</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">상태</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">작성일</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{app.name}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        <code className="bg-gray-100 px-2 py-1 rounded">{app.publicPath}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            app.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {app.isActive ? '✅ 활성화' : '⭕ 비활성화'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {app.isActive ? (
                          <button
                            onClick={() => handleDeactivate(app.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                          >
                            비활성화
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(app.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                          >
                            활성화
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
