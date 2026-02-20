// app/api/public/assets/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import { join } from "path";

// ✅ 공개 자산 목록 조회: GET /api/public/assets/list
export async function GET(req: NextRequest) {
  try {
    // DEV 모드: 파일 시스템에서 직접 자산 스캔
    if (process.env.DEV_LOGIN === "true") {
      try {
        const uploadDir = join(process.cwd(), "public", "uploads");
        const entries = await fs.readdir(uploadDir, { withFileTypes: true });

        const assets = [];
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;

          const assetId = entry.name;
          const assetPath = join(uploadDir, assetId);
          const files = await fs.readdir(assetPath);

          for (const file of files) {
            const filePath = join(assetPath, file);
            const stat = await fs.stat(filePath);

            // MIME 타입 추론
            const ext = file.split(".").pop()?.toLowerCase() || "bin";
            const mimeMap: Record<string, string> = {
              html: "text/html",
              htm: "text/html",
              pdf: "application/pdf",
              jpg: "image/jpeg",
              jpeg: "image/jpeg",
              png: "image/png",
              gif: "image/gif",
              webp: "image/webp",
              svg: "image/svg+xml",
              mp4: "video/mp4",
              webm: "video/webm",
              mov: "video/quicktime",
              zip: "application/zip",
              txt: "text/plain",
            };

            assets.push({
              id: assetId,
              name: file,
              mime: mimeMap[ext] || "application/octet-stream",
              size: stat.size,
              cdnUrl: `/api/public/assets/${assetId}/view`,
              publicUrl: `/api/public/assets/${assetId}/view`,
              createdAt: stat.birthtime || new Date(),
              content: null,
              storageKey: `${assetId}/${file}`,
            });
          }
        }

        // 최신순 정렬
        assets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return NextResponse.json(assets);
      } catch (fsErr: any) {
        console.warn("⚠️ File system error:", fsErr?.message);
        return NextResponse.json([]);
      }
    }

    // 프로덕션: DB에서 조회
    try {
      const assets = await prisma.asset.findMany({
        where: { publicFlag: true },
        orderBy: { createdAt: "desc" },
        include: {
          content: {
            select: {
              id: true,
              title: true,
              type: true,
              slug: true,
            },
          },
        },
      });

      const formattedAssets = assets.map((asset) => ({
        id: asset.id,
        name: asset.originalName,
        mime: asset.mime,
        size: asset.size,
        cdnUrl: asset.cdnUrl || `/api/public/assets/${asset.id}/view`,
        publicUrl: `/api/public/assets/${asset.id}/view`,
        createdAt: asset.createdAt,
        content: asset.content,
        storageKey: asset.storageKey,
      }));

      return NextResponse.json(formattedAssets);
    } catch (dbError: any) {
      console.warn("⚠️ Database query error (returning empty list):", dbError?.message);
      return NextResponse.json([]);
    }
  } catch (error: any) {
    console.error("❌ List assets error:", error);
    return NextResponse.json([]);
  }
}
