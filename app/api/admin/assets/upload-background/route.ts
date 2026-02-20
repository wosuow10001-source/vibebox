// app/api/admin/assets/upload-background/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 300;

export async function OPTIONS() {
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
    
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: "JSON 데이터가 필요합니다" },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const body = await req.json();
    const { file, contentId } = body;

    if (!file || !contentId) {
      return NextResponse.json(
        { error: "파일 또는 contentId가 없습니다" },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Base64 데이터로부터 Buffer 만들기
    const base64String = file.split(',')[1] || file;
    const buffer = Buffer.from(base64String, 'base64');

    // Cloudinary 업로드
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: `vibebox/backgrounds/${contentId}`,
          resource_type: 'image',
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
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
    console.error("❌ Background upload error:", error);
    return NextResponse.json(
      {
        error: `배경 업로드 실패: ${error.message || '알 수 없음'}`,
      },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
