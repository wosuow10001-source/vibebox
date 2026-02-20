'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type ContentType = 'VIDEO' | 'HTML_APP' | 'PROJECT' | 'GAME' | 'IMAGE';

const UPLOAD_CONFIGS: Record<ContentType, { label: string; icon: string; accept: string; extensions: string[], maxSize: number }> = {
  VIDEO: {
    label: '📹 영상 업로드',
    icon: '🎬',
    accept: 'video/*',
    extensions: ['.mp4', '.webm', '.mov', '.avi'],
    maxSize: 2000, // 2GB
  },
  HTML_APP: {
    label: '💻 HTML 앱 업로드',
    icon: '🌐',
    accept: '.zip,.html,.htm',
    extensions: ['.zip', '.html', '.htm'],
    maxSize: 500, // 500MB
  },
  PROJECT: {
    label: '📦 프로젝트 폴더 업로드',
    icon: '📂',
    accept: '.zip,.tar,.gz',
    extensions: ['.zip', '.tar', '.gz', '.tar.gz'],
    maxSize: 1000, // 1GB
  },
  GAME: {
    label: '🎮 게임/프로그램 업로드',
    icon: '🎯',
    accept: '.zip,.exe,.app,.dmg',
    extensions: ['.zip', '.exe', '.app', '.dmg', '.apk'],
    maxSize: 1500, // 1.5GB
  },
  IMAGE: {
    label: '🖼️ 이미지 업로드',
    icon: '📷',
    accept: 'image/*',
    extensions: ['.jpg', '.png', '.gif', '.webp', '.svg'],
    maxSize: 100, // 100MB
  },
};

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<ContentType | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoRef = useRef<HTMLInputElement>(null);
  const htmlRef = useRef<HTMLInputElement>(null);
  const projectRef = useRef<HTMLInputElement>(null);
  const gameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const fileInputRefs: Record<ContentType, React.RefObject<HTMLInputElement | null>> = {
    VIDEO: videoRef,
    HTML_APP: htmlRef,
    PROJECT: projectRef,
    GAME: gameRef,
    IMAGE: imageRef,
  };

  const handleUpload = async (files: FileList | null, type: ContentType) => {
    if (!files || files.length === 0) return;

    const config = UPLOAD_CONFIGS[type];
    setUploadingType(type);
    setUploading(true);
    setUploadProgress(0);

    const uploadedAssets = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 파일 크기 확인
      if (file.size > config.maxSize * 1024 * 1024) {
        alert(`❌ ${file.name}은 ${config.maxSize}MB를 초과합니다`);
        continue;
      }

      try {
        // 1. Presigned URL 받기
        console.log(`📤 업로드 준비 중: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        const presignRes = await fetch('/api/admin/assets/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            category: type.toLowerCase(),
            contentType: type,
          }),
        });

        if (!presignRes.ok) {
          throw new Error('Presigned URL 생성 실패');
        }

        const { uploadUrl, cdnUrl, storageKey, assetId } = await presignRes.json();
        console.log(`✅ Presigned URL 받음, assetId: ${assetId}`);

        // 2. 파일 크기에 따라 업로드 방식 선택
        const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB 청크
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const useChunkedUpload = type === 'VIDEO' || file.size > 10 * 1024 * 1024; // VIDEO는 무조건 청크, 또는 10MB 이상

        if (useChunkedUpload) {
          // 청크 업로드 (대용량 파일)
          console.log(`📦 청크 업로드 시작: ${file.name} (${totalChunks}개 청크)`);
          
          for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('chunkIndex', chunkIndex.toString());
            formData.append('totalChunks', totalChunks.toString());
            formData.append('fileName', file.name);
            formData.append('assetId', assetId);

            console.log(`📦 청크 ${chunkIndex + 1}/${totalChunks} 전송 중... (${chunk.size} bytes)`);

            const chunkRes = await fetch('/api/admin/assets/upload-chunk', {
              method: 'POST',
              body: formData,
            });

            if (!chunkRes.ok) {
              const errorData = await chunkRes.json().catch(() => ({ error: '알 수 없음' }));
              throw new Error(`청크 ${chunkIndex + 1}/${totalChunks} 업로드 실패: ${errorData.error}`);
            }

            const progress = ((chunkIndex + 1) / totalChunks) * 100;
            setUploadProgress(progress);
            console.log(`✅ 청크 ${chunkIndex + 1}/${totalChunks} 업로드 완료 (${progress.toFixed(1)}%)`);
          }

          console.log(`✅ 청크 업로드 완료: ${file.name}`);
        } else {
          // 일반 업로드 (작은 파일)
          console.log(`📤 일반 업로드 시작: ${file.name}`);
          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });

          if (!uploadRes.ok) {
            throw new Error(`업로드 실패: ${uploadRes.status}`);
          }

          console.log(`✅ 업로드 완료: ${file.name}`);
        }
        
        uploadedAssets.push({
          file: file.name,
          cdnUrl,
          storageKey,
          assetId,
        });

        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error(`❌ 업로드 실패: ${file.name}`, error);
        alert(`업로드 실패: ${file.name}\n${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    }

    if (uploadedAssets.length > 0) {
      console.log(`✅ ${uploadedAssets.length}개 파일 업로드 완료`);
      alert(`✅ ${uploadedAssets.length}개 파일이 업로드되었습니다!`);

      // 업로드된 파일이 있으면 콘텐츠 생성 페이지로 이동 (여러 에셋 지원)
      const ids = uploadedAssets.map((a) => a.assetId).join(',');
      const urls = uploadedAssets.map((a) => encodeURIComponent(a.cdnUrl)).join(',');
      // 첫 번째 파일명에서 slug 자동 생성 (정규화)
      const firstFile = uploadedAssets[0].file || 'content';
      const autoSlug = firstFile
        .replace(/\.[^.]+$/, '') // 확장자 제거
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 특수문자 제거
        .replace(/\s+/g, '-') // 공백을 대시로
        .replace(/-+/g, '-') // 중복 대시 제거
        .replace(/^-|-$/g, ''); // 양쪽 대시 제거
      router.push(`/admin/content/new?assetIds=${ids}&assetUrls=${urls}&slug=${encodeURIComponent(autoSlug)}&title=${encodeURIComponent(autoSlug)}&type=${type}`);
    }

    setUploading(false);
    setUploadingType(null);
    setUploadProgress(0);
  };

  return (
    <div className="admin-content">
      <h1 className="text-4xl font-bold mb-2">📥 콘텐츠 업로드</h1>
      <p className="text-gray-600 mb-8">영상, 게임, 앱, 프로젝트들을 업로드하세요</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(UPLOAD_CONFIGS) as ContentType[]).map((type) => {
          const config = UPLOAD_CONFIGS[type];
          return (

          <div key={type} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-500 transition-colors">
            <div className="text-5xl mb-4">{config.icon}</div>
            <h2 className="text-xl font-bold mb-2">{config.label}</h2>
            
            <div className="mb-4 space-y-2 text-sm text-gray-600">
              <p>📄 형식: {config.extensions.join(', ')}</p>
              <p>💾 최대용량: {config.maxSize > 1000 ? (config.maxSize / 1024).toFixed(1) + 'GB' : config.maxSize + 'MB'}</p>
            </div>

            <label className="block">
              <input
                ref={fileInputRefs[type]}
                type="file"
                multiple
                accept={config.accept}
                onChange={(e) => handleUpload(e.target.files, type as ContentType)}
                disabled={uploading}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRefs[type].current?.click()}
                disabled={uploading && uploadingType === type}
                className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                  uploading && uploadingType === type
                    ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {uploading && uploadingType === type ? (
                  <>
                    🔄 업로드 중... ({Math.round(uploadProgress)}%)
                  </>
                ) : (
                  `🔼 ${type === 'VIDEO' ? '영상' : type === 'HTML_APP' ? 'HTML 앱' : type === 'PROJECT' ? '프로젝트' : type === 'GAME' ? '게임/프로그램' : '이미지'} 선택`
                )}
              </button>
            </label>

            {uploading && uploadingType === type && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-bold mb-2">ℹ️ 사용 방법</p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>위에서 해당하는 타입의 파일을 업로드합니다</li>
          <li>업로드가 완료되면 <strong>콘텐츠 생성 페이지</strong>로 자동 이동합니다</li>
          <li>제목, 설명 등을 입력하고 <strong>저장 버튼을 한 번만</strong> 클릭하세요</li>
          <li>저장 버튼을 여러 번 누르면 중복 콘텐츠가 생성됩니다</li>
        </ol>
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="font-bold mb-2">⚠️ 중요</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li><strong>저장 버튼은 한 번만 클릭</strong>하세요 (중복 방지)</li>
          <li>빠른 업로드는 <a href="/admin/upload-direct" className="text-blue-600 underline">/admin/upload-direct</a> 페이지를 이용하세요</li>
        </ul>
      </div>

      <div className="mt-8 space-y-4">
        <button
          onClick={() => router.push('/admin/content')}
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
        >
          ← 콘텐츠 목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}
