// app/api/admin/assets/presign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

const ALLOWED_MIMES: Record<string, string[]> = {
  image: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ],
  video: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
  ],
  zip: [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/gzip",
    "application/x-tar",
    "text/html",
    "text/plain",
  ],
  html: [
    "text/html",
    "application/zip",
  ],
  executable: [
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/octet-stream",
  ],
  doc: ["application/pdf", "text/plain"],
};

const ALL_ALLOWED = Object.values(ALLOWED_MIMES).flat();
const MAX_SIZES: Record<string, number> = {
  video: 2000 * 1024 * 1024,      // 2GB
  html_app: 500 * 1024 * 1024,    // 500MB
  project: 1000 * 1024 * 1024,    // 1GB
  game: 1500 * 1024 * 1024,       // 1.5GB
  image: 100 * 1024 * 1024,       // 100MB
  uploads: 500 * 1024 * 1024,     // 500MB
};

export async function POST(req: NextRequest) {
  try {
    const { fileName, mimeType: rawMimeType, fileSize, category = "uploads" } =
      await req.json();

    // mimeType may be empty from some file inputs; infer from extension when missing
    const inferredExt = (fileName || '').split('.').pop()?.toLowerCase() || '';
    const mimeType = rawMimeType || (inferredExt === 'html' || inferredExt === 'htm' ? 'text/html' : (inferredExt === 'zip' ? 'application/zip' : rawMimeType || 'application/octet-stream'));

    console.log(`📥 Presign request: ${fileName} (${mimeType})`);

    if (!fileName || !fileSize) {
      console.warn("❌ Missing file info");
      return NextResponse.json(
        { error: "파일 정보 누락" },
        { status: 400 }
      );
    }
    if (!ALL_ALLOWED.includes(mimeType)) {
      console.warn(`❌ Unsupported MIME type: ${mimeType}`);
      return NextResponse.json(
        { error: `허용되지 않는 파일 형식: ${mimeType}` },
        { status: 400 }
      );
    }

    const maxSize = MAX_SIZES[category] || 500 * 1024 * 1024;
    if (fileSize > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      console.warn(`❌ File too large: ${fileSize} > ${maxSize}`);
      return NextResponse.json(
        { error: `파일 크기 초과 (최대 ${maxMB}MB)` },
        { status: 400 }
      );
    }

    const ext = fileName.split(".").pop()?.toLowerCase() || "bin";

    // 먼저 Asset 레코드를 생성한 뒤 실제 storageKey를 assetId 기반으로 설정합니다.
    try {
      console.log(`📝 Creating Asset record (placeholder): ${fileName}`);
      // placeholder로 임시 생성
      const placeholder = await prisma.asset.create({
        data: {
          storageKey: '',
          originalName: fileName,
          mime: mimeType,
          size: fileSize,
          publicFlag: true,
          cdnUrl: '',
        },
      });

      const storageKey = `${placeholder.id}/index.${ext}`;
      const cdnUrl = process.env.DEV_LOGIN === "true"
        ? `/uploads/${placeholder.id}/index.${ext}`
        : `https://cdn.example.com/${storageKey}`;

      // 실제 storageKey, cdnUrl 업데이트
      const asset = await prisma.asset.update({
        where: { id: placeholder.id },
        data: { storageKey, cdnUrl },
      });
      console.log(`✅ Asset created: ${asset.id} -> ${storageKey}`);

      // 콘텐츠 자동 생성 (파일명에서 slug 생성)
      function generateSlug(fileName: string): string {
        return fileName
          .replace(/\.[^.]+$/, '') // 확장자 제거
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // 특수문자 제거
          .replace(/\s+/g, '-') // 공백을 대시로
          .replace(/-+/g, '-') // 중복 대시 제거
          .replace(/^-|-$/g, ''); // 양쪽 대시 제거
      }

      function determineContentType(fileExt: string) {
        if (/mp4|webm|mov|avi/.test(fileExt)) return 'VIDEO';
        if (/html|htm/.test(fileExt)) return 'HTML_APP';
        if (/zip|tar|gz/.test(fileExt)) return 'PROJECT';
        if (/jpg|jpeg|png|gif|webp|svg/.test(fileExt)) return 'IMAGE';
        if (/exe|app|dmg|apk/.test(fileExt)) return 'GAME';
        return 'POST';
      }

      const autoSlug = generateSlug(fileName);
      const contentType = determineContentType(ext);
      const contentTitle = autoSlug.replace(/-/g, ' ');

      // ⚠️ 자동 콘텐츠 생성 제거: 새 콘텐츠 작성 페이지에서 사용자가 직접 생성
      // presign API는 asset만 생성하고, 콘텐츠는 사용자가 저장 버튼을 눌렀을 때 생성됨
      console.log(`✅ Asset created without auto-content: ${asset.id}`);

      // DEV 모드: 업로드 URL 반환 (key는 storageKey)
      if (process.env.DEV_LOGIN === "true") {
        console.log("✅ DEV mode - returning mock presigned URL");
        
        // 현재 요청의 호스트를 사용하여 동적으로 URL 생성
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host') || 'localhost:3001';
        const uploadUrl = `${protocol}://${host}/api/admin/assets/upload?key=${encodeURIComponent(storageKey)}`;

        console.log(`📤 Upload URL: ${uploadUrl}`);

        return NextResponse.json({
          uploadUrl,
          storageKey,
          cdnUrl,
          assetId: asset.id,
        });
      }

      // 실제 S3 로직 (구현 필요)
      console.warn("⚠️ Production S3 upload not implemented");
      return NextResponse.json(
        { error: "업로드 서비스를 사용할 수 없습니다" },
        { status: 503 }
      );
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      // DEV 모드에서는 폴백으로 임의 assetId를 만들어 진행
      if (process.env.DEV_LOGIN === "true") {
        const fallbackId = `asset-${randomUUID()}`;
        const fallbackStorageKey = `${fallbackId}/index.${ext}`;
        const fallbackCdnUrl = `/uploads/${fallbackId}/index.${ext}`;
        
        // 현재 요청의 호스트를 사용하여 동적으로 URL 생성
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host') || 'localhost:3001';
        const uploadUrl = `${protocol}://${host}/api/admin/assets/upload?key=${encodeURIComponent(fallbackStorageKey)}`;
        
        return NextResponse.json({
          uploadUrl,
          storageKey: fallbackStorageKey,
          cdnUrl: fallbackCdnUrl,
          assetId: fallbackId,
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("❌ Presign error:", error);
    return NextResponse.json(
      { error: `업로드 URL 생성 실패: ${error instanceof Error ? error.message : '알 수 없음'}` },
      { status: 500 }
    );
  }
}
