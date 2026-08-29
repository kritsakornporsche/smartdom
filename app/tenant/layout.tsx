import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';

import TenantSidebar from './components/TenantSidebar';

export default async function TenantLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name || 'ผู้ใช้งาน';
  const userEmail = session?.user?.email;

  let roomInfo = 'ยังไม่ระบุห้อง';
  if (userEmail) {
    const sql = getDb();
    const res = await sql`
      SELECT r.room_number, r.floor, dr.dorm_name, c.status as contract_status
      FROM tenants t
      LEFT JOIN contracts c ON t.id = c.tenant_id
      LEFT JOIN rooms r ON r.id = COALESCE(t.room_id, c.room_id)
      LEFT JOIN dormitory_registry dr ON r.dorm_id = dr.id
      WHERE t.email = ${userEmail} OR t.user_id = ${(session?.user as any)?.id || 0}
      ORDER BY c.id DESC
      LIMIT 1
    `;
    if (res.length > 0 && res[0].room_number) {
      if (res[0].contract_status === 'PendingOwnerSignature') {
        roomInfo = `ห้อง ${res[0].room_number} (รออนุมัติสัญญา)`;
      } else {
        roomInfo = `ห้อง ${res[0].room_number} • ชั้น ${res[0].floor || 1} (${res[0].dorm_name || 'SmartDom'})`;
      }
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <TenantSidebar roomInfo={roomInfo} userName={userName} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
