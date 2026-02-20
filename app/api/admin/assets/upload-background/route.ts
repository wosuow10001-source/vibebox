// app/api/admin/assets/upload-background/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 300;

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Content-Type 검증
    const contentType = req.headers.get('content-type') || '';
    
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'JSON 데이터가 필요합니다' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // 요청 body 파싱 - 에러 처리 강화
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('JSON 파싱 에러:', parseError);
      return NextResponse.json(
        { error: 'JSON 형식이 올바르지 않습니다' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // 필수 필드 검증
    const { file, contentId } = body;

    if (!file || !contentId) {
      console.error('필수 필드 누락:', { hasFile: !!file, hasContentId: !!contentId });
      return NextResponse.json(
        { error: '파일 또는 contentId가 없습니다' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // 파일 형식 검증 (Base64 문자열인지 확인)
    if (typeof file !== 'string' || file.length === 0) {
      console.error('파일 형식 오류:', { fileType: typeof file, fileLength: file?.length });
      return NextResponse.json(
        { error: '파일은 문자열 형식이어야 합니다' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Base64 데이터 추출 (data:image/... 형식에서 실제 Base64 부분만 추출)
    let base64String = file;
    
    if (file.includes(',')) {
      const parts = file.split(',');
      if (parts.length >= 2) {
        base64String = parts[1];
      }
    }

    // Base64 검증
    if (!/^[A-Za-z0-9+/=]+$/.test(base64String)) {
      console.error('Base64 형식 오류');
      return NextResponse.json(
        { error: '파일이 올바른 Base64 형식이 아닙니다' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Buffer로 변환
    let buffer;
    try {
      buffer = Buffer.from(base64String, 'base64');
    } catch (bufferError) {
      console.error('Buffer 변환 에러:', bufferError);
      return NextResponse.json(
        { error: 'Base64 디코딩 실패' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // 파일 크기 제한 (10MB)
    const maxFileSize = 10 * 1024 * 1024;
    if (buffer.length > maxFileSize) {
      console.error('파일 크기 초과:', buffer.length);
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다' },
        {
          status: 413,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Cloudinary 업로드
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: `vibebox/backgrounds/${contentId}`,
          resource_type: 'image',
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(buffer);
    });

    const upload = result as any;

    return NextResponse.json(
      {
        success: true,
        url: upload.secure_url,
      },
      {
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error: any) {
    console.error('배경 업로드 API 에러:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        error: `배경 업로드 실패: ${error?.message || '알 수 없음'}`,
      },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
