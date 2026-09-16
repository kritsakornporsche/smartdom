'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import NotificationsPopover from '@/components/NotificationsPopover';
import ThemeToggle from '@/app/components/ThemeToggle';

interface OwnerNavbarProps {
  onToggleMobileMenu: () => void;
}

export default function OwnerNavbar({ onToggleMobileMenu }: OwnerNavbarProps) {
  const { data: session } = useSession();
  const [dormName, setDormName] = useState<string | null>(null);
  const [dorms, setDorms] = useState<any[]>([]);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [canAddDorm, setCanAddDorm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const email = session?.user?.email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null);
    if (email) {
      const savedDb = typeof window !== 'undefined' ? localStorage.getItem('selectedDormDbName') : null;
      fetch(`/api/owner/onboarding?email=${encodeURIComponent(email)}${savedDb ? `&dormDbName=${savedDb}` : ''}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDorms(data.dorms || []);
            setCanAddDorm(data.canAddDorm);
            const activeDb = data.dormDbName;
            setSelectedDb(activeDb);
            setDormName(data.dorm?.name || null);
            if (activeDb && typeof window !== 'undefined') {
              localStorage.setItem('selectedDormDbName', activeDb);
            }
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const handleDormChange = (newDb: string) => {
    localStorage.setItem('selectedDormDbName', newDb);
    setSelectedDb(newDb);
    window.location.reload();
  };

  if (!mounted) {
    return <header className="h-16 bg-card border-b border-border shrink-0" />;
  }

  return (
    <header className="h-16 bg-card text-card-foreground border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 z-40 sticky top-0 shadow-sm backdrop-blur-md">
      {/* Left side: Brand Logo + Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 -ml-1 text-foreground/80 hover:bg-secondary hover:text-foreground rounded-xl transition-colors focus:outline-none cursor-pointer"
          title="เปิดเมนูนำทาง"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand Logo & Title */}
        <Link
          href="/owner"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer group"
          title="แดชบอร์ดเจ้าของหอพัก"
        >
          <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-border shrink-0 group-hover:scale-105 transition-transform">
            <img src="/up-logo.png" alt="ตรามหาวิทยาลัยพะเยา" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <h2 className="font-black text-foreground tracking-tight text-sm sm:text-base group-hover:text-primary transition-colors">
              SmartDom
            </h2>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.15em]">
                Owner Portal
              </span>
              <span className="text-muted-foreground text-[9px]">•</span>
              <span className="text-[9px] text-muted-foreground">หอพักหน้า ม.พะเยา</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Middle: Dormitory Quick Switcher (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 bg-secondary/80 px-3.5 py-1.5 rounded-2xl border border-border shadow-inner">
        <span className="text-sm">🏢</span>
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          หอพักที่ดูแล:
        </span>
        {dorms.length > 0 ? (
          <select
            value={selectedDb || ''}
            onChange={(e) => handleDormChange(e.target.value)}
            className="bg-transparent text-xs font-black text-primary focus:outline-none cursor-pointer pr-2"
          >
            {dorms.map((d: any) => (
              <option key={d.db_name} value={d.db_name} className="bg-card text-foreground">
                {d.dorm_name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs font-bold text-foreground">
            {dormName || 'กำลังโหลด...'}
          </span>
        )}

        {canAddDorm && (
          <Link
            href="/owner/onboarding?force=true"
            className="text-[11px] text-amber-500 hover:text-amber-400 font-bold ml-1 pl-2 border-l border-border transition-colors"
          >
            + เพิ่มหอ
          </Link>
        )}
      </div>

      {/* Right side: Explore, Notifications, Theme, Profile Info, Sign Out */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/explore"
          className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all flex items-center gap-1.5 border border-border shadow-sm cursor-pointer hover:scale-105 active:scale-95"
          title="หน้าสำรวจหอพักสำหรับบุคคลทั่วไป"
        >
          <span>🌐</span>
          <span className="hidden md:inline">หน้าสำรวจ</span>
        </Link>

        <NotificationsPopover />

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* User Info (No Face Avatar) */}
        <div className="text-right pl-2 border-l border-border">
          <p className="text-xs font-bold text-foreground truncate max-w-[130px]">
            {session?.user?.name || 'Owner'}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[130px]">
            {dormName || 'SmartDom'}
          </p>
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
  );
}
