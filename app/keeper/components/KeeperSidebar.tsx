'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

const navItems = [
  {
    href: '/keeper/maid',
    label: 'งานแม่บ้าน',
    roles: ['maid', 'keeper'],
    icon: '🧹',
  },
  {
    href: '/keeper/technician',
    label: 'งานซ่อมบำรุง',
    roles: ['technician', 'keeper'],
    icon: '🔧',
  },
];

export default function KeeperSidebar({ onDormChange }: { onDormChange?: (dormId: string) => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dorms, setDorms] = useState<any[]>([]);
  const [selectedDormId, setSelectedDormId] = useState<string>('all');

  const userSubRole = (session?.user as any)?.sub_role;

  useEffect(() => {
    setMounted(true);
    // Fetch assigned dormitories
    fetch('/api/keeper/dorms')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.dorms) {
          setDorms(data.dorms);
          const savedDorm = typeof window !== 'undefined' ? localStorage.getItem('selectedKeeperDormId') : null;
          if (savedDorm) {
            setSelectedDormId(savedDorm);
          } else if (data.dorms.length > 0) {
            const firstId = String(data.dorms[0].id);
            setSelectedDormId(firstId);
            localStorage.setItem('selectedKeeperDormId', firstId);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleSelectDorm = (dormId: string) => {
    setSelectedDormId(dormId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedKeeperDormId', dormId);
      window.dispatchEvent(new CustomEvent('keeperDormChanged', { detail: { dormId } }));
    }
    if (onDormChange) onDormChange(dormId);
  };

  if (!mounted) return <header className="h-16 bg-[#0F172A] border-b border-white/20/10 shrink-0" />;

  const allowedNav = navItems.filter(item => {
    if (!userSubRole) return true;
    return item.roles.includes(userSubRole);
  });

  const activeDormObj = dorms.find(d => String(d.id) === selectedDormId);

  return (
    <>
      <header className="h-16 bg-[#0F172A] border-b border-white/20/10 flex items-center justify-between px-6 shrink-0 z-40 sticky top-0 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-white/50 hover:bg-[#0F172A]/5 hover:text-white rounded-xl transition-colors focus:outline-none cursor-pointer"
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
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/20/10 group-hover:scale-105 transition-transform">
              K
            </div>
            <div className="hidden sm:block">
              <h2 className="font-bold text-base tracking-tight text-white group-hover:text-orange-300 transition-colors">SmartDom</h2>
              <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.15em] leading-none">Keeper Portal</p>
            </div>
          </Link>
        </div>

        {/* Multi-Dormitory Switcher Dropdown */}
        <div className="flex items-center gap-3">
          {dorms.length > 0 && (
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 hover:border-orange-500/50 transition-colors">
              <span className="text-sm mr-2">🏢</span>
              <select
                id="keeper-dorm-switcher"
                value={selectedDormId}
                onChange={(e) => handleSelectDorm(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer appearance-none pr-5"
              >
                <option value="all" className="bg-[#0F172A] text-white">ทุกหอพักที่ดูแล ({dorms.length} หอพัก)</option>
                {dorms.map(d => (
                  <option key={d.id} value={String(d.id)} className="bg-[#0F172A] text-white">
                    {d.dorm_name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 text-[10px]">
                ▼
              </div>
            </div>
          )}

          <Link
            href="/explore"
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 shadow-sm cursor-pointer hover:scale-105 active:scale-95 hidden md:flex"
            title="กลับไปหน้าสำรวจหอพัก"
          >
            <span>🏠</span>
            <span>สำรวจหอพัก</span>
          </Link>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{session?.user?.name || 'Keeper'}</p>
            <p className="text-xs text-orange-400">
              {userSubRole === 'maid' ? 'แม่บ้าน' : userSubRole === 'technician' ? 'ช่างซ่อมบำรุง' : 'ผู้ดูแล'}
              {activeDormObj ? ` • ${activeDormObj.dorm_name}` : ''}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-orange-500/10 border-2 border-orange-500/30 shadow-sm overflow-hidden flex justify-center items-center">
            <span className="text-lg">{userSubRole === 'maid' ? '🧹' : '🔧'}</span>
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
          <Link href="/explore" onClick={() => setIsOpen(false)} className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white text-lg shadow-lg group-hover:scale-105 transition-transform">
              K
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-white group-hover:text-orange-300 transition-colors">SmartDom</h2>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.15em] leading-none mt-1">Keeper Portal</p>
            </div>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/50 hover:bg-[#0F172A]/5 hover:text-white rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile menu dorm switcher */}
        {dorms.length > 0 && (
          <div className="px-4 pt-4 pb-2 border-b border-white/10">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
              สลับหอพักที่ดูแล
            </label>
            <select
              value={selectedDormId}
              onChange={(e) => {
                handleSelectDorm(e.target.value);
                setIsOpen(false);
              }}
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
            >
              <option value="all">ทุกหอพักที่ดูแล ({dorms.length} หอพัก)</option>
              {dorms.map(d => (
                <option key={d.id} value={String(d.id)}>
                  {d.dorm_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {allowedNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
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
            <span>🚪</span>
            ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}
