'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/owner',
    label: 'ภาพรวมหอพัก',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: '/owner/rooms',
    label: 'การจัดการห้องพัก',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/owner/tenants',
    label: 'ทะเบียนผู้เช่า',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: '/owner/billing',
    label: 'การเงินและค่าเช่า',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/owner/maintenance',
    label: 'ซ่อมบำรุง',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/owner/settings',
    label: 'ตั้งค่าหอพัก',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
];

export default function OwnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-gradient-to-b from-[#2D3436] to-[#0984E3] text-white flex flex-col shrink-0 shadow-2xl">
      {/* Brand Profile */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl shadow-inner border border-white/30">
            D
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">Dorm Owner</h2>
            <p className="text-xs text-white/60 font-medium">แผงควบคุมเจ้าของหอ</p>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
           <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">หอพักปัจจุบัน</p>
           <p className="text-sm font-bold truncate">SmartDom Mansion</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all group ${
                isActive
                  ? 'bg-white text-[#0984E3] shadow-lg scale-[1.02]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:rotate-12'}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-[#0984E3] shadow-sm animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session / Logout */}
      <div className="p-6 border-t border-white/10">
        <Link
           href="/signin"
           className="flex items-center gap-4 px-6 py-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-2xl font-bold text-sm transition-all border border-rose-500/30"
        >
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
           </svg>
           ออกจากระบบ
        </Link>
      </div>
    </aside>
  );
}
