import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';

/**
 * GET /api/settings
 * Fetch Store Settings (Public & Bank Transfer Details)
 */
export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      settings: settingsMap,
      raw: settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * POST /api/settings
 * Update Store Settings (Admin Only)
 */
export async function POST(req: NextRequest) {
  try {
    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { settings } = body; // Array of { key, value, description }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 });
    }

    for (const item of settings) {
      if (item.key && typeof item.value === 'string') {
        await prisma.setting.upsert({
          where: { key: item.key },
          update: { value: item.value, description: item.description || null },
          create: {
            key: item.key,
            value: item.value,
            description: item.description || null,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
