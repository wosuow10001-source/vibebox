'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Asset {
  id: string;
  name: string;
  mime: string;
  size: number;
  cdnUrl: string;
  publicUrl: string;
  createdAt: string;
  content?: {
    id: string;
    title: string;
    type: string;
    slug: string;
  };
}

interface ContentGridViewerProps {
  title?: string;
  limit?: number;
}

export function ContentGridViewer({ title = "📦 업로드된 콘텐츠", limit = 12 }: ContentGridViewerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAssets = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/public/assets/list', { cache: 'no-store' });
        
        if (!mounted) return;
        
        if (!res.ok) {
          console.warn(`API returned status ${res.status}`);
          setAssets([]);
          return;
        }

        const data = await res.json();
        if (!mounted) return;
        
        if (Array.isArray(data)) {
          setAssets(limit ? data.slice(0, limit) : data);
        } else {
          setAssets([]);
        }
        setError(null);
      } catch (err: any) {
        console.warn('Failed to fetch assets (using empty list):', err);
        if (!mounted) return;
        setAssets([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchAssets();
    
    return () => {
      mounted = false;
    };
  }, [limit]);

  const getFileIcon = (mime: string, name: string) => {
    if (mime.includes('image')) return '🖼️';
    if (mime.includes('video')) return '📹';
    if (mime.includes('audio')) return '🎵';
    if (mime.includes('pdf')) return '📄';
    if (mime.includes('html') || name.endsWith('.html')) return '🌐';
    if (mime.includes('zip') || name.endsWith('.zip')) return '📦';
    return '📎';
  };

  const getFileCategory = (mime: string, name: string) => {
    if (mime.includes('image')) return '이미지';
    if (mime.includes('video')) return '동영상';
    if (mime.includes('audio')) return '음성';
    if (mime.includes('pdf')) return 'PDF';
    if (mime.includes('html') || name.endsWith('.html')) return 'HTML 앱';
    return '파일';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const ThumbnailPreview = ({ asset }: { asset: Asset }) => {
    if (asset.mime.includes('image')) {
      return (
        <img
          src={asset.publicUrl}
          alt={asset.name}
          className="w-full h-full object-cover"
        />
      );
    }

    if (asset.mime.includes('video')) {
      return (
        <video
          className="w-full h-full object-cover"
          playsInline
          muted
          preload="metadata"
        >
          <source src={asset.publicUrl} />
        </video>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-4xl">
        {getFileIcon(asset.mime, asset.name)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">콘텐츠를 로딩 중입니다...</p>
      </div>
    );
  }

  if (error || assets.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>{error || '업로드된 콘텐츠가 없습니다'}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>

      {/* 콘텐츠 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="group cursor-pointer"
            onClick={() => setSelectedAsset(asset)}
          >
            {/* 썸네일 */}
            <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-2 shadow-md hover:shadow-lg transition-shadow">
              <ThumbnailPreview asset={asset} />
              
              {/* 오버레이 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-white text-center">
                  <div className="text-2xl mb-1">{getFileIcon(asset.mime, asset.name)}</div>
                  <div className="text-xs font-semibold">클릭하여 열기</div>
                </div>
              </div>
            </div>

            {/* 정보 */}
            <div className="truncate">
              <p className="text-sm font-medium text-gray-900 truncate" title={asset.name}>
                {asset.name}
              </p>
              <p className="text-xs text-gray-500">
                {getFileCategory(asset.mime, asset.name)} • {formatFileSize(asset.size)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 모달 */}
      {selectedAsset && (
        <ContentViewerModal 
          asset={selectedAsset} 
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}

// ✅ 콘텐츠 상세 보기 모달
function ContentViewerModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const isImage = asset.mime.includes('image');
  const isVideo = asset.mime.includes('video');
  const isHtml = asset.mime.includes('html') || asset.name.endsWith('.html');
  const isPdf = asset.mime.includes('pdf');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="font-bold text-gray-900">{asset.name}</h3>
            <p className="text-sm text-gray-500">
              {getFileCategory(asset.mime, asset.name)} • {formatFileSize(asset.size)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-900 transition"
          >
            ✕ 닫기
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
          {isImage && (
            <img
              src={asset.publicUrl}
              alt={asset.name}
              className="max-w-full max-h-full object-contain"
            />
          )}

          {isVideo && (
            <video
              controls
              playsInline
              preload="metadata"
              className="max-w-full max-h-full"
            >
              <source src={asset.publicUrl} />
              브라우저가 비디오를 지원하지 않습니다
            </video>
          )}

          {isHtml && (
            <iframe
              src={asset.publicUrl}
              className="w-full h-full border-0"
              title={asset.name}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
            />
          )}

          {isPdf && (
            <embed
              src={asset.publicUrl}
              type="application/pdf"
              className="w-full h-full"
            />
          )}

          {!isImage && !isVideo && !isHtml && !isPdf && (
            <div className="text-center">
              <div className="text-6xl mb-4">📎</div>
              <p className="text-gray-600 mb-4">이 파일은 브라우저에서 미리볼 수 없습니다</p>
              <a
                href={asset.publicUrl}
                download={asset.name}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                📥 다운로드
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getFileCategory(mime: string, name: string) {
  if (mime.includes('image')) return '이미지';
  if (mime.includes('video')) return '동영상';
  if (mime.includes('audio')) return '음성';
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('html') || name.endsWith('.html')) return 'HTML 앱';
  return '파일';
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
