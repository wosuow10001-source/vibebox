// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 동적 설정 - 함수 호출 시점에 초기화
function initCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not defined');
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error('CLOUDINARY_API_KEY is not defined');
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_API_SECRET is not defined');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export default cloudinary;

// 파일을 Cloudinary에 업로드
export async function uploadToCloudinary(
  file: Buffer,
  folder: string = 'vibebox'
): Promise<{ url: string; publicId: string }> {
  // 각 호출 시점에 설정 초기화
  initCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );
    uploadStream.end(file);
  });
}

// Cloudinary에서 파일 삭제
export async function deleteFromCloudinary(publicId: string) {
  try {
    // 설정 초기화
    initCloudinary();
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error);
  }
}
