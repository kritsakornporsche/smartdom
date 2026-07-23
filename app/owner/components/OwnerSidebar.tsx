'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import NotificationsPopover from '@/components/NotificationsPopover';

const navItems = [
  {
    group: 'ภาพรวม',
    items: [
      { href: '/owner', label: 'ภาพรวมหอพัก', icon: '📊', exact: true },
      { href: '/owner/rooms', label: 'การจัดการห้องพัก', icon: '🚪' },
      { href: '/owner/tenants', label: 'ทะเบียนผู้เช่า', icon: '👥' },
    ],
  },
  {
    group: 'การเงินและสัญญา',
    items: [
      { href: '/owner/contracts', label: 'สัญญาเช่าอัตโนมัติ', icon: '📝' },
      { href: '/owner/meters', label: 'จดมิเตอร์น้ำ-ไฟ', icon: '⚡' },
      { href: '/owner/billing', label: 'การเงินและค่าเช่า', icon: '💰' },
      { href: '/owner/accounting', label: 'บัญชีหอพัก', icon: '📈' },
    ],
  },
  {
    group: 'การจัดการ',
    items: [
      { href: '/owner/maintenance', label: 'ซ่อมบำรุง', icon: '🔧' },
      { href: '/owner/chat', label: 'ศูนย์จัดการแชท', icon: '💬' },
    ],
  },
  {
    group: 'ระบบ',
    items: [
      { href: '/owner/subscription', label: 'แพ็กเกจของฉัน', icon: '💎' },
      { href: '/owner/settings', label: 'ตั้งค่าหอพัก', icon: '⚙️' },
    ],
  },
];

export default function OwnerSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [dormName, setDormName] = useState<string | null>(null);
  const [dorms, setDorms] = useState<any[]>([]);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [canAddDorm, setCanAddDorm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session?.user?.email) {
      const savedDb = localStorage.getItem('selectedDormDbName');
      fetch(`/api/owner/onboarding?email=${session.user.email}${savedDb ? `&dormDbName=${savedDb}` : ''}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDorms(data.dorms || []);
            setCanAddDorm(data.canAddDorm);
            const activeDb = data.dormDbName;
            setSelectedDb(activeDb);
            setDormName(data.dorm?.name || null);
            if (activeDb) {
              localStorage.setItem('selectedDormDbName', activeDb);
            }
          }
        });
    }
  }, [session]);

  const handleDormChange = (newDb: string) => {
    localStorage.setItem('selectedDormDbName', newDb);
    setSelectedDb(newDb);
    window.location.reload();
  };

  if (!mounted) return (
    <header className="h-16 bg-[#0F172A] border-b border-white/20 shrink-0" />
  );

  return (
    <>
      {/* Top Navbar */}
      <header className="h-16 bg-[#0F172A] border-b border-white/20 flex items-center justify-between px-6 shrink-0 z-40 sticky top-0 shadow-sm">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-white/50 hover:bg-[#0F172A]/5 hover:text-white rounded-xl transition-colors focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0">
            <img src="/up-logo.png" alt="ตรามหาวิทยาลัยพะเยา" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <h2 className="font-black text-white tracking-tight text-sm sm:text-base">แพลตฟอร์มหอพักหน้ามหาวิทยาลัยพะเยา</h2>
            <p className="text-[9px] font-bold text-primary uppercase tracking-[0.15em] leading-none">{(session?.user as any)?.role || 'Owner'} Portal</p>
          </div>
        </div>

        {/* Right side - Profile */}
        <div className="flex items-center gap-4">
          <NotificationsPopover />
          <div className="text-right hidden sm:block ml-2">
            <p className="text-sm font-bold text-white">{session?.user?.name || 'Owner'}</p>
            <p className="text-xs text-white/40 truncate max-w-[150px]">{dormName || 'Loading...'}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-[#0F172A]/10 border-2 border-white/20 shadow-sm overflow-hidden flex items-center justify-center">
             <img src={session?.user?.image || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} alt="profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Off-canvas Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Hamburger Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-[#0F172A] border-r border-white/20 flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-white text-lg shadow-lg flex-shrink-0">
              S
            </div>
            <div>
              <h2 className="font-black text-white tracking-tight text-sm">SmartDom</h2>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mt-1">Owner Portal</p>
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

        {/* Dorm Selector */}
        <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-[#080F1E] border border-white/10">
           <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">เลือกหอพักเพื่อจัดการ</p>
           {dorms.length > 0 ? (
             <div className="flex flex-col gap-2">
               <select
                 value={selectedDb || ''}
                 onChange={(e) => handleDormChange(e.target.value)}
                 className="w-full bg-[#0F172A] border border-white/20 text-white rounded-xl p-2 text-sm font-bold focus:outline-none focus:border-primary cursor-pointer"
               >
                 {dorms.map((d: any) => (
                   <option key={d.db_name} value={d.db_name}>
                     {d.dorm_name}
                   </option>
                 ))}
               </select>
               {canAddDorm && (
                 <Link
                   href="/owner/onboarding?force=true"
                   className="text-xs text-yellow-500 hover:text-yellow-400 font-black flex items-center gap-1 mt-1.5 transition-colors pl-1"
                 >
                   <span>+</span> เพิ่มหอพักใหม่
                 </Link>
               )}
             </div>
           ) : (
             <p className="text-sm font-bold truncate text-white/40">กำลังโหลด...</p>
           )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-6">
          {navItems.map((group) => (
            <div key={group.group}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 px-3 mb-2">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'text-white/50 hover:bg-[#0F172A]/5 hover:text-white'
                      }`}
                    >
                      <span className="text-base flex-shrink-0">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-white hover:bg-[#0F172A]/5 rounded-xl font-semibold text-sm transition-all"
          >
            <span>🚪</span>
            ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}
