// app/api/admin/apps/activate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 토큰 디코딩 헬퍼
function decodeToken(token: string) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded;
  } catch {
    return null;
  }
}

// ✅ 앱 활성화: POST /api/admin/apps/activate
export async function POST(req: NextRequest) {
  try {
    // 1️⃣ 관리자 인증 확인
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = decodeToken(token);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    }

    // 2️⃣ 요청 본문 파싱
    const { appId } = await req.json();
    if (!appId) {
      return NextResponse.json({ error: "appId is required" }, { status: 400 });
    }

    // 3️⃣ 앱 존재 확인
    const app = await prisma.app.findUnique({
      where: { id: appId },
    });

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // 4️⃣ 모든 앱 비활성화 후 선택된 앱만 활성화
    await prisma.app.updateMany({
      data: { isActive: false },
    });

    const updatedApp = await prisma.app.update({
      where: { id: appId },
      data: { isActive: true },
    });

    console.log(`✅ App activated: ${appId}`);

    return NextResponse.json({
      appId: updatedApp.id,
      publicUrl: updatedApp.publicPath,
      name: updatedApp.name,
      isActive: updatedApp.isActive,
    });
  } catch (error: any) {
    console.error("❌ Activate app error:", error);
    return NextResponse.json(
      { error: error.message || "Activation failed" },
      { status: 500 }
    );
  }
}
