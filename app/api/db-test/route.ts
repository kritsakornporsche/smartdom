import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    // Check connection with a simple query
    const result = await client.query('SELECT NOW() as time');
    client.release();

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful', 
      time: result.rows[0].time 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    }, { status: 500 });
  }
}
