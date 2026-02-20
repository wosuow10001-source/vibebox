// app/admin/assets/page.tsx
'use client';

import { useState } from 'react';

export default function AssetsPage() {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);

    for (const file of files) {
      try {
        // 1. Presigned URL 받기
        const presignRes = await fetch('/api/admin/assets/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            category: 'uploads',
          }),
        });

        const { uploadUrl, cdnUrl } = await presignRes.json();

        // 2. S3에 직접 업로드
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        alert(`업로드 성공: ${file.name}\nCDN URL: ${cdnUrl}`);
      } catch (error) {
        console.error('Upload failed:', error);
        alert(`업로드 실패: ${file.name}`);
      }
    }

    setUploading(false);
  };

  return (
    <div className="admin-content">
      <h1 className="text-4xl font-bold mb-8">파일 관리</h1>

      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <input
          type="file"
          multiple
          accept="image/*,video/*,.zip,.pdf,.txt"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="text-5xl mb-4">📁</div>
          <p className="text-lg font-medium mb-2">
            {uploading ? '업로드 중...' : '파일을 드래그하거나 클릭해주세요'}
          </p>
          <p className="text-sm text-gray-600">
            지원 형식: 이미지, 영상, ZIP, PDF, 텍스트
          </p>
        </label>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">💡 업로드 방식</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Presigned URL 기반 직접 S3 업로드</li>
          <li>파일은 안전하게 검증 후 저장됨</li>
          <li>CDN URL로 공개 콘텐츠에 노출됨</li>
          <li>최대 파일 크기: 500MB</li>
        </ul>
      </div>
    </div>
  );
}
