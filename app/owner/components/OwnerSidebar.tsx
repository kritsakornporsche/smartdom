'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface OwnerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navSections = [
  {
    group: 'หลัก',
    items: [
      { href: '/owner', label: 'ภาพรวม', icon: '📊', exact: true },
      { href: '/owner/rooms', label: 'ผังห้องพัก', icon: '🚪' },
      { href: '/owner/tenants', label: 'ทะเบียนผู้เช่า', icon: '👥' },
    ],
  },
  {
    group: 'การเงิน & สัญญา',
    items: [
      { href: '/owner/meters', label: 'จดมิเตอร์น้ำ-ไฟ', icon: '⚡' },
      { href: '/owner/billing', label: 'ออกบิล & ตรวจสลิป', icon: '💰' },
      { href: '/owner/contracts', label: 'สัญญาเช่า', icon: '📝' },
      { href: '/owner/accounting', label: 'บัญชีรายรับ-จ่าย', icon: '📈' },
    ],
  },
  {
    group: 'บริการ & อื่นๆ',
    items: [
      { href: '/owner/maintenance', label: 'แจ้งซ่อมบำรุง', icon: '🔧' },
      { href: '/owner/chat', label: 'แชทลูกหอ', icon: '💬' },
      { href: '/owner/keepers', label: 'ทีมผู้ดูแล', icon: '🧹' },
      { href: '/owner/settings', label: 'ตั้งค่าหอพัก', icon: '⚙️' },
    ],
  },
];

export default function OwnerSidebar({ isOpen, onClose }: OwnerSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [dorms, setDorms] = useState<any[]>([]);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [canAddDorm, setCanAddDorm] = useState(false);

  useEffect(() => {
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

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const NavContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300">
      {/* Dormitory Selector */}
      <div className="p-3 mx-3 mt-3 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            หอพัก
          </span>
          {canAddDorm && (
            <Link
              href="/owner/onboarding?force=true"
              className="text-[10px] text-cyan-400 hover:text-cyan-300"
            >
              + เพิ่มหอ
            </Link>
          )}
        </div>

        {dorms.length > 0 ? (
          <select
            value={selectedDb || ''}
            onChange={(e) => handleDormChange(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 text-white rounded-lg p-1.5 text-xs font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {dorms.map((d: any) => (
              <option key={d.db_name} value={d.db_name}>
                {d.dorm_name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-xs text-white/40 py-1">กำลังโหลด...</div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            <p className="px-2.5 text-[9px] font-bold text-white/30 uppercase tracking-wider mb-1">
              {section.group}
            </p>
            {section.items.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-sm shrink-0 opacity-80">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Minimal Logout */}
      <div className="p-3 border-t border-white/5 bg-black/10 shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-white/[0.04] text-white/40 hover:text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <span>🚪</span>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[#0F172A] border-r border-white/5 shrink-0 h-full overflow-hidden z-20">
        {NavContent}
      </aside>

      {/* 2. Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 md:hidden transition-opacity"
        />
      )}

      {/* 3. Mobile Slide-out Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] border-r border-white/10 flex flex-col md:hidden transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          <span className="text-xs font-bold text-white">เมนูจัดการหอพัก</span>
          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white rounded-lg text-sm"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {NavContent}
        </div>
      </div>
    </>
  );
}
