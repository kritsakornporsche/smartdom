import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { auth } from '@/auth';
import { neon } from '@/lib/mysql-adapter';

import TenantSidebar from './components/TenantSidebar';

export default async function TenantLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name || 'ผู้ใช้งาน';
  const userEmail = session?.user?.email;

  let roomInfo = 'ยังไม่ระบุห้อง';
  if (userEmail) {
    const sql = neon(process.env.DATABASE_URL || 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdom_dorm_1');
    const res = await sql`
      SELECT r.room_number, r.floor, d.name as dorm_name
      FROM tenants t
      JOIN rooms r ON t.room_id = r.id
      JOIN dormitory_profile d ON r.dorm_id = d.id
      WHERE t.email = ${userEmail}
      LIMIT 1
    `;
    if (res.length > 0) {
      roomInfo = `ห้อง ${res[0].room_number} • ชั้น ${res[0].floor} (${res[0].dorm_name})`;
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#080F1E] text-white">
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
