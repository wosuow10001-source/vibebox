// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";

// JWT_SECRET 기본값 (개발 환경용) - 프로덕션은 반드시 .env 설정
const secretKey = process.env.JWT_SECRET || "dev-secret-key-change-in-production-12345";
const secret = new TextEncoder().encode(secretKey);

console.log(`🔐 JWT initialized with key: ${secretKey.substring(0, 20)}...`);

export async function signToken(payload: Record<string, unknown>) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);
    console.log("✅ Token created successfully");
    return token;
  } catch (error) {
    console.error("❌ Token creation failed:", error);
    throw error;
  }
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    console.log("✅ Token verified successfully");
    return payload;
  } catch (error) {
    console.error("⚠️ Token verification failed:", error);
    return null;
  }
}

export const hashPassword = async (pw: string) => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(pw, 12);
};

export const comparePassword = async (pw: string, hash: string) => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(pw, hash);
};
