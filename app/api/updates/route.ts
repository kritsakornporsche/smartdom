import { NextResponse } from 'next/server';
import { SYSTEM_UPDATES } from '@/lib/updatesData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: SYSTEM_UPDATES,
    latestVersion: SYSTEM_UPDATES[0]?.version || 'v2.4.0',
    latestDate: SYSTEM_UPDATES[0]?.date || '24 - 25 กรกฎาคม 2026',
  });
}
