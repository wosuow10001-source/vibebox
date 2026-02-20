// app/api/apps/current/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ 현재 활성 앱 조회: GET /api/apps/current
export async function GET(req: NextRequest) {
  try {
    const app = await prisma.app.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!app) {
      return NextResponse.json(
        { error: "No active app found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      appId: app.id,
      name: app.name,
      publicUrl: app.publicPath,
      htmlContent: app.htmlContent, // 클라이언트가 필요시 사용
    });
  } catch (error: any) {
    console.error("❌ Get current app error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch current app" },
      { status: 500 }
    );
  }
}
