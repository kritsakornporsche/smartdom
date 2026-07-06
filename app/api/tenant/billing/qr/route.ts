import { NextResponse } from 'next/server';
import { getDb, getDormDbFromSession } from '@/lib/db';
import { auth } from '@/auth';
import generatePayload from 'promptpay-qr';
import qrcode from 'qrcode';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'tenant') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const billId = searchParams.get('billId');

    if (!billId) {
      return NextResponse.json({ success: false, message: 'Missing billId' }, { status: 400 });
    }

    const sql = getDb();
    
    // Get tenant and dorm
    const tenantRes = await sql`SELECT id, dorm_id FROM tenants WHERE user_id = ${(session.user as any).id}`;
    if (tenantRes.length === 0) return NextResponse.json({ success: false, message: 'Tenant not found' }, { status: 404 });
    const { id: tenantId, dorm_id: dormId } = tenantRes[0];

    // Verify bill and get amount
    const billRes = await sql`SELECT amount, status FROM bills WHERE id = ${billId} AND tenant_id = ${tenantId}`;
    if (billRes.length === 0) {
      return NextResponse.json({ success: false, message: 'Bill not found or unauthorized' }, { status: 404 });
    }
    
    if (billRes[0].status !== 'Unpaid') {
      return NextResponse.json({ success: false, message: 'Bill is not Unpaid' }, { status: 400 });
    }

    const amount = Number(billRes[0].amount);

    // Get owner's PromptPay number from dormitory_profile
    const profileRes = await sql`SELECT promptpay_number FROM dormitory_profile WHERE dorm_id = ${dormId}`;
    let promptpayNumber = profileRes.length > 0 ? profileRes[0].promptpay_number : null;
    
    if (!promptpayNumber) {
      return NextResponse.json({ success: false, message: 'Owner has not setup PromptPay' }, { status: 400 });
    }

    // Clean PromptPay number (remove dashes, spaces)
    promptpayNumber = promptpayNumber.replace(/[\s-]/g, '');

    // Generate PromptPay Payload
    const payload = generatePayload(promptpayNumber, { amount });
    
    // Generate QR Code as Data URI
    const svgUrl = await qrcode.toDataURL(payload, { type: 'image/png', errorCorrectionLevel: 'H', margin: 2, scale: 6 });

    return NextResponse.json({ success: true, qrImage: svgUrl, amount, promptpayNumber });

  } catch (error: any) {
    console.error('[API QR Generate Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
