'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import NotificationsPopover from '@/components/NotificationsPopover';

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
    return <header className="h-16 bg-[#0F172A] border-b border-white/10 shrink-0" />;
  }

  return (
    <header className="h-16 bg-[#0F172A] border-b border-white/10 flex items-center justify-between px-4 sm:px-6 shrink-0 z-40 sticky top-0 shadow-lg backdrop-blur-md">
      {/* Left side: Brand Logo + Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 -ml-1 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors focus:outline-none cursor-pointer"
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
          <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border border-white/20 shrink-0 group-hover:scale-105 transition-transform">
            <img src="/up-logo.png" alt="ตรามหาวิทยาลัยพะเยา" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <h2 className="font-black text-white tracking-tight text-sm sm:text-base group-hover:text-cyan-300 transition-colors">
              SmartDom
            </h2>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.15em]">
                Owner Portal
              </span>
              <span className="text-white/30 text-[9px]">•</span>
              <span className="text-[9px] text-white/50">หอพักหน้า ม.พะเยา</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Middle: Dormitory Quick Switcher (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 bg-[#080F1E] px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-inner">
        <span className="text-sm">🏢</span>
        <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
          หอพักที่ดูแล:
        </span>
        {dorms.length > 0 ? (
          <select
            value={selectedDb || ''}
            onChange={(e) => handleDormChange(e.target.value)}
            className="bg-transparent text-xs font-black text-cyan-300 focus:outline-none cursor-pointer pr-2"
          >
            {dorms.map((d: any) => (
              <option key={d.db_name} value={d.db_name} className="bg-slate-900 text-white">
                {d.dorm_name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs font-bold text-white/70">
            {dormName || 'กำลังโหลด...'}
          </span>
        )}

        {canAddDorm && (
          <Link
            href="/owner/onboarding?force=true"
            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold ml-1 pl-2 border-l border-white/10 transition-colors"
          >
            + เพิ่มหอ
          </Link>
        )}
      </div>

      {/* Right side: Explore, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/explore"
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
          title="หน้าสำรวจหอพักสำหรับบุคคลทั่วไป"
        >
          <span>🌐</span>
          <span className="hidden md:inline">หน้าสำรวจ</span>
        </Link>

        <NotificationsPopover />

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white truncate max-w-[130px]">
              {session?.user?.name || 'Owner'}
            </p>
            <p className="text-[10px] text-cyan-300/80 font-medium truncate max-w-[130px]">
              {dormName || 'SmartDom'}
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={session?.user?.image || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
