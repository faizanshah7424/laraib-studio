import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    // Authenticate admin session
    const token = cookies().get('admin_token')?.value;
    const session = token ? await verifyAdminToken(token) : null;
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const contentType = req.headers.get('content-type') || '';

    let fileName = '';
    let buffer: Buffer;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || '.jpg';
      const cleanName = path
        .basename(file.name, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .toLowerCase();
      fileName = `${Date.now()}-${cleanName || 'product'}${ext}`;
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      if (body.dataUrl) {
        const matches = body.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return NextResponse.json({ error: 'Invalid base64 string' }, { status: 400 });
        }
        buffer = Buffer.from(matches[2], 'base64');
        const ext = matches[1].includes('png')
          ? '.png'
          : matches[1].includes('webp')
          ? '.webp'
          : '.jpg';
        fileName = `${Date.now()}-whatsapp-upload${ext}`;
      } else {
        return NextResponse.json({ error: 'dataUrl or file required' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
    }

    // Write to public/uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { error: 'Image upload failed on server' },
      { status: 500 }
    );
  }
}
