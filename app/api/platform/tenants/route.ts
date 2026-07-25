import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'platform_admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const dormId = searchParams.get('dormId');

    const sql = getDb();

    let query = sql`
      SELECT 
        t.id as tenant_id,
        COALESCE(t.name, u.name, 'ไม่ระบุชื่อ') as tenant_name,
        COALESCE(t.email, u.email, '-') as tenant_email,
        COALESCE(t.phone, '-') as tenant_phone,
        r.room_number,
        r.floor,
        dr.id as dorm_id,
        COALESCE(dr.dorm_name, 'ไม่ระบุหอพัก') as dorm_name,
        c.start_date,
        c.end_date,
        c.deposit_amount,
        COALESCE(c.status, 'No Contract') as contract_status,
        t.created_at
      FROM tenants t
      LEFT JOIN users u ON t.user_id = u.id OR (t.email IS NOT NULL AND t.email = u.email)
      LEFT JOIN contracts c ON t.id = c.tenant_id AND c.status = 'Active'
      LEFT JOIN rooms r ON r.id = COALESCE(t.room_id, c.room_id)
      LEFT JOIN dormitory_registry dr ON r.dorm_id = dr.id
      ORDER BY dr.dorm_name ASC, r.room_number ASC, t.created_at DESC
    `;

    const tenants = await query;

    // Filter in JS for flexibility
    const filtered = tenants.filter((t: any) => {
      const matchDorm = !dormId || String(t.dorm_id) === String(dormId);
      const matchSearch = !search ||
        t.tenant_name.toLowerCase().includes(search) ||
        t.tenant_email.toLowerCase().includes(search) ||
        t.tenant_phone.toLowerCase().includes(search) ||
        t.dorm_name.toLowerCase().includes(search) ||
        (t.room_number && String(t.room_number).toLowerCase().includes(search));
      return matchDorm && matchSearch;
    });

    // Also fetch list of dormitories for filter dropdown
    const dormList = await sql`
      SELECT id, dorm_name FROM dormitory_registry WHERE status = 'Active' ORDER BY dorm_name ASC
    `;

    return NextResponse.json({
      success: true,
      data: filtered,
      totalCount: tenants.length,
      dormitories: dormList,
    });

  } catch (err: any) {
    console.error('GET /api/platform/tenants error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
