'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import NotificationsPopover from '@/components/NotificationsPopover';
import ThemeToggle from '@/app/components/ThemeToggle';

const navItems = [
  { href: '/tenant', label: 'หน้าหลัก', icon: '🏠' },
  { href: '/explore', label: 'สำรวจหอพัก', icon: '🔎' },
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
      <header className="h-16 bg-card text-card-foreground border-b border-border flex items-center justify-between px-6 shrink-0 z-40 sticky top-0 shadow-sm w-full backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-foreground/80 hover:bg-secondary hover:text-foreground rounded-xl transition-colors focus:outline-none cursor-pointer"
            title="เปิดเมนู"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link 
            href="/explore" 
            className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer group"
            title="กลับไปหน้าสำรวจหอพัก"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-lg shadow-md border border-border group-hover:scale-105 transition-transform">
              T
            </div>
            <div className="hidden sm:block">
              <h2 className="font-bold text-base tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">SmartDom</h2>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em] leading-none">Tenant Portal</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/explore"
            className="px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all flex items-center gap-1.5 border border-border shadow-sm cursor-pointer hover:scale-105 active:scale-95"
            title="กลับไปหน้าสำรวจหอพัก"
          >
            <span>🏠</span>
            <span className="hidden md:inline">สำรวจหอพัก</span>
          </Link>

          {/* Notification Bell */}
          <NotificationsPopover />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Info (No Face Avatar) */}
          <div className="text-right pl-3 border-l border-border hidden sm:block">
            <p className="text-sm font-bold text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{roomInfo}</p>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="h-9 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 hover:text-rose-600 dark:text-rose-300 dark:hover:text-rose-100 border border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer active:scale-95 shrink-0"
            title="ออกจากระบบ"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>
      </header>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-card text-card-foreground border-r border-border flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/explore" onClick={() => setIsOpen(false)} className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer group">
            <div className="h-12 w-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-border flex-shrink-0 group-hover:scale-105 transition-transform">
              <img src="/up-logo.png" alt="ตรามหาวิทยาลัยพะเยา" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">แพลตฟอร์มหอพักหน้ามหาวิทยาลัยพะเยา</h2>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.15em] leading-none mt-1">Tenant</p>
            </div>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 border-b border-border bg-secondary/30">
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">ข้อมูลห้องพัก</p>
           <p className="text-sm font-bold text-foreground">{roomInfo}</p>
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
                    : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
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

        <div className="p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-100 border border-rose-500/30 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span className="text-base">🚪</span>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}
