import { NextResponse } from 'next/server';
import { getDormDbFromSession } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDormDbFromSession(session);
    const userResult = await sql`
      SELECT id, role, primary_role, name, email 
      FROM users 
      WHERE email = ${session.user.email} 
      LIMIT 1
    `;
    
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    const user = userResult[0];
    const isOwner = user.role === 'owner' || user.primary_role === 'owner';

    let conversations: any[] = [];

    if (isOwner) {
      // Owner sees all conversations where they are owner OR owning the dorm OR guest
      conversations = await sql`
        SELECT 
          c.id,
          c.guest_id,
          c.owner_id,
          c.dorm_id,
          c.last_message,
          c.updated_at,
          c.created_at,
          COALESCE(u.name, 'ผู้เช่า/แขก') as guest_name,
          COALESCE(u.primary_role, u.role, 'guest') as guest_role,
          COALESCE(dr.dorm_name, 'หอพัก') as dorm_name
        FROM conversations c
        LEFT JOIN users u ON c.guest_id = u.id
        LEFT JOIN dormitory_registry dr ON c.dorm_id = dr.id
        WHERE c.owner_id = ${user.id} 
           OR c.dorm_id IN (SELECT id FROM dormitory_registry WHERE owner_id = ${user.id})
           OR c.guest_id = ${user.id}
        ORDER BY c.updated_at DESC
      `;
    } else {
      // Tenant / Guest sees their conversations
      conversations = await sql`
        SELECT 
          c.id,
          c.guest_id,
          c.owner_id,
          c.dorm_id,
          c.last_message,
          c.updated_at,
          c.created_at,
          COALESCE(u.name, dr.owner_name, 'เจ้าของหอพัก') as owner_name,
          COALESCE(dr.dorm_name, 'หอพัก') as dorm_name
        FROM conversations c
        LEFT JOIN users u ON c.owner_id = u.id
        LEFT JOIN dormitory_registry dr ON c.dorm_id = dr.id
        WHERE c.guest_id = ${user.id} OR c.owner_id = ${user.id}
        ORDER BY c.updated_at DESC
      `;

      // If tenant has no conversation yet, auto-detect their dorm from tenants or contracts
      if (conversations.length === 0) {
        let detectedDormId: number | null = null;
        let detectedOwnerId: number | null = null;
        let detectedDormName = 'หอพักของคุณ';

        // 1. Check tenants table
        const tenantRows = await sql`
          SELECT t.dorm_id, dr.owner_id, dr.dorm_name 
          FROM tenants t 
          JOIN dormitory_registry dr ON t.dorm_id = dr.id 
          WHERE t.email = ${session.user.email} OR t.user_id = ${user.id}
          LIMIT 1
        `;

        if (tenantRows.length > 0) {
          detectedDormId = tenantRows[0].dorm_id;
          detectedOwnerId = tenantRows[0].owner_id;
          detectedDormName = tenantRows[0].dorm_name;
        } else {
          // 2. Check contracts table
          const contractRows = await sql`
            SELECT c.dorm_id, dr.owner_id, dr.dorm_name 
            FROM contracts c 
            JOIN dormitory_registry dr ON c.dorm_id = dr.id 
            WHERE c.tenant_email = ${session.user.email} OR c.tenant_id = ${user.id}
            LIMIT 1
          `;
          if (contractRows.length > 0) {
            detectedDormId = contractRows[0].dorm_id;
            detectedOwnerId = contractRows[0].owner_id;
            detectedDormName = contractRows[0].dorm_name;
          }
        }

        if (detectedDormId && detectedOwnerId) {
          const insertRes = await sql`
            INSERT INTO conversations (guest_id, owner_id, dorm_id, last_message, updated_at)
            VALUES (${user.id}, ${detectedOwnerId}, ${detectedDormId}, 'เริ่มการสนทนาใหม่', CURRENT_TIMESTAMP)
          `;
          const newId = (insertRes as any)?.insertId;

          // Fetch owner details
          const ownerUser = await sql`SELECT name FROM users WHERE id = ${detectedOwnerId} LIMIT 1`;
          const ownerDisplayName = ownerUser[0]?.name || 'เจ้าของหอพัก';

          conversations = [{
            id: newId,
            guest_id: user.id,
            owner_id: detectedOwnerId,
            dorm_id: detectedDormId,
            last_message: 'เริ่มการสนทนาใหม่',
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            owner_name: ownerDisplayName,
            dorm_name: detectedDormName
          }];
        }
      }
    }

    return NextResponse.json({ success: true, data: conversations });
  } catch (error: any) {
    console.error('[GET /api/chat/conversations] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { dormId } = await request.json();
    if (!dormId) {
      return NextResponse.json({ success: false, message: 'dormId is required' }, { status: 400 });
    }

    const sql = getDormDbFromSession(session);
    
    // Get initiating user
    const userResult = await sql`
      SELECT id, role, primary_role 
      FROM users 
      WHERE email = ${session.user.email} 
      LIMIT 1
    `;
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    const guestId = userResult[0].id;

    // Get owner_id from dormitory_registry
    const dormResult = await sql`
      SELECT id, owner_id, dorm_name 
      FROM dormitory_registry 
      WHERE id = ${dormId} 
      LIMIT 1
    `;
    if (dormResult.length === 0) {
      return NextResponse.json({ success: false, message: 'Dorm not found' }, { status: 404 });
    }
    const ownerId = dormResult[0].owner_id;

    // Check if conversation already exists
    const existing = await sql`
      SELECT id, guest_id, owner_id, dorm_id 
      FROM conversations 
      WHERE guest_id = ${guestId} AND dorm_id = ${dormId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ success: true, data: existing[0] });
    }

    // Create new conversation (MySQL syntax)
    const insertRes = await sql`
      INSERT INTO conversations (guest_id, owner_id, dorm_id, last_message, updated_at)
      VALUES (${guestId}, ${ownerId}, ${dormId}, 'เริ่มการสนทนาใหม่', CURRENT_TIMESTAMP)
    `;

    const newId = (insertRes as any)?.insertId;
    return NextResponse.json({ 
      success: true, 
      data: { 
        id: newId, 
        guest_id: guestId, 
        owner_id: ownerId, 
        dorm_id: Number(dormId) 
      } 
    });
  } catch (error: any) {
    console.error('[POST /api/chat/conversations] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
