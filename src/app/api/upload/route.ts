import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import path from 'path';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate admin session
    const token = cookies().get('admin_token')?.value;
    const session = token ? await verifyAdminToken(token) : null;
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    // 2. Validate Vercel Blob token configuration
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.error('[Upload Error] BLOB_READ_WRITE_TOKEN environment variable is not configured.');
      return NextResponse.json(
        { error: 'Vercel Blob Storage is not configured. BLOB_READ_WRITE_TOKEN is missing.' },
        { status: 500 }
      );
    }

    const contentType = req.headers.get('content-type') || '';

    // 3. Handle multipart/form-data upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      // Check file size limit (10MB)
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File size exceeds maximum allowed limit (10MB)' },
          { status: 400 }
        );
      }

      // Check file extension and MIME type
      const rawExt = path.extname(file.name).toLowerCase();
      const ext = rawExt || (file.type.includes('png') ? '.png' : file.type.includes('webp') ? '.webp' : '.jpg');
      const mimeType = file.type.toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(mimeType)) {
        return NextResponse.json(
          { error: 'Unsupported file format. Only PNG, JPG, JPEG, and WebP images are allowed.' },
          { status: 400 }
        );
      }

      // Construct safe unique filename
      const cleanName = path
        .basename(file.name, rawExt)
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .toLowerCase() || 'product';
      const fileName = `products/${Date.now()}-${cleanName}${ext}`;

      // Upload directly to Vercel Blob Storage
      const blob = await put(fileName, file, {
        access: 'public',
        token: blobToken,
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        fileName: blob.pathname,
      });
    }

    // 4. Handle JSON dataUrl upload (base64)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      if (!body.dataUrl) {
        return NextResponse.json({ error: 'dataUrl or file required' }, { status: 400 });
      }

      const matches = body.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: 'Invalid base64 dataUrl string' }, { status: 400 });
      }

      const mimeType = matches[1].toLowerCase();
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return NextResponse.json(
          { error: 'Unsupported image format in base64 string' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(matches[2], 'base64');
      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File size exceeds maximum allowed limit (10MB)' },
          { status: 400 }
        );
      }

      const ext = mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg';
      const fileName = `products/${Date.now()}-whatsapp-upload${ext}`;

      const blob = await put(fileName, buffer, {
        access: 'public',
        contentType: mimeType,
        token: blobToken,
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        fileName: blob.pathname,
      });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (error: any) {
    const errCode = error?.code || error?.name || 'UPLOAD_ERROR';
    console.error(`[Image Upload] Upload failed on server (Code: ${errCode})`);
    return NextResponse.json(
      { error: 'Image upload failed on server. Please try again.' },
      { status: 500 }
    );
  }
}

