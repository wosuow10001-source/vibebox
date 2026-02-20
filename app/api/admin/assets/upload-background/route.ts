// app/api/admin/assets/upload-background/route.ts
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const contentId = formData.get('contentId') as string;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다" },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // 파일을 Buffer로 변환
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;

    // Cloudinary에 낰경 사진 업로드
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: contentId ? `vibebox/backgrounds/${contentId}/bg` : 'vibebox/backgrounds/default',
          resource_type: 'image',
          overwrite: true,
          folder: 'vibebox-backgrounds',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const upload = uploadResult as any;

    console.log("✅ 배경 사진 업로드 성공: ${upload.url}");

    // 성공 응답
    return NextResponse.json(
      {
        success: true,
        url: upload.secure_url,
        publicId: upload.public_id,
        size: buffer.length,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error("❌ 배경 업로드 실패:", error);
    return NextResponse.json(
      {
        error: `배경 업로드 실패: ${error instanceof Error ? error.message : '알 수 없음'}`,
      },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
