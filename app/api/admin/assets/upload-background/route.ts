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
    const contentType = req.headers.get('content-type') || '';
    let file: Buffer | null = null;
    let contentId = '';

    // FormData 지원 (clien
ide에서 렣던 데이터)
    if (contentType.includes('multipart/form-data')) {
      console.log('FormData 요청 춘리 중...');
      const formData = await req.formData();
      const fileData = formData.get('file');
      
      if (fileData instanceof File) {
        file = Buffer.from(await fileData.arrayBuffer());
        contentId = `thumbnail-${Date.now()}`;
        console.log('파일 및 contentId 추출:', { fileSize: file.length, contentId });
      } else {
        console.error('FormData에서 파일을 찾을 수 없습니다');
        return NextResponse.json(
          { error: 'FormData에 파일이 없습니다' },
          {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
    }
    // JSON 지원 (base64 데이터)
    else if (contentType.includes('application/json')) {
      console.log('JSON 지원 데이터 처리 중...');
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

      const { file: fileData, contentId: contentIdParam } = body;

      if (!fileData || !contentIdParam) {
        console.error('필수 필드 누락:', { hasFile: !!fileData, hasContentId: !!contentIdParam });
        return NextResponse.json(
          { error: '파일 또는 contentId가 없습니다' },
          {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }

      if (typeof fileData !== 'string' || fileData.length === 0) {
        console.error('파일 형식 오류:', { fileType: typeof fileData });
        return NextResponse.json(
          { error: '파일은 문자열 형식이어야 합니다' },
          {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }

      let base64String = fileData;
      if (fileData.includes(',')) {
        const parts = fileData.split(',');
        if (parts.length >= 2) {
          base64String = parts[1];
        }
      }

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

      try {
        file = Buffer.from(base64String, 'base64');
        contentId = contentIdParam;
        console.log('Base64 디코드 성공:', { fileSize: file.length, contentId });
      } catch (bufferError) {
        console.error('Buffer 변환 에러:', bufferError);
        return NextResponse.json(
          { error: 'Base64 디코등 실패' },
          {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
    } else {
      console.error('지원되지 않는 Content-Type:', contentType);
      return NextResponse.json(
        { error: 'JSON 또는 FormData 형식을 젪c용해주세요' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // 파일 검증
    if (!file || file.length === 0) {
      console.error('파일이 비어 있습니다');
      return NextResponse.json(
        { error: '파일띴 비어 있습니다' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // 파일 크기 제한 (10MB)
    const maxFileSize = 10 * 1024 * 1024;
    if (file.length > maxFileSize) {
      console.error('파일 크기 초과:', file.length);
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다' },
        {
          status: 413,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Cloudinary 업로드
    console.log('Cloudinary 업로드 시작:', { contentId, fileSize: file.length });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: `vibebox/backgrounds/${contentId}`,
          resource_type: 'image',
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary 업로드 실패:', error);
            reject(error);
          } else {
            console.log('Cloudinary 업로드 성공:', result);
            resolve(result);
          }
        }
      );

      stream.end(file);
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
