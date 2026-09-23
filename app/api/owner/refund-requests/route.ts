import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

// ──────────────────────────────────────────────────────────
// Helper: ensure the deposit_refund_requests table exists
// ──────────────────────────────────────────────────────────
async function ensureTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS deposit_refund_requests (
      id SERIAL PRIMARY KEY,
      contract_id INTEGER NOT NULL,
      tenant_id INTEGER,
      room_id INTEGER NOT NULL,
      dorm_id INTEGER NOT NULL,
      requester_name VARCHAR(255),
      requester_email VARCHAR(255),
      deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      reason TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      owner_note TEXT,
      refund_slip_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

// ──────────────────────────────────────────────────────────
// GET  /api/owner/refund-requests
// Returns all refund requests for the owner's dormitories
// ──────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const userEmail = session?.user?.email || searchParams.get('email');

    const sql = getDb();
    await ensureTable(sql);

    // Resolve dormIds for this owner
    let dormIds: number[] = [];
    if (userEmail) {
      const dormRes = await sql`
        SELECT id FROM dormitory_registry
        WHERE (owner_email = ${userEmail} OR owner_id IN (
          SELECT id FROM users WHERE email = ${userEmail}
        )) AND status = 'Active'
      `;
      dormIds = dormRes.map((d: any) => d.id);
    }

    if (dormIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const requests = await sql`
      SELECT
        drr.id,
        drr.contract_id,
        drr.tenant_id,
        drr.room_id,
        drr.dorm_id,
        drr.requester_name,
        drr.requester_email,
        drr.deposit_amount,
        drr.reason,
        drr.status,
        drr.owner_note,
        drr.refund_slip_url,
        drr.created_at,
        drr.updated_at,
        r.room_number,
        r.room_type,
        r.floor,
        dr.dorm_name
      FROM deposit_refund_requests drr
      JOIN rooms r ON drr.room_id = r.id
      JOIN dormitory_registry dr ON drr.dorm_id = dr.id
      WHERE drr.dorm_id IN (${dormIds})
      ORDER BY
        CASE WHEN drr.status = 'pending' THEN 0 ELSE 1 END,
        drr.created_at DESC
    `;

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('[API Owner RefundRequests GET Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ──────────────────────────────────────────────────────────
// POST /api/owner/refund-requests
// Actions: init_table | approve_refund | reject_refund
// ──────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;
    const sql = getDb();
    await ensureTable(sql);

    // ── init_table: just ensure the table exists ──────────
    if (action === 'init_table') {
      return NextResponse.json({ success: true, message: 'ตาราง deposit_refund_requests พร้อมใช้งาน' });
    }

    // ── approve_refund ────────────────────────────────────
    if (action === 'approve_refund') {
      const { requestId, ownerNote, refundSlipUrl } = body;
      if (!requestId) {
        return NextResponse.json({ success: false, message: 'Missing requestId' }, { status: 400 });
      }

      // Load the request
      const reqRes = await sql`SELECT * FROM deposit_refund_requests WHERE id = ${requestId}`;
      if (reqRes.length === 0) {
        return NextResponse.json({ success: false, message: 'ไม่พบคำร้องดังกล่าว' }, { status: 404 });
      }
      const refundReq = reqRes[0];

      if (refundReq.status !== 'pending') {
        return NextResponse.json({ success: false, message: 'คำร้องนี้ดำเนินการไปแล้ว' }, { status: 400 });
      }

      // 1. Mark request as approved
      await sql`
        UPDATE deposit_refund_requests
        SET status = 'approved',
            owner_note = ${ownerNote || 'อนุมัติคืนเงินมัดจำ'},
            refund_slip_url = ${refundSlipUrl || null},
            updated_at = NOW()
        WHERE id = ${requestId}
      `;

      // 2. Cancel the contract (if still pending)
      await sql`
        UPDATE contracts
        SET status = 'Cancelled',
            renewal_note = ${'ยกเลิกการจอง: อนุมัติคืนเงินมัดจำ - ' + (ownerNote || '')}
        WHERE id = ${refundReq.contract_id} AND status = 'PendingOwnerSignature'
      `;

      // 3. Set room back to Available
      await sql`UPDATE rooms SET status = 'Available' WHERE id = ${refundReq.room_id}`;

      // 4. Remove booking_progress entry if exists
      if (refundReq.requester_email) {
        await sql`
          DELETE FROM booking_progress
          WHERE user_email = ${refundReq.requester_email} AND room_id = ${refundReq.room_id}
        `.catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: 'อนุมัติคืนเงินมัดจำเรียบร้อยแล้ว สัญญาถูกยกเลิกและห้องพักกลับสู่สถานะว่าง'
      });
    }

    // ── reject_refund ─────────────────────────────────────
    if (action === 'reject_refund') {
      const { requestId, ownerNote } = body;
      if (!requestId) {
        return NextResponse.json({ success: false, message: 'Missing requestId' }, { status: 400 });
      }

      const reqRes = await sql`SELECT * FROM deposit_refund_requests WHERE id = ${requestId}`;
      if (reqRes.length === 0) {
        return NextResponse.json({ success: false, message: 'ไม่พบคำร้องดังกล่าว' }, { status: 404 });
      }
      if (reqRes[0].status !== 'pending') {
        return NextResponse.json({ success: false, message: 'คำร้องนี้ดำเนินการไปแล้ว' }, { status: 400 });
      }

      await sql`
        UPDATE deposit_refund_requests
        SET status = 'rejected',
            owner_note = ${ownerNote || 'ปฏิเสธคำร้องคืนเงินมัดจำ'},
            updated_at = NOW()
        WHERE id = ${requestId}
      `;

      return NextResponse.json({
        success: true,
        message: 'ปฏิเสธคำร้องคืนเงินมัดจำแล้ว สัญญาการจองยังคงมีผลอยู่'
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('[API Owner RefundRequests POST Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
