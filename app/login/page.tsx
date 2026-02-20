// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('strong-initial-password-123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '로그인 실패');
        return;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎛️ Vibebox</h1>
          <p className="text-gray-600">관리자 로그인</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '🚀 로그인'}
          </button>
        </form>

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
        </div>
      </div>
    </div>
  );
}
