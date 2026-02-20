interface CurrentAppViewerProps {
  appId: string;
  name: string;
  publicUrl: string;
  htmlContent: string;
}

export function CurrentAppViewer({ appId, name, publicUrl, htmlContent }: CurrentAppViewerProps) {

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* 앱 이름 바 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{name}</h1>
            <p className="text-sm text-gray-500">App ID: {appId}</p>
          </div>
          <div className="text-sm text-gray-500">
            🌐 {publicUrl}
          </div>
        </div>
      </div>

      {/* iframe (샌드박스 적용) */}
      <div className="w-full h-[calc(100vh-70px)]">
        <iframe
          srcDoc={htmlContent || '<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f0f0f0;"><div><h2>컨텐츠를 로드할 수 없습니다</h2></div></body></html>'}
          className="w-full h-full border-0"
          title={name}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation allow-modals"
          style={{
            // iframe이 부모 쿠키에 접근 못하도록 제한
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}
