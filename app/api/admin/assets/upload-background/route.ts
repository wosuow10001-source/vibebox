// app/api/admin/assets/upload-background/route.ts
// 배경 이미지 전용 업로드 (콘텐츠로 저장하지 않음)
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";

const UPLOAD_DIR = "public/uploads/backgrounds";

// 배경 이미지 디렉터리 생성
mkdirSync(UPLOAD_DIR, { recursive: true });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      );
    }

    // 파일 데이터 읽기
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 고유한 파일명 생성
    const fileId = randomUUID();
    const ext = (file as File).name?.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `bg-${fileId}.${ext}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // 파일 저장
    writeFileSync(filePath, buffer);

    console.log(`✅ 배경 이미지 저장: ${filePath} (${buffer.length} bytes)`);

    // URL 반환 (콘텐츠로 저장하지 않음)
    const url = `/uploads/backgrounds/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
      size: buffer.length,
    });
  } catch (error) {
    console.error("❌ 배경 이미지 업로드 오류:", error);
    return NextResponse.json(
      { error: `업로드 실패: ${error instanceof Error ? error.message : '알 수 없음'}` },
      { status: 500 }
    );
  }
}
