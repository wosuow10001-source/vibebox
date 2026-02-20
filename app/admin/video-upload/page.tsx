'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoUploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`🎬 파일 선택: ${file.name} (${fileSizeMB}MB)`);

    setUploading(true);
    setProgress(0);
    setMessage(`파일 선택: ${file.name} (${fileSizeMB}MB)`);

    try {
      // 1. Presigned URL 받기
      console.log('📤 Presigned URL 요청 중...');
      setMessage('업로드 준비 중...');

      const presignRes = await fetch('/api/admin/assets/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'video/mp4',
          fileSize: file.size,
          category: 'video',
        }),
      });

      if (!presignRes.ok) {
        throw new Error('Presigned URL 생성 실패');
      }

      const { assetId } = await presignRes.json();
      console.log(`✅ Asset ID: ${assetId}`);
      setMessage(`Asset ID: ${assetId}`);

      // 2. 청크 업로드
      const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
      const chunks = Math.ceil(file.size / CHUNK_SIZE);
      setTotalChunks(chunks);

      console.log(`📦 청크 업로드 시작: ${chunks}개 청크`);
      setMessage(`청크 업로드 시작: ${chunks}개 청크`);

      for (let i = 0; i < chunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        setCurrentChunk(i + 1);
        console.log(`📦 청크 ${i + 1}/${chunks} 전송 중... (${chunk.size} bytes)`);
        setMessage(`청크 ${i + 1}/${chunks} 전송 중...`);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', i.toString());
        formData.append('totalChunks', chunks.toString());
        formData.append('fileName', file.name);
        formData.append('assetId', assetId);

        const chunkRes = await fetch('/api/admin/assets/upload-chunk', {
          method: 'POST',
          body: formData,
        });

        if (!chunkRes.ok) {
          const error = await chunkRes.json();
          throw new Error(`청크 ${i + 1}/${chunks} 업로드 실패: ${error.error || '알 수 없음'}`);
        }

        const progressPercent = ((i + 1) / chunks) * 100;
        setProgress(progressPercent);
        console.log(`✅ 청크 ${i + 1}/${chunks} 완료 (${progressPercent.toFixed(1)}%)`);
      }

      console.log('✅ 모든 청크 업로드 완료!');
      setMessage('✅ 업로드 완료! 메인 페이지로 이동합니다...');

      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('❌ 업로드 오류:', error);
      setMessage(`❌ 오류: ${error instanceof Error ? error.message : '알 수 없음'}`);
      alert(`업로드 실패: ${error instanceof Error ? error.message : '알 수 없음'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">🎬 영상 업로드 (청크 방식)</h1>
        <p className="text-gray-600 mb-8">대용량 영상 파일을 5MB 청크로 분할하여 업로드합니다</p>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-4">
              영상 파일 선택
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-3 file:px-6
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {uploading && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 mb-2">{message}</p>
                {totalChunks > 0 && (
                  <p className="text-sm text-gray-600">
                    청크 {currentChunk}/{totalChunks} 업로드 중
                  </p>
                )}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300 flex items-center justify-center text-white text-sm font-semibold"
                  style={{ width: `${progress}%` }}
                >
                  {progress > 5 && `${progress.toFixed(1)}%`}
                </div>
              </div>
            </div>
          )}

          {message && !uploading && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{message}</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="font-bold mb-3">💡 사용 방법</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>위에서 영상 파일을 선택하세요</li>
            <li>파일이 자동으로 5MB 청크로 분할됩니다</li>
            <li>각 청크가 순차적으로 업로드됩니다</li>
            <li>서버에서 청크를 조합하여 완전한 파일을 생성합니다</li>
            <li>완료 후 자동으로 메인 페이지로 이동합니다</li>
          </ol>
        </div>

        <div className="mt-6 space-y-4">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            ← 관리자 대시보드로
          </button>
        </div>
      </div>
    </div>
  );
}
