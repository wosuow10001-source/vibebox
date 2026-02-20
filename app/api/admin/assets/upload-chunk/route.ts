// app/api/admin/assets/upload-chunk/route.ts
// 청크 업로드 API - 대용량 파일을 작은 조각으로 나눠서 업로드
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { mkdirSync, appendFileSync, unlinkSync, writeFileSync, readFileSync } from "fs";

const UPLOAD_DIR = "public/uploads";
const TEMP_DIR = "public/uploads/.temp";

// 임시 디렉터리 생성
mkdirSync(TEMP_DIR, { recursive: true });

// Next.js 15 App Router: 바디 크기 제한 설정
export const maxDuration = 300; // 5분 타임아웃
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const chunk = formData.get('chunk') as Blob;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const fileName = formData.get('fileName') as string;
    const assetId = formData.get('assetId') as string;

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !fileName || !assetId) {
      return NextResponse.json(
        { error: '필수 파라미터 누락' },
        { status: 400 }
      );
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
    const tempFilePath = join(TEMP_DIR, `${assetId}.tmp`);
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());

    // 청크를 임시 파일에 추가
    appendFileSync(tempFilePath, chunkBuffer);

    console.log(`📦 청크 ${chunkIndex + 1}/${totalChunks} 수신 완료 (${chunkBuffer.length} bytes)`);

    // 마지막 청크인 경우 최종 파일로 이동
    if (chunkIndex === totalChunks - 1) {
      const finalDir = join(UPLOAD_DIR, assetId);
      mkdirSync(finalDir, { recursive: true });
      
      const finalPath = join(finalDir, `index.${ext}`);
      
      // 임시 파일을 최종 위치로 이동
      const tempBuffer = readFileSync(tempFilePath);
      writeFileSync(finalPath, tempBuffer);
      unlinkSync(tempFilePath);

      console.log(`✅ 파일 업로드 완료: ${finalPath} (${tempBuffer.length} bytes)`);

      // 파일 타입 결정
      function determineContentType(fileExt: string) {
        if (/mp4|webm|mov|avi/.test(fileExt)) return 'VIDEO';
        if (/html|htm/.test(fileExt)) return 'HTML_APP';
        if (/zip|tar|gz/.test(fileExt)) return 'PROJECT';
        if (/jpg|jpeg|png|gif|webp|svg/.test(fileExt)) return 'IMAGE';
        if (/exe|app|dmg|apk/.test(fileExt)) return 'GAME';
        return 'POST';
      }

      const contentType = determineContentType(ext);
      const baseSlug = fileName
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const slug = (!baseSlug || baseSlug === 'index' || baseSlug === 'file')
        ? `${contentType.toLowerCase()}-${assetId.slice(-6)}`
        : baseSlug;

      // ⚠️ 자동 콘텐츠 생성 제거: 사용자가 콘텐츠 생성 페이지에서 직접 생성하도록 함
      // upload-direct 페이지는 자체적으로 콘텐츠를 생성하므로 여기서는 생성하지 않음

      return NextResponse.json({
        success: true,
        complete: true,
        url: `/uploads/${assetId}/index.${ext}`,
        size: tempBuffer.length,
      });
    }

    // 중간 청크는 성공 응답만
    return NextResponse.json({
      success: true,
      complete: false,
      chunkIndex,
    });
  } catch (error) {
    console.error("❌ 청크 업로드 오류:", error);
    return NextResponse.json(
      { error: `업로드 실패: ${error instanceof Error ? error.message : '알 수 없음'}` },
      { status: 500 }
    );
  }
}
