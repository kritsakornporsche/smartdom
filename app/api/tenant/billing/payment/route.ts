import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { billId, slipData, email } = body;
    const userEmail = session?.user?.email || email;

    if (!billId || !slipData) {
      return NextResponse.json({ success: false, message: 'Missing billId or slipData' }, { status: 400 });
    }

    const sql = getDb();
    
    // 1. Verify bill exists
    const billRes = await sql`
      SELECT b.*, t.email as tenant_email 
      FROM bills b 
      LEFT JOIN tenants t ON b.tenant_id = t.id 
      WHERE b.id = ${billId} 
      LIMIT 1
    `;

    if (billRes.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบรายการบิลนี้ในระบบ' }, { status: 404 });
    }

    const bill = billRes[0];

    if (bill.status === 'Paid') {
      return NextResponse.json({ success: false, message: 'บิลนี้ได้รับการชำระเงินเรียบร้อยแล้ว' }, { status: 400 });
    }

    // 2. Update bill status to Pending with slip
    await sql`
      UPDATE bills 
      SET status = 'Pending', slip_url = ${slipData} 
      WHERE id = ${billId}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว รอเจ้าของหอพักตรวจสอบ' 
    });

  } catch (error: any) {
    console.error('[POST /api/tenant/billing/payment] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
