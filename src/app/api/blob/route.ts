import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blobUrl = searchParams.get('url');

    if (!blobUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // If it is a public URL, redirect directly
    if (blobUrl.includes('.public.blob.vercel-storage.com')) {
      return NextResponse.redirect(blobUrl, 307);
    }

    // If it is a private blob URL from Vercel Blob storage, fetch with token
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim().replace(/^["']|["']$/g, '');

    const result = await get(blobUrl, {
      access: 'private',
      token: blobToken,
    });

    if (!result) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    if (result.statusCode === 304) {
      return new Response(null, { status: 304 });
    }

    if (result.statusCode === 200 && result.stream) {
      const headers = new Headers();
      const contentType = result.blob?.contentType || result.headers?.get('content-type') || 'image/png';
      headers.set('Content-Type', contentType);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');

      return new Response(result.stream, {
        status: 200,
        headers,
      });
    }

    return NextResponse.json({ error: 'Image not found' }, { status: 404 });

  } catch (error: any) {
    console.error('[Blob Proxy] Failed to fetch image:', error?.message);
    return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 });
  }
}
