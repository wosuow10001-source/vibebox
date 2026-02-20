// app/api/admin/assets/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 300; // 5분

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function PUT(req: NextRequest) {
  try {
    const searchParams = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "잘못된 key 형식" },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // 파일 데이터 읽기
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const size = buffer.length;

    // 파일 이름 추출
    const fileName = key.split("/").slice(1).join("/");
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    if (!fileName) {
      return NextResponse.json(
        { error: "파일명이 없습니다" },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // 파일 타입 판별
    function determineResourceType(fileExt: string): 'image' | 'video' | 'raw' {
      if (/mp4|webm|mov|avi|mkv/.test(fileExt)) return 'video';
      if (/jpg|jpeg|png|gif|webp|svg/.test(fileExt)) return 'image';
      return 'raw';
    }

    const resourceType = determineResourceType(ext);
    const publicId = key.replace(/^([^\/]+)\/(.*?)(?:\.[^\.]+)?$/, '$1/$2');

    // Cloudinary에 업로드 (Buffer 사용)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          overwrite: true,
          folder: 'vibebox-assets',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const upload = uploadResult as any;

    // 성공 응답
    return NextResponse.json(
      {
        success: true,
        key,
        size,
        url: upload.secure_url,
        cloudinaryUrl: upload.secure_url,
        public_id: upload.public_id,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      {
        error: `업로드 실패: ${error instanceof Error ? error.message : '알 수 없음'}`,
      },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
