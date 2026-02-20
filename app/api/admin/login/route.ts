import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'strong-initial-password-123';

// 간단한 토큰 생성
function generateToken(email: string) {
  const payload = JSON.stringify({ email, role: 'admin', iat: Math.floor(Date.now() / 1000) });
  return Buffer.from(payload).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 간단한 인증
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = generateToken(email);
      return NextResponse.json({ token, email }, { status: 200 });
    }

    return NextResponse.json(
      { error: '이메일 또는 비밀번호가 틀렸습니다' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
