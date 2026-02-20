'use client';

import { useState, useRef } from 'react';

interface Props {
  cdnUrl: string;
  title: string;
}

export function HtmlAppViewer({ cdnUrl, title }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 파일 타입 감지
  const isVideo = /\.(mp4|webm|mov|avi)$/i.test(cdnUrl);
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(cdnUrl);

  const handleFullscreen = () => {
    if (!isVideo && !isImage && !iframeRef.current) return;
    
    const element = isVideo ? videoRef.current : isImage ? null : iframeRef.current;
    
    if (!isFullscreen) {
      if (element && element.requestFullscreen) {
        element.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* 버튼 컨트롤 */}
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <button
          type="button"
          onClick={handleFullscreen}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          title={isFullscreen ? '전체 화면 종료' : '전체 화면'}
        >
          {isFullscreen ? '⛔ 종료' : '🖥️ 전체 화면'}
        </button>
      </div>

      {/* 콘텐츠 렌더링 */}
      {isVideo ? (
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          src={cdnUrl}
          onError={(e) => console.error('HtmlAppViewer video error:', cdnUrl, e)}
          className={`border-0 transition-all ${isFullscreen ? 'fixed inset-0 w-full h-full z-50 rounded-none' : 'w-full h-auto rounded-b-lg'}`}
          style={isFullscreen ? {} : { maxHeight: '600px' }}
        >
          <source src={cdnUrl} type={/\.webm$/i.test(cdnUrl) ? 'video/webm' : /\.mov$/i.test(cdnUrl) ? 'video/quicktime' : 'video/mp4'} />
        </video>
      ) : isImage ? (
        <img
          src={cdnUrl}
          alt={title}
          className={`border-0 transition-all ${isFullscreen ? 'fixed inset-0 w-full h-full z-50 rounded-none object-contain' : 'w-full h-auto rounded-b-lg'}`}
        />
      ) : (
        <iframe
          ref={iframeRef}
          src={cdnUrl}
          title={title}
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
          className={`border-0 transition-all ${isFullscreen ? 'fixed inset-0 w-full h-full z-50 rounded-none' : 'w-full min-h-[600px] rounded-b-lg'}`}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
