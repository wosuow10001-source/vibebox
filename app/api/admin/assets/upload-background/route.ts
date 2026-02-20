// app/api/admin/assets/upload-background/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const maxDuration = 300;

// Get environment variables safely
function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Missing Cloudinary environment variables:', {
      cloudName: cloudName ? 'present' : 'MISSING',
      apiKey: apiKey ? 'present' : 'MISSING',
      apiSecret: apiSecret ? 'present' : 'MISSING',
    });
    throw new Error('Cloudinary environment variables not configured');
  }

  return { cloudName, apiKey, apiSecret };
}

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
    // Get and validate Cloudinary config
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    // Configure Cloudinary with environment variables
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log('Cloudinary configured successfully', { cloudName });

    const contentType = req.headers.get('content-type') || '';
    let file: Buffer | null = null;
    let contentId = '';

    // Support FormData from client
    if (contentType.includes('multipart/form-data')) {
      console.log('Processing FormData request...');
      const formData = await req.formData();
      const fileData = formData.get('file');

      if (fileData && typeof fileData === 'object' && 'arrayBuffer' in fileData) {
        file = Buffer.from(await (fileData as any).arrayBuffer());
        contentId = `thumbnail-${Date.now()}`;
        console.log('File processed successfully:', { fileSize: file.length, contentId });
      } else {
        console.error('File not found in FormData');
        return NextResponse.json(
          { error: 'File not found in FormData' },
          {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
    }
    // Support JSON with base64
    else if (contentType.includes('application/json')) {
      console.log('Processing JSON request...');
      const body = await req.json();
      const base64String = body.file;
      const contentIdParam = body.contentId;

      if (!base64String) {
        console.error('Base64 file data not provided');
        return NextResponse.json(
          { error: 'File data not provided' },
          {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }

      try {
        file = Buffer.from(base64String, 'base64');
        contentId = contentIdParam || `thumbnail-${Date.now()}`;
        console.log('Base64 decoded successfully:', { fileSize: file.length, contentId });
      } catch (bufferError) {
        console.error('Buffer conversion error:', bufferError);
        return NextResponse.json(
          { error: 'Base64 decoding failed' },
          {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
    } else {
      console.error('Unsupported Content-Type:', contentType);
      return NextResponse.json(
        { error: 'Use JSON or FormData format' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // File validation
    if (!file || file.length === 0) {
      console.error('File is empty');
      return NextResponse.json(
        { error: 'File is empty' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // File size limit (10MB)
    const maxFileSize = 10 * 1024 * 1024;
    if (file.length > maxFileSize) {
      console.error('File size exceeded:', file.length);
      return NextResponse.json(
        { error: 'File size must be under 10MB' },
        {
          status: 413,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Upload to Cloudinary
    console.log('Starting Cloudinary upload:', {
      contentId,
      fileSize: file.length,
      cloudName,
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: `vibebox/backgrounds/${contentId}`,
          resource_type: 'image',
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload failed:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', result?.public_id);
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
    console.error('Background upload API error:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return NextResponse.json(
      {
        error: `Background upload failed: ${error?.message || 'Unknown error'}`,
      },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
