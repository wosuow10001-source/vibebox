// app/api/admin/upload-html/route.ts
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

// ✅ 업로드 API: POST /api/admin/upload-html
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

    // 2️⃣ FormData 파싱
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3️⃣ HTML 파일 검증
    if (!file.type.includes("html") && !file.name.endsWith(".html")) {
      return NextResponse.json({ error: "Only HTML files are allowed" }, { status: 400 });
    }

    // 4️⃣ 파일 내용 읽기
    const htmlContent = await file.text();

    // 5️⃣ App 레코드 생성
    const app = await prisma.app.create({
      data: {
        name: file.name.replace(/\.html$/, ""),
        description: `Uploaded: ${new Date().toLocaleString()}`,
        htmlContent: htmlContent,
        publicPath: `/apps/${Math.random().toString(36).substring(7)}`,
        isActive: false,
      },
    });

    console.log(`✅ HTML App uploaded: ${app.id} → ${app.publicPath}`);

    return NextResponse.json(
      {
        appId: app.id,
        publicUrl: app.publicPath,
        name: app.name,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Upload HTML error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
