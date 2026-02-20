// app/admin/content/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Content {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  publishedAt?: string;
  updatedAt: string;
  tags?: string[]; // 태그 배열
  menus?: string[]; // 메뉴 배열
  pinned?: boolean; // 홈 고정 여부
}

export default function ContentListPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [editingMenus, setEditingMenus] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState<string>('');
  const [availableMenus, setAvailableMenus] = useState<Array<{ name: string; url: string }>>([]);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await fetch('/api/admin/content');
        const data = await res.json();
        // Ensure contents is an array
        setContents(Array.isArray(data) ? data : (data.contents || []));
      } catch (error) {
        console.error('Failed to fetch contents:', error);
        setContents([]);
      } finally {
        setLoading(false);
      }
    };

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

    fetchContents();
    fetchMenus();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/admin/content/${id}`, { method: 'DELETE' });
      setContents(contents.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleAddTag = async (contentId: string, tag: string) => {
    if (!tag.trim()) return;

    try {
      // 현재 콘텐츠 찾기
      const content = contents.find((c) => c.id === contentId);
      if (!content) return;

      // 태그 추가
      const updatedTags = [...(content.tags || []), tag.trim()];

      // API 호출하여 업데이트
      const res = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: updatedTags }),
      });

      if (!res.ok) throw new Error('태그 추가 실패');

      // 로컬 상태 업데이트
      setContents(
        contents.map((c) =>
          c.id === contentId ? { ...c, tags: updatedTags } : c
        )
      );
      setTagInput('');
    } catch (error) {
      console.error('태그 추가 실패:', error);
      alert('❌ 태그 추가에 실패했습니다');
    }
  };

  const handleRemoveTag = async (contentId: string, tagToRemove: string) => {
    try {
      const content = contents.find((c) => c.id === contentId);
      if (!content) return;

      const updatedTags = (content.tags || []).filter((t) => t !== tagToRemove);

      const res = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: updatedTags }),
      });

      if (!res.ok) throw new Error('태그 제거 실패');

      setContents(
        contents.map((c) =>
          c.id === contentId ? { ...c, tags: updatedTags } : c
        )
      );
    } catch (error) {
      console.error('태그 제거 실패:', error);
      alert('❌ 태그 제거에 실패했습니다');
    }
  };

  const handleAddMenu = async (contentId: string, menuName: string) => {
    if (!menuName.trim()) return;

    try {
      const content = contents.find((c) => c.id === contentId);
      if (!content) return;

      // 이미 추가된 메뉴인지 확인
      if (content.menus?.includes(menuName)) {
        alert('이미 추가된 메뉴입니다.');
        return;
      }

      const updatedMenus = [...(content.menus || []), menuName.trim()];

      const res = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menus: updatedMenus }),
      });

      if (!res.ok) throw new Error('메뉴 추가 실패');

      setContents(
        contents.map((c) =>
          c.id === contentId ? { ...c, menus: updatedMenus } : c
        )
      );
      alert('✅ 메뉴에 추가되었습니다!');
    } catch (error) {
      console.error('메뉴 추가 실패:', error);
      alert('❌ 메뉴 추가에 실패했습니다');
    }
  };

  const handleRemoveMenu = async (contentId: string, menuToRemove: string) => {
    try {
      const content = contents.find((c) => c.id === contentId);
      if (!content) return;

      const updatedMenus = (content.menus || []).filter((m) => m !== menuToRemove);

      const res = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menus: updatedMenus }),
      });

      if (!res.ok) throw new Error('메뉴 제거 실패');

      setContents(
        contents.map((c) =>
          c.id === contentId ? { ...c, menus: updatedMenus } : c
        )
      );
    } catch (error) {
      console.error('메뉴 제거 실패:', error);
      alert('❌ 메뉴 제거에 실패했습니다');
    }
  };

  const handleTogglePin = async (contentId: string) => {
    try {
      const content = contents.find((c) => c.id === contentId);
      if (!content) return;

      const newPinnedState = !content.pinned;

      const res = await fetch(`/api/admin/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: newPinnedState }),
      });

      if (!res.ok) throw new Error('고정 상태 변경 실패');

      setContents(
        contents.map((c) =>
          c.id === contentId ? { ...c, pinned: newPinnedState } : c
        )
      );
      
      alert(newPinnedState ? '✅ 홈에 고정되었습니다!' : '✅ 고정이 해제되었습니다!');
    } catch (error) {
      console.error('고정 상태 변경 실패:', error);
      alert('❌ 고정 상태 변경에 실패했습니다');
    }
  };

  return (
    <div className="admin-content">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">콘텐츠 관리</h1>
        <div className="flex gap-3">
          <Link href="/admin/upload" className="form-button bg-green-600 hover:bg-green-700">
            📥 파일 업로드
          </Link>
          <Link href="/admin/content/new" className="form-button">
            + 새 콘텐츠
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">제목</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">타입</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">메뉴</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">태그</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">상태</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">홈 고정</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">수정일</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contents.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/content/${c.id}`} className="text-blue-600 hover:underline">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.type}</td>
                  
                  {/* 메뉴 열 */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {/* 현재 메뉴 표시 */}
                      <div className="flex flex-wrap gap-1">
                        {(c.menus || []).map((menu, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                          >
                            📁 {menu}
                            <button
                              type="button"
                              onClick={() => handleRemoveMenu(c.id, menu)}
                              className="hover:text-red-600 font-bold"
                              title="메뉴에서 제거"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      
                      {/* 메뉴 추가 UI */}
                      {editingMenus === c.id ? (
                        <div className="space-y-2">
                          {availableMenus.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">메뉴 선택:</p>
                              <div className="flex flex-wrap gap-1">
                                {availableMenus.map((menu) => (
                                  <button
                                    key={menu.name}
                                    type="button"
                                    onClick={() => {
                                      handleAddMenu(c.id, menu.name);
                                      setEditingMenus(null);
                                    }}
                                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition"
                                  >
                                    📁 {menu.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => setEditingMenus(null)}
                            className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingMenus(c.id)}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          + 메뉴 추가
                        </button>
                      )}
                    </div>
                  </td>

                  {/* 태그 열 */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {/* 현재 태그 표시 */}
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(c.id, tag)}
                              className="hover:text-red-600 font-bold"
                              title="태그 제거"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      
                      {/* 태그 추가 UI */}
                      {editingTags === c.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddTag(c.id, tagInput);
                              } else if (e.key === 'Escape') {
                                setEditingTags(null);
                                setTagInput('');
                              }
                            }}
                            placeholder="태그 입력"
                            className="px-2 py-1 text-xs border rounded flex-1"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleAddTag(c.id, tagInput)}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          >
                            추가
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTags(null);
                              setTagInput('');
                            }}
                            className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingTags(c.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          + 태그 추가
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {c.status === 'PUBLISHED' ? '발행됨' : '임시저장'}
                    </span>
                  </td>
                  
                  {/* 홈 고정 열 */}
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(c.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        c.pinned
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={c.pinned ? '고정 해제' : '홈에 고정'}
                    >
                      {c.pinned ? '📌 고정됨' : '📌 고정'}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(c.updatedAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
