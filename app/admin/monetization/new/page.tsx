// app/admin/monetization/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SLOT_TYPES = ['ADSENSE', 'BANNER_IMAGE', 'COUPON_CARD', 'AFFILIATE_PRODUCT', 'TEXT_LINK', 'NATIVE_CARD'];
const PLACEMENTS = [
  'HOME_TOP', 'HOME_HERO_RIGHT', 'HOME_BELOW_MENU', 'HOME_BETWEEN_SECTIONS',
  'HOME_SIDEBAR_STICKY', 'HOME_FOOTER', 'DETAIL_TOP', 'DETAIL_MID', 'DETAIL_BOTTOM',
  'DETAIL_SIDEBAR',
];

export default function NewSlotPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    type: 'ADSENSE',
    placement: 'HOME_TOP',
    priority: 0,
    status: 'ACTIVE',
    deviceTarget: 'all',
    pageTarget: 'all',
    payloadJson: '{}',
    showDisclosure: false,
    disclosureText: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch('/api/admin/monetization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priority: Number(formData.priority),
          payloadJson: JSON.parse(formData.payloadJson || '{}'),
        }),
      });

      alert('슬롯이 생성되었습니다');
      router.push('/admin/monetization');
    } catch (error) {
      console.error('Create failed:', error);
      alert('생성 실패');
    }
  };

  return (
    <div className="admin-content max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">새 수익화 슬롯</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="name-input" className="form-label">슬롯 이름</label>
            <input
              id="name-input"
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type-select" className="form-label">타입</label>
            <select
              id="type-select"
              name="type"
              className="form-input"
              value={formData.type}
              onChange={handleChange}
            >
              {SLOT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="placement-select" className="form-label">배치 위치</label>
            <select
              id="placement-select"
              name="placement"
              className="form-input"
              value={formData.placement}
              onChange={handleChange}
            >
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority-input" className="form-label">우선순위</label>
            <input
              id="priority-input"
              type="number"
              name="priority"
              className="form-input"
              value={formData.priority}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="device-target-select" className="form-label">기기 타게팅</label>
            <select
              id="device-target-select"
              name="deviceTarget"
              className="form-input"
              value={formData.deviceTarget}
              onChange={handleChange}
            >
              <option value="all">모든 기기</option>
              <option value="mobile">모바일</option>
              <option value="desktop">데스크톱</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="page-target-select" className="form-label">페이지 타게팅</label>
            <select
              id="page-target-select"
              name="pageTarget"
              className="form-input"
              value={formData.pageTarget}
              onChange={handleChange}
            >
              <option value="all">모든 페이지</option>
              <option value="home">홈</option>
              <option value="post">게시글</option>
              <option value="html_app">HTML 앱</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="payload-textarea" className="form-label">슬롯 설정 (JSON)</label>
          <textarea
            id="payload-textarea"
            name="payloadJson"
            className="form-input"
            rows={6}
            value={formData.payloadJson}
            onChange={handleChange}
            placeholder='{
  "adClient": "ca-pub-xxxxxxxx",
  "adSlot": "1234567890",
  "format": "auto"
}'
          />
        </div>

        <div className="space-y-3 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="showDisclosure"
              checked={formData.showDisclosure}
              onChange={handleChange}
              id="disclosure-check"
            />
            <label htmlFor="disclosure-check" className="text-sm font-medium">
              컴플라이언스 고지 표시
            </label>
          </div>
          {formData.showDisclosure && (
            <div className="form-group">
              <label htmlFor="disclosure-text" className="form-label">고지 문구</label>
              <input
                id="disclosure-text"
                type="text"
                name="disclosureText"
                className="form-input"
                value={formData.disclosureText}
                onChange={handleChange}
                placeholder="예: 이 링크는 제휴 링크입니다"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button type="submit" className="form-button">
            생성
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
