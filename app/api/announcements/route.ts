import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

// Get current user id from session helper (if needed)
const getUserFromSession = async () => {
  const session = await auth();
  return session?.user;
};

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Fetch active announcements, newest first
    const news = await sql`
      SELECT a.*, u.name as author_name 
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.is_active = TRUE
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    console.error('Announcements GET Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromSession();
    // Only 'owner' or 'admin' can post news
    const role = (user as any)?.role;
    if (!user || (role !== 'owner' && role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, category } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    const result = await sql`
      INSERT INTO announcements (title, content, category, created_by)
      VALUES (${title}, ${content}, ${category || 'info'}, ${user.id})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error('Announcements POST Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
