import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';

export default function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FDFBF7] text-[#4A3F35] font-sans">
      {/* Sidebar - Earth Tone Theme */}
      <aside className="w-64 bg-[#F2EFE9] border-r border-[#E5DFD3] flex flex-col hidden md:flex shrink-0">
        <div className="h-24 flex flex-col justify-center px-8 border-b border-[#E5DFD3] bg-[#EBE7DF]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#8B7355] rounded-xl flex items-center justify-center text-[#FDFBF7] font-bold text-xl shadow-inner">
              S
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block text-[#3E342B]">SmartDom</span>
              <span className="text-[10px] uppercase tracking-widest text-[#8B7355] font-semibold">Tenant Portal</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
          <Link href="/tenant" className="flex items-center gap-3 px-4 py-3 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            หน้าหลัก (Home)
          </Link>
          <Link href="/tenant/billing" className="flex items-center gap-3 px-4 py-3 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ชำระค่าหอพัก (Billing)
          </Link>
          <Link href="/tenant/maintenance" className="flex items-center gap-3 px-4 py-3 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            แจ้งซ่อม (Maintenance)
          </Link>
          <Link href="/tenant/contract" className="flex items-center gap-3 px-4 py-3 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            สัญญาเช่า (Contract)
          </Link>
          <Link href="/tenant/move-out" className="flex items-center gap-3 px-4 py-3 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            แจ้งย้ายออก (Move Out)
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-[#5A4D41] hover:bg-[#EBE7DF] hover:text-[#3E342B] rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            ตั้งค่าโปรไฟล์ (Profile)
          </Link>
        </nav>
        
        <div className="p-5 border-t border-[#E5DFD3]">
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-[#8B7355] hover:text-[#5A4D41] bg-[#FDFBF7] border border-[#E5DFD3] rounded-xl font-bold transition-all hover:shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            จัดการบัญชี
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 px-8 flex items-center justify-between border-b border-[#E5DFD3] bg-[#FDFBF7] shrink-0">
          <div>
            <h1 className="text-xl font-bold text-[#3E342B]">แดชบอร์ดผู้เช่า</h1>
            <p className="text-sm text-[#8B7355] mt-0.5">ยินดีต้อนรับสู่ระบบ SmartDom</p>
          </div>
          <Link href="/profile" className="h-12 w-12 rounded-full border-2 border-[#DCD3C6] bg-[#F2EFE9] flex items-center justify-center text-[#8B7355] font-bold overflow-hidden shadow-sm hover:scale-105 transition-transform">
             <Image width={48} height={48} src="https://ui-avatars.com/api/?name=User&background=F2EFE9&color=8B7355" alt="Profile" />
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-4xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
