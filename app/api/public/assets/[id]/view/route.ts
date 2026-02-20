// app/api/public/assets/[id]/view/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import { join } from "path";

// ✅ 자산 열기/다운로드: GET /api/public/assets/{id}/view
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1️⃣ 자산 정보 조회 (데이터베이스가 없어도 작동)
    let asset: any = null;
    try {
      asset = await prisma.asset.findUnique({
        where: { id },
      });
    } catch (dbErr) {
      console.warn("⚠️ Database error (using asset info from ID):", dbErr);
      // DB 실패 시 ID에서 storageKey 유추
    }

    if (!asset && process.env.DEV_LOGIN !== "true") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // 2️⃣ 파일 읽기 (public/uploads/{assetId}/... 경로)
    try {
      const assetId = id;
      // storageKey 형식: {assetId}/index.{ext}
      let filePath = join(process.cwd(), "public", "uploads", assetId);
      
      // 디렉토리인 경우 index.html을 찾기
      try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          // index.html 또는 index.{ext} 찾기
          const files = await fs.readdir(filePath);
          const indexFile = files.find(f => f.startsWith('index.'));
          if (indexFile) {
            filePath = join(filePath, indexFile);
          } else if (files.length > 0) {
            // 첫 번째 파일 사용
            filePath = join(filePath, files[0]);
          }
        }
      } catch (statErr) {
        // 단일 파일이거나 다른 경로 구조
      }

      const fileContent = await fs.readFile(filePath);

      // 3️⃣ 파일 타입 결정
      const ext = filePath.split('.').pop()?.toLowerCase() || 'bin';
      const mimeMap: Record<string, string> = {
        'html': 'text/html; charset=utf-8',
        'htm': 'text/html; charset=utf-8',
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime',
        'zip': 'application/zip',
        'txt': 'text/plain; charset=utf-8',
      };

      const mimeType = mimeMap[ext] || (asset?.mime || 'application/octet-stream');

      return new NextResponse(fileContent, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline${ext === 'pdf' || ext === 'html' || ext === 'htm' ? '' : `; filename="${asset?.originalName || 'file'}.${ext}"`}`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (fileErr: any) {
      console.error("❌ File read error:", fileErr?.message);
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("❌ View asset error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch asset" },
      { status: 500 }
    );
  }
}
