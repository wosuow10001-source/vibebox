// lib/storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;
const CDN_BASE = process.env.CDN_BASE_URL!;

export async function getPresignedUploadUrl({
  key,
  mimeType,
  expiresIn = 300,
}: {
  key: string;
  mimeType: string;
  expiresIn?: number;
}) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn });
  const cdnUrl = `${CDN_BASE}/${key}`;
  return { uploadUrl, cdnUrl };
}

export async function getPresignedReadUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function deleteObject(key: string) {
  // 삭제는 선택사항 (boto3 사용 시 구현)
  console.log("Delete object:", key);
}
