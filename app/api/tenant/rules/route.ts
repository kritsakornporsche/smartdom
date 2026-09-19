import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dormIdParam = searchParams.get('dormId');

    const sql = getDb();
    let dormId = dormIdParam ? parseInt(dormIdParam, 10) : null;

    if (!dormId) {
      const defaultDorm = await sql`SELECT id FROM dormitory_registry WHERE status = 'Active' LIMIT 1`;
      if (defaultDorm.length > 0) dormId = defaultDorm[0].id;
    }

    if (!dormId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const rules = await sql`
      SELECT 
        id, 
        dorm_id, 
        title, 
        description, 
        category, 
        fine_amount, 
        sort_order
      FROM dormitory_rules
      WHERE dorm_id = ${dormId} AND is_active = 1
      ORDER BY 
        CASE category
          WHEN 'ความปลอดภัย' THEN 1
          WHEN 'การเข้า-ออก' THEN 2
          WHEN 'ความสะอาด' THEN 3
          WHEN 'สัตว์เลี้ยง' THEN 4
          WHEN 'การใช้เสียง' THEN 5
          ELSE 6
        END ASC,
        sort_order ASC,
        id ASC
    `;

    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    console.error('[API Tenant Rules GET Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
