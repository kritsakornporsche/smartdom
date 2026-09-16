'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface OwnerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navSections = [
  {
    group: 'หลัก',
    items: [
      { href: '/owner', label: 'ภาพรวม', icon: '📊', exact: true },
      { href: '/owner/bookings', label: 'รายการจองห้อง', icon: '🛎️' },
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
  const [dormName, setDormName] = useState<string | null>(null);
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

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const NavContent = (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      {/* Dormitory Switcher & Add Dorm Button (Visible on all screen sizes, including Mobile) */}
      <div className="p-3 border-b border-border bg-secondary/40 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <span>🏢</span> หอพักที่ดูแล
          </span>
          {canAddDorm && (
            <Link
              href="/owner/onboarding?force=true"
              onClick={onClose}
              className="text-[10px] text-amber-500 hover:text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
            >
              + เพิ่มหอพัก
            </Link>
          )}
        </div>
        {dorms.length > 0 ? (
          <select
            value={selectedDb || ''}
            onChange={(e) => handleDormChange(e.target.value)}
            className="w-full bg-background text-foreground border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm"
          >
            {dorms.map((d: any) => (
              <option key={d.db_name} value={d.db_name} className="bg-card text-foreground">
                {d.dorm_name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-xs font-bold text-foreground px-1 py-0.5 truncate">
            {dormName || 'กำลังโหลด...'}
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            <p className="px-2.5 text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-1">
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
                      ? 'bg-primary/15 text-primary font-bold border border-primary/30 shadow-sm'
                      : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Logout Button */}
      <div className="p-3 border-t border-border bg-secondary/30 shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: '/signin' })}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 hover:text-rose-600 dark:text-rose-300 dark:hover:text-rose-100 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <span className="text-sm">🚪</span>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-card border-r border-border shrink-0 h-full overflow-hidden z-20">
        {NavContent}
      </aside>

      {/* 2. Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity"
        />
      )}

      {/* 3. Mobile Slide-out Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col md:hidden transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0 bg-card text-card-foreground">
          <span className="text-xs font-bold text-foreground">เมนูจัดการหอพัก</span>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg text-sm"
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
