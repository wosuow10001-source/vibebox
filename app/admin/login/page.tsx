// app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('strong-initial-password-123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devMode] = useState(true);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '로그인 실패');
        if (data.hint) {
          setError((prev) => `${prev}\n💡 ${data.hint}`);
        }
        return;
      }

      // ✅ 토큰을 localStorage에 저장 (관리자 페이지에서 사용)
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('네트워크 오류 발생');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@example.com');
    setPassword('strong-initial-password-123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎛️ Vibebox</h1>
          <p className="text-gray-600">관리자 로그인</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm whitespace-pre-wrap">
              ❌ {error}
            </div>
          )}

          {/* 개발 모드 안내 */}
          {devMode && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg text-xs">
              <p className="font-semibold mb-2">💡 개발 모드 (DEV_LOGIN=true)</p>
              <p>데이터베이스 없이도 로그인 가능합니다.</p>
            </div>
          )}

          {/* 이메일 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📧 이메일
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔑 비밀번호
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '🚀 로그인'}
          </button>
        </form>

        {/* 기본값 복원 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-xs mb-3">
            기본 계정 정보 지우셨나요?
          </p>
          <button
            onClick={fillDemoCredentials}
            className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            기본 계정 복원
          </button>
        </div>

        {/* 정보 박스 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-5 text-xs text-gray-700 space-y-2">
          <div className="font-semibold text-gray-900 mb-3">📋 기본 계정</div>
          <div>
            <span className="font-medium">이메일:</span>
            <div className="bg-white px-2 py-1 rounded mt-1 font-mono text-gray-900">
              admin@example.com
            </div>
          </div>
          <div>
            <span className="font-medium">비밀번호:</span>
            <div className="bg-white px-2 py-1 rounded mt-1 font-mono text-gray-900">
              strong-initial-password-123
            </div>
          </div>
          <div className="pt-3 border-t border-gray-200 mt-3">
            <p className="text-gray-600">
              💾 <strong>데이터베이스 연결 후:</strong> Prisma seed로 관리자 계정 생성
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
