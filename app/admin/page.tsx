// app/admin/page.tsx
'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">📊 대시보드</h2>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 콘텐츠 카드 */}
          <Link
            href="/admin/content"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-blue-500"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900">콘텐츠</h3>
            <p className="text-gray-600 text-sm mt-2">게시글, 앱, 프로젝트 관리</p>
          </Link>

          {/* 직접 영상 업로드 카드 */}
          <Link
            href="/admin/upload-direct"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-red-500"
          >
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-gray-900">영상 업로드</h3>
            <p className="text-gray-600 text-sm mt-2">대용량 영상 직접 업로드 (최대 2GB)</p>
          </Link>

          {/* 파일 카드 */}
          <Link
            href="/admin/assets"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-green-500"
          >
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-gray-900">파일</h3>
            <p className="text-gray-600 text-sm mt-2">이미지, 영상 업로드</p>
          </Link>

          {/* 파일 업로드 카드 */}
          <Link
            href="/admin/upload"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-orange-500"
          >
            <div className="text-4xl mb-4">📥</div>
            <h3 className="text-xl font-bold text-gray-900">파일 업로드</h3>
            <p className="text-gray-600 text-sm mt-2">영상, 앱, 프로젝트, 게임</p>
          </Link>

          {/* 설정 카드 */}
          <Link
            href="/admin/site-settings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-purple-500"
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-gray-900">사이트 설정</h3>
            <p className="text-gray-600 text-sm mt-2">디자인, 메뉴, 버튼 편집</p>
          </Link>

          {/* 수익화 카드 */}
          <Link
            href="/admin/monetization"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-yellow-500"
          >
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900">수익화</h3>
            <p className="text-gray-600 text-sm mt-2">광고 슬롯 관리</p>
          </Link>

          {/* 메인 미리보기 */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-indigo-500"
          >
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-bold text-gray-900">메인 미리보기</h3>
            <p className="text-gray-600 text-sm mt-2">공개 사이트 보기 (새창)</p>
          </a>

          {/* 문서 */}
          <a
            href="/README.md"
            target="_blank"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-gray-500"
          >
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900">문서</h3>
            <p className="text-gray-600 text-sm mt-2">사용 설명서</p>
          </a>
        </div>

        {/* 정보 박스 */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">🚀 시작하기</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-2">
            <li>
              <strong>사이트 설정</strong>에서 제목, 로고, 색상, 메뉴 구성
            </li>
            <li>
              <strong>콘텐츠 관리</strong>에서 첫 게시글/앱 작성
            </li>
            <li>
              <strong>파일 관리</strong>에서 이미지 및 동영상 업로드
            </li>
            <li>
              <strong>수익화</strong>에서 광고/배너/쿠폰 슬롯 설정
            </li>
          </ol>
        </div>

        {/* API 정보 */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📡 API 엔드포인트</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono text-gray-700">
            <div className="bg-white p-3 rounded">POST /api/admin/content</div>
            <div className="bg-white p-3 rounded">GET /api/admin/content</div>
            <div className="bg-white p-3 rounded">POST /api/admin/monetization</div>
            <div className="bg-white p-3 rounded">GET /api/public/slots</div>
          </div>
        </div>
      </div>
    </div>
  );
}
