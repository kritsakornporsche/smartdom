import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Fetch bills with tenant and room info
    const bills = await sql`
      SELECT b.*, u.name as tenant_name, r.room_number
      FROM bills b
      LEFT JOIN users u ON b.tenant_id = u.id
      LEFT JOIN rooms r ON r.tenant_id = u.id
      ORDER BY b.created_at DESC
    `;
    
    return NextResponse.json({ success: true, data: bills }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin bills:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch bills', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenant_id, title, amount, due_date, billing_cycle } = body;
    
    if (!tenant_id || !amount || !due_date) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL || '');
    const result = await sql`
      INSERT INTO bills (tenant_id, title, amount, due_date, billing_cycle, status)
      VALUES (${tenant_id}, ${title || 'Monthly Bill'}, ${amount}, ${due_date}, ${billing_cycle || ''}, 'Unpaid')
      RETURNING *
    `;
    
    return NextResponse.json({ success: true, message: 'Bill issued successfully', data: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ success: false, message: 'Failed to issue bill' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL || '');
    const result = await sql`
      UPDATE bills
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json({ success: true, message: 'Status updated', data: result[0] });
  } catch {
    return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
  }
}
