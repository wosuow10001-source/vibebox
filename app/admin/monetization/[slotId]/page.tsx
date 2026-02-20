// app/admin/monetization/[slotId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const SLOT_TYPES = ['ADSENSE', 'BANNER_IMAGE', 'COUPON_CARD', 'AFFILIATE_PRODUCT', 'TEXT_LINK', 'NATIVE_CARD'];
const PLACEMENTS = [
  'HOME_TOP', 'HOME_HERO_RIGHT', 'HOME_BELOW_MENU', 'HOME_BETWEEN_SECTIONS',
  'HOME_SIDEBAR_STICKY', 'HOME_FOOTER', 'DETAIL_TOP', 'DETAIL_MID', 'DETAIL_BOTTOM',
  'DETAIL_SIDEBAR',
];

export default function EditSlotPage() {
  const router = useRouter();
  const params = useParams();
  const slotId = params.slotId as string;

  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlot = async () => {
      try {
        const res = await fetch(`/api/admin/monetization`);
        const slots = await res.json();
        const slot = slots.find((s: any) => s.id === slotId);
        setFormData(slot);
      } catch (error) {
        console.error('Failed to fetch slot:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slotId) {
      fetchSlot();
    }
  }, [slotId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch(`/api/admin/monetization/${slotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priority: parseInt(formData.priority),
          payloadJson: typeof formData.payloadJson === 'string'
            ? JSON.parse(formData.payloadJson)
            : formData.payloadJson,
        }),
      });

      alert('저장되었습니다');
      router.push('/admin/monetization');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (loading) return <div className="admin-content">로딩 중...</div>;
  if (!formData) return <div className="admin-content">슬롯을 찾을 수 없습니다</div>;

  return (
    <div className="admin-content max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">슬롯 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">슬롯 이름</label>
            <input
              type="text"
              name="name"
              className="form-input"
              aria-label="슬롯 이름"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">타입</label>
            <select name="type" className="form-input" value={formData.type} onChange={handleChange} aria-label="타입">
              {SLOT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">배치 위치</label>
            <select
              name="placement"
              className="form-input"
              value={formData.placement}
              onChange={handleChange}
              aria-label="배치 위치"
            >
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">우선순위</label>
            <input
              type="number"
              name="priority"
              className="form-input"
              placeholder="우선순위를 입력하세요"
              aria-label="우선순위"
              value={formData.priority}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">슬롯 설정 (JSON)</label>
          <textarea
            name="payloadJson"
            className="form-input"
            rows={6}
            placeholder="JSON 형식의 슬롯 설정을 입력하세요"
            aria-label="슬롯 설정 (JSON)"
            value={typeof formData.payloadJson === 'string'
              ? formData.payloadJson
              : JSON.stringify(formData.payloadJson, null, 2)}
            onChange={handleChange}
          />
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
