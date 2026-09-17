'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import NotificationsPopover from '@/components/NotificationsPopover';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function TenantSidebar({ roomInfo = 'ไม่ระบุ', userName = 'ผู้เช่า' }: { roomInfo?: string, userName?: string }) {
  const pathname = usePathname();

  return (
    <header className="h-16 bg-card text-card-foreground border-b border-border flex items-center justify-between px-3 sm:px-6 shrink-0 z-40 sticky top-0 shadow-sm w-full backdrop-blur-md">
      {/* 1. Brand & Room Info */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link 
          href="/explore" 
          className="flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity cursor-pointer group"
          title="กลับไปหน้าสำรวจหอพัก"
        >
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-border group-hover:scale-105 transition-transform shrink-0">
            <img src="/up-logo.png" alt="ตรามหาวิทยาลัยพะเยา" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base tracking-tight text-foreground group-hover:text-emerald-500 transition-colors leading-none">
              SmartDom
            </h2>
            <div className="hidden sm:flex items-center gap-1.5 leading-none mt-1">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em]">Tenant Portal</p>
              <span className="text-muted-foreground text-[9px]">•</span>
              <span className="text-[9px] text-muted-foreground">{roomInfo}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 2. Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/explore"
          className="hidden md:flex px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all items-center gap-1.5 border border-border shadow-sm cursor-pointer hover:scale-105 active:scale-95"
          title="กลับไปหน้าสำรวจหอพัก"
        >
          <span>🏠</span>
          <span>สำรวจหอพัก</span>
        </Link>

        {/* Chat / Direct Message Link */}
        <Link
          href="/tenant/chat"
          className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-all flex items-center justify-center border border-border shadow-sm active:scale-95 group"
          title="แชทติดต่อหอพัก"
        >
          <svg className="w-5 h-5 text-foreground group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </Link>

        {/* Notification Bell */}
        <NotificationsPopover />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Info */}
        <div className="text-right pl-3 border-l border-border hidden sm:block">
          <p className="text-sm font-bold text-foreground">{userName}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{roomInfo}</p>
        </div>

        {/* Sign Out Button (Desktop only, mobile has it in More Action Sheet) */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/signin' })}
          className="hidden md:flex h-9 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 hover:text-rose-600 dark:text-rose-300 dark:hover:text-rose-100 border border-rose-500/30 transition-all items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer active:scale-95 shrink-0"
          title="ออกจากระบบ"
        >
          <span>🚪</span>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </header>
  );
}
