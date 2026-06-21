'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';

const navItems = [
  { href: '/tenant', label: 'หน้าหลัก', icon: '🏠' },
  { href: '/tenant/billing', label: 'บิลค่าเช่า', icon: '🧾' },
  { href: '/tenant/maintenance', label: 'แจ้งซ่อม', icon: '🔧' },
  { href: '/tenant/chat', label: 'แชทติดต่อหอพัก', icon: '💬' },
  { href: '/tenant/announcements', label: 'ประกาศจากหอพัก', icon: '📢' },
];

export default function TenantSidebar({ roomInfo = 'ไม่ระบุ', userName = 'ผู้เช่า' }: { roomInfo?: string, userName?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-[#0F172A] border-b border-white/20/10 flex items-center justify-between px-6 shrink-0 z-40 sticky top-0 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-white/50 hover:bg-[#0F172A]/5 hover:text-white rounded-xl transition-colors focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/20/10">
            T
          </div>
          <div className="hidden sm:block">
            <h2 className="font-bold text-base tracking-tight text-white">SmartDom</h2>
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em] leading-none">Tenant Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Link href="/tenant/announcements" className="h-9 w-9 flex items-center justify-center text-white/50 hover:bg-[#0F172A]/5 hover:text-white rounded-full transition-colors relative">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 border border-white/20/20 rounded-full"></span>
          </Link>

          <div className="flex items-center gap-3 pl-3 border-l border-white/20/10">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{userName}</p>
              <p className="text-xs text-white/40 truncate max-w-[150px]">{roomInfo}</p>
            </div>
            <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-white/20/20 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-[#0F172A]/5">
              <Image width={40} height={40} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0F172A&color=fff&bold=true`} alt="Profile" />
            </div>
          </div>
        </div>
      </header>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-[#0F172A] border-r border-white/20/10 flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/20/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
              T
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-white">SmartDom</h2>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.15em] leading-none mt-1">Tenant</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/50 hover:bg-[#0F172A]/5 hover:text-white rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 border-b border-white/20/10 bg-[#0F172A]/5">
           <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">ข้อมูลห้องพัก</p>
           <p className="text-sm font-bold text-white">{roomInfo}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-white/50 hover:bg-[#0F172A]/5 hover:text-white'
                }`}
              >
                <span className="text-xl">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/20/10">
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white rounded-xl font-bold text-sm transition-all hover:bg-[#0F172A]/5"
          >
            <span className="text-lg">🚪</span>
            ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}
