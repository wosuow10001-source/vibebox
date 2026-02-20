'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DirectUploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 제목이 비어있으면 파일명으로 자동 설정
      if (!title) {
        setTitle(file.name.replace(/\.[^.]+$/, ''));
      }
      setMessage(`파일 선택됨: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (thumbnailFile: File): Promise<string> => {
    // 썸네일 업로드
    const presignRes = await fetch('/api/admin/assets/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: thumbnailFile.name,
        mimeType: thumbnailFile.type,
        fileSize: thumbnailFile.size,
        category: 'image',
      }),
    });

    if (!presignRes.ok) {
      throw new Error('썸네일 Presigned URL 생성 실패');
    }

    const { uploadUrl, cdnUrl } = await presignRes.json();

    // 썸네일은 작은 파일이므로 일반 업로드
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': thumbnailFile.type },
      body: thumbnailFile,
    });

    if (!uploadRes.ok) {
      throw new Error('썸네일 업로드 실패');
    }

    return cdnUrl;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('파일을 먼저 선택해주세요');
      return;
    }

    // 제목이 비어있으면 파일명에서 자동 생성
    const autoTitle = title || selectedFile.name.replace(/\.[^.]+$/, '');

    setUploading(true);
    setProgress(0);
    setMessage(`업로드 준비 중: ${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)`);

    try {
      // 0. 썸네일 업로드 (있는 경우)
      let thumbnailUrl = '';
      if (thumbnailFile) {
        setMessage('썸네일 업로드 중...');
        thumbnailUrl = await uploadThumbnail(thumbnailFile);
        console.log('✅ 썸네일 업로드 완료:', thumbnailUrl);
      }

      // 1. Presigned URL 받기
      const presignRes = await fetch('/api/admin/assets/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          mimeType: selectedFile.type || 'video/mp4',
          fileSize: selectedFile.size,
          category: 'video',
        }),
      });

      if (!presignRes.ok) {
        throw new Error('Presigned URL 생성 실패');
      }

      const { assetId } = await presignRes.json();
      setMessage(`업로드 시작: ${assetId}`);

      // 2. 청크 업로드 (5MB씩)
      const CHUNK_SIZE = 5 * 1024 * 1024;
      const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);

      console.log(`📦 청크 업로드 시작: 총 ${totalChunks}개 청크, 파일 크기 ${selectedFile.size} bytes`);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
        const chunk = selectedFile.slice(start, end);

        console.log(`📤 청크 ${i + 1}/${totalChunks} 업로드 중... (${start}-${end}, ${chunk.size} bytes)`);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', i.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('fileName', selectedFile.name);
        formData.append('assetId', assetId);

        try {
          const chunkRes = await fetch('/api/admin/assets/upload-chunk', {
            method: 'POST',
            body: formData,
          });

          if (!chunkRes.ok) {
            const errorText = await chunkRes.text();
            console.error(`❌ 청크 ${i + 1} 업로드 실패:`, errorText);
            throw new Error(`청크 ${i + 1}/${totalChunks} 업로드 실패: ${errorText}`);
          }

          const result = await chunkRes.json();
          console.log(`✅ 청크 ${i + 1}/${totalChunks} 업로드 성공:`, result);

          const progressPercent = ((i + 1) / totalChunks) * 100;
          setProgress(progressPercent);
          setMessage(`청크 ${i + 1}/${totalChunks} 업로드 완료 (${progressPercent.toFixed(1)}%)`);
        } catch (chunkError) {
          console.error(`❌ 청크 ${i + 1} 업로드 중 오류:`, chunkError);
          throw chunkError;
        }
      }

      console.log(`✅ 모든 청크 업로드 완료!`);

      // 3. 콘텐츠 생성 (제목, 설명, 썸네일 포함)
      setMessage('콘텐츠 생성 중...');
      
      const slug = autoTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const contentRes = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: autoTitle,
          slug: slug,
          description: description || '',
          excerpt: description || '',
          coverImage: thumbnailUrl || undefined,
          type: 'VIDEO',
          status: 'PUBLISHED',
          assets: [assetId],
        }),
      });

      if (!contentRes.ok) {
        console.warn('콘텐츠 생성 실패, 하지만 파일은 업로드됨');
      }

      setMessage('✅ 업로드 완료! 메인 페이지로 이동합니다...');
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('업로드 오류:', error);
      setMessage(`❌ 오류: ${error instanceof Error ? error.message : '알 수 없음'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-content max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">🎬 직접 영상 업로드</h1>
      <p className="text-gray-600 mb-8">대용량 영상 파일을 청크 방식으로 업로드합니다 (최대 2GB)</p>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
        <div className="space-y-6">
          {/* 제목 입력 */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              제목 <span className="text-gray-500 text-sm font-normal">(선택사항)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요 (비워두면 파일명 사용)"
              disabled={uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* 설명 입력 */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              설명 <span className="text-gray-500 text-sm font-normal">(선택사항)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="영상에 대한 설명을 입력하세요"
              disabled={uploading}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* 썸네일 이미지 업로드 */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              썸네일 이미지 <span className="text-gray-500 text-sm font-normal">(선택사항)</span>
            </label>
            <div className="text-sm text-gray-600 mb-3">JPG, PNG, GIF, WebP 형식 지원</div>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {thumbnailPreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">미리보기:</p>
                <img 
                  src={thumbnailPreview} 
                  alt="썸네일 미리보기" 
                  className="w-48 h-auto rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
          </div>

          {/* 파일 선택 */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              영상 파일 선택
            </label>
            <div className="text-sm text-gray-600 mb-3">MP4, WebM, MOV, AVI 형식 지원 (최대 2GB)</div>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-green-600">
                ✓ 선택됨: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)
              </div>
            )}
          </div>

          {/* 업로드 버튼 */}
          <div>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                !selectedFile || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {uploading ? '🔄 업로드 중...' : '📤 업로드 시작'}
            </button>
          </div>
        </div>

        {uploading && (
          <div className="mt-6">
            <div className="mb-2 text-sm font-medium text-gray-700">{message}</div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-right text-sm text-gray-600">{progress.toFixed(1)}%</div>
          </div>
        )}

        {message && !uploading && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{message}</p>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <button
          type="button"
          onClick={() => router.push('/admin/content')}
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
        >
          ← 콘텐츠 목록으로
        </button>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="font-bold mb-2">💡 사용 방법</p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>제목과 설명을 입력하세요 (선택사항, 비워두면 파일명 사용)</li>
          <li>썸네일 이미지를 선택하세요 (선택사항, 메인 페이지에 표시됨)</li>
          <li>영상 파일을 선택하세요</li>
          <li>"📤 업로드 시작" 버튼을 클릭하세요</li>
          <li>대용량 파일은 5MB씩 조각내서 업로드됩니다</li>
          <li>업로드 완료 후 자동으로 메인 페이지로 이동합니다</li>
        </ol>
      </div>
    </div>
  );
}
