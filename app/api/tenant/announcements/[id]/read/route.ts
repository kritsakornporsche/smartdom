import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const announcementId = parseInt(params.id);
    if (isNaN(announcementId)) return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Find tenant by email
    const tenantRes = await sql`SELECT id FROM tenants WHERE email = ${session.user.email} LIMIT 1`;
    if (tenantRes.length === 0) return NextResponse.json({ success: false, message: 'Tenant not found' }, { status: 404 });
    const tenantId = tenantRes[0].id;

    // Insert acknowledgment
    await sql`
      INSERT INTO announcement_reads (tenant_id, announcement_id)
      VALUES (${tenantId}, ${announcementId})
      ON CONFLICT (tenant_id, announcement_id) DO NOTHING
    `;

    return NextResponse.json({ success: true, message: 'Acknowledged successfully' });
  } catch (error: any) {
    console.error('[POST /api/tenant/announcements/[id]/read]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
