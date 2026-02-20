// app/api/admin/assets/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { mkdirSync, writeFileSync, readFileSync } from "fs";

const UPLOAD_DIR = "public/uploads";

// Next.js 15 App Router: 바디 크기 제한 설정
export const maxDuration = 300; // 5분 타임아웃
export const dynamic = 'force-dynamic';

// CORS preflight 처리
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Content-Length',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      console.warn("❌ No key provided for upload");
      return NextResponse.json(
        { error: "파일 키 누락" },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // DEV 모드: 파일을 실제로 public/uploads/{assetId}/index.html로 저장
    if (process.env.DEV_LOGIN === "true") {
      const contentLength = req.headers.get("content-length");
      const size = contentLength ? parseInt(contentLength) : 0;
      const assetId = key.split("/")[0];
      const fileName = key.split("/").slice(1).join("/");
      if (!assetId || !fileName) {
        return NextResponse.json(
          { error: "잘못된 key 형식" }, 
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
      // 파일 데이터 읽기
      const arrayBuffer = await req.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // 디렉터리 생성
      const dirPath = join(UPLOAD_DIR, assetId);
      mkdirSync(dirPath, { recursive: true });
      // 파일 저장 (예: public/uploads/{assetId}/index.html)
      const filePath = join(dirPath, fileName);
      writeFileSync(filePath, buffer);
      
      // 파일 타입 결정
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
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
      
      // slug가 너무 generic하면 assetId로 unique하게 만듦
      const slug = (!baseSlug || baseSlug === 'index' || baseSlug === 'file') 
        ? `${contentType.toLowerCase()}-${assetId.slice(-6)}`
        : baseSlug;
      
      // ⚠️ 자동 콘텐츠 생성 제거: 사용자가 콘텐츠 생성 페이지에서 직접 생성하도록 함
      // 이렇게 하면 중복 콘텐츠가 생성되지 않음
      
      return NextResponse.json(
        {
          success: true,
          key,
          size,
          url: `/uploads/${assetId}/${fileName}`,
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // 실제 S3 업로드 (구현 필요)
    console.warn("⚠️ Production S3 upload not implemented");
    return NextResponse.json(
      { error: "업로드 서비스를 사용할 수 없습니다" },
      { 
        status: 503,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { error: `업로드 실패: ${error instanceof Error ? error.message : '알 수 없음'}` },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "파일 키 누락" },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // DEV 모드에서는 파일 정보 반환
    return NextResponse.json(
      { success: true, key },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error("❌ GET error:", error);
    return NextResponse.json(
      { error: "요청 실패" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
