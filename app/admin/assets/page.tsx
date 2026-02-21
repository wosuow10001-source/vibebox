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
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64Data = await base64Promise;

        // Upload to Cloudinary via upload-background API
        const response = await fetch('/api/admin/assets/upload-background', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64Data,
            contentId: `asset-${Date.now()}-${Math.random().toString(36).substring(7)}`
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const { url } = await response.json();
        
        alert(`업로드 성공: ${file.name}\nCDN URL: ${url}`);
      } catch (error) {
        console.error('Upload failed:', error);
        alert(`업로드 실패: ${file.name}`);
      }
    }

    setUploading(false);
  };

  return (
    <div className="admin-content">
      <h1 className="text-4xl font-bold mb-8 미리보기">파일 관리</h1>

      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
          multiple
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-xl mb-2">파일을 드래그하거나 클릭해주세요</p>
          <p className="text-gray-500">지원 형식: 이미지, 영상, ZIP, PDF, 텍스트</p>
        </label>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <h3 className="font-bold mb-2">업로드 방식</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Presigned URL 기반 직접 53 업로드</li>
              <li>파일은 안전하게 검증 후 저장됨</li>
              <li>CDN URL로 공개 콘텐츠에 노출됨</li>
              <li>최대 파일 크기: 500MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
