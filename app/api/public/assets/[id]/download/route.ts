import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // DEV 모드: 파일 시스템에서 직접 제공
    if (process.env.DEV_LOGIN === "true") {
      const uploadDir = join(process.cwd(), "public", "uploads");
      const assetPath = join(uploadDir, id);

      // 보안: 상위 디렉토리 접근 방지
      if (!assetPath.startsWith(uploadDir)) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      try {
        const files = await fs.readdir(assetPath);
        
        // 파일 선택 우선순위
        let targetFile = "";
        
        // 1. index.* 파일 (html, mp4, webm, mov 등)
        const indexFile = files.find(f => f.startsWith("index."));
        if (indexFile) {
          targetFile = indexFile;
        } else if (files.length > 0) {
          // 2. 첫 번째 파일
          targetFile = files[0];
        }

        if (!targetFile) {
          return NextResponse.json(
            { error: "No files in asset" },
            { status: 404 }
          );
        }

        const filePath = join(assetPath, targetFile);
        const fileBuffer = await fs.readFile(filePath);
        const ext = targetFile.split(".").pop()?.toLowerCase() || "";

        // MIME 타입 맵
        const mimeMap: Record<string, string> = {
          html: "text/html",
          htm: "text/html",
          mp4: "video/mp4",
          webm: "video/webm",
          mov: "video/quicktime",
          avi: "video/x-msvideo",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
          svg: "image/svg+xml",
          pdf: "application/pdf",
        };

        const mimeType = mimeMap[ext] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=3600",
            "Content-Length": fileBuffer.length.toString(),
          },
        });
      } catch (err: any) {
        console.error("File read error:", err);
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
    }

    // 프로덕션: DB에서 조회 (구현 필요시)
    return NextResponse.json(
      { error: "Not implemented for production" },
      { status: 501 }
    );
  } catch (error: any) {
    console.error("Asset download error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
