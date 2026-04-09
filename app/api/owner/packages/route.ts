import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL || '');
  
  try {
    const packages = await sql`SELECT * FROM dormitory_packages ORDER BY price ASC`;
    return NextResponse.json({ success: true, data: packages });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
