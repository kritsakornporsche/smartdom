import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { auth } from '@/auth';
import { neon } from '@neondatabase/serverless';

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
    <div className="flex h-screen bg-[#FDFBF7] text-[#4A3F35] font-sans">
      {/* Sidebar - Earth Tone Theme */}
      <aside className="w-72 bg-[#F2EFE9] border-r border-[#E5DFD3] flex flex-col hidden md:flex shrink-0">
        <div className="h-28 flex flex-col justify-center px-10 border-b border-[#E5DFD3] bg-[#EBE7DF]">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-[#8B7355] rounded-2xl flex items-center justify-center text-[#FDFBF7] font-bold text-2xl shadow-inner">
              S
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block text-[#3E342B]">SmartDom</span>
              <span className="text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold">Tenant Portal</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          <Link href="/tenant" className="flex items-center gap-3 px-5 py-3.5 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-2xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            หน้าหลัก (Home)
          </Link>
          <Link href="/tenant/billing" className="flex items-center gap-3 px-5 py-3.5 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-2xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ชำระค่าหอพัก (Billing)
          </Link>
          <Link href="/tenant/maintenance" className="flex items-center gap-3 px-5 py-3.5 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-2xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            แจ้งซ่อม (Maintenance)
          </Link>
          <Link href="/tenant/contract" className="flex items-center gap-3 px-5 py-3.5 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-2xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            สัญญาเช่า (Contract)
          </Link>
          <Link href="/tenant/move-out" className="flex items-center gap-3 px-5 py-3.5 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-2xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            แจ้งย้ายออก (Move Out)
          </Link>
          <Link href="/tenant/chat" className="flex items-center gap-3 px-5 py-3.5 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-2xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            ติดต่อเจ้าของหอ (Chat)
          </Link>
        </nav>
        
        <div className="p-6 border-t border-[#E5DFD3]">
          <Link href="/" className="flex items-center gap-3 px-5 py-4 text-[#8B7355] hover:text-[#5A4D41] bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl font-bold transition-all hover:shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ออกจากระบบ
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-28 px-10 md:px-16 flex items-center justify-between border-b border-[#E5DFD3] bg-white/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex h-12 w-12 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl items-center justify-center text-[#8B7355] shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#3E342B] tracking-tight flex items-center gap-2">
                สวัสดี, {userName}
                <span className="text-xs bg-[#F2EFE9] text-[#8B7355] px-2.5 py-1 rounded-lg font-bold tracking-widest ml-2 uppercase">Tenant</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#8B6A2B] animate-pulse"></div>
                <p className="text-sm font-medium text-[#8B7355] tracking-wide">{roomInfo}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="h-11 w-11 flex items-center justify-center text-[#5A4D41] hover:bg-[#F2EFE9] rounded-xl transition-all border border-transparent hover:border-[#E5DFD3] group relative">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#E5DFD3]">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-[#A08D74] uppercase tracking-wider mb-0.5">Member Since</p>
                <p className="text-xs font-bold text-[#3E342B]">2026</p>
              </div>
              <div className="h-12 w-12 rounded-2xl border-2 border-[#DCD3C6] bg-[#F2EFE9] flex items-center justify-center text-[#8B7355] font-bold overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                 <Image width={48} height={48} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=F2EFE9&color=8B7355&bold=true`} alt="Profile" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
