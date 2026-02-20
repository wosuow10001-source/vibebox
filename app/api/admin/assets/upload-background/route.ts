// app/api/admin/assets/upload-background/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    }

    // File을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloudinary에 업로드
    const result = await uploadToCloudinary(buffer, "vibebox/backgrounds");

    console.log(`✅ 배경 이미지 업로드: ${result.url}`);

    return NextResponse.json({ 
      success: true,
      url: result.url,
      publicId: result.publicId,
      size: buffer.length,
    });
  } catch (error) {
    console.error("❌ 배경 이미지 업로드 오류:", error);
    return NextResponse.json(
      { error: `업로드 실패: ${error instanceof Error ? error.message : "알 수 없음"}` },
      { status: 500 }
    );
  }
}
