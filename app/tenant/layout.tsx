import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { auth } from '@/auth';
import { neon } from '@neondatabase/serverless';

import TenantSidebar from './components/TenantSidebar';

export default async function TenantLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name || 'ผู้ใช้งาน';
  const userEmail = session?.user?.email;

  let roomInfo = 'ยังไม่ระบุห้อง';
  if (userEmail) {
    const sql = neon(process.env.DATABASE_URL || '');
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
    <div className="flex h-screen bg-[#FDFBF7] text-[#3E342B]">
      <TenantSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex h-10 w-10 bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl items-center justify-center text-[#8B7355] shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-[#3E342B] flex items-center gap-2">
                สวัสดี, {userName}
                <span className="text-[10px] bg-[#F2EFE9] text-[#8B7355] px-2 py-0.5 rounded-lg font-bold tracking-widest ml-2 uppercase">Tenant</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#8B6A2B] animate-pulse"></div>
                <p className="text-[10px] text-[#A08D74] font-bold uppercase tracking-widest leading-none">{roomInfo}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <Link href="/tenant/announcements" className="h-10 w-10 flex items-center justify-center text-[#A08D74] hover:bg-[#F3EFE9] hover:text-[#3E342B] rounded-full transition-colors relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2.5 right-2 h-2 w-2 bg-rose-500 border border-white rounded-full"></span>
            </Link>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#E5DFD3]">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#E5DFD3] shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-[#F2EFE9]">
                 <Image width={40} height={40} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=8B7355&color=fff&bold=true`} alt="Profile" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
