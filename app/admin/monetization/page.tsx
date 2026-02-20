// app/admin/monetization/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdSlot {
  id: string;
  name: string;
  type: string;
  placement: string;
  status: string;
  priority: number;
  renderCount: number;
}

export default function MonetizationPage() {
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch('/api/admin/monetization');
        const data = await res.json();
        // Ensure data is an array
        setSlots(Array.isArray(data) ? data : data.slots || []);
      } catch (error) {
        console.error('Failed to fetch slots:', error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/admin/monetization/${id}`, { method: 'DELETE' });
      setSlots(slots.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const PLACEMENTS = [
    'HOME_TOP',
    'HOME_HERO_RIGHT',
    'HOME_BELOW_MENU',
    'HOME_BETWEEN_SECTIONS',
    'HOME_SIDEBAR_STICKY',
    'HOME_FOOTER',
    'DETAIL_TOP',
    'DETAIL_MID',
    'DETAIL_BOTTOM',
    'DETAIL_SIDEBAR',
  ];

  return (
    <div className="admin-content">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">수익화 슬롯 관리</h1>
        <Link href="/admin/monetization/new" className="form-button">
          + 새 슬롯
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : (
        <div className="space-y-6">
          {PLACEMENTS.map((placement) => {
            const placementSlots = slots.filter((s) => s.placement === placement);
            return (
              <div key={placement} className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-lg mb-4">{placement}</h3>
                {placementSlots.length === 0 ? (
                  <p className="text-gray-500">슬롯이 없습니다</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">이름</th>
                        <th className="text-left py-2">타입</th>
                        <th className="text-left py-2">우선순위</th>
                        <th className="text-left py-2">노출수</th>
                        <th className="text-right py-2">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {placementSlots.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="py-3">{s.name}</td>
                          <td className="py-3">{s.type}</td>
                          <td className="py-3">{s.priority}</td>
                          <td className="py-3">{s.renderCount}</td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/admin/monetization/${s.id}`}
                              className="text-blue-600 hover:underline mr-4"
                            >
                              편집
                            </Link>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
