'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

const navItems = [
  {
    href: '/keeper/maid',
    label: 'งานแม่บ้าน',
    roles: ['maid'],
    icon: '🧹',
  },
  {
    href: '/keeper/technician',
    label: 'งานซ่อมบำรุง',
    roles: ['technician'],
    icon: '🔧',
  },
];

export default function KeeperSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const userSubRole = (session?.user as any)?.sub_role;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <header className="h-16 bg-[#0F172A] border-b border-white/20/10 shrink-0" />;

  const allowedNav = navItems.filter(item => item.roles.includes(userSubRole));

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
          
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/20/10">
            K
          </div>
          <div className="hidden sm:block">
            <h2 className="font-bold text-base tracking-tight text-white">SmartDom</h2>
            <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.15em] leading-none">Keeper Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{session?.user?.name || 'Keeper'}</p>
            <p className="text-xs text-white/40">{userSubRole === 'maid' ? 'แม่บ้าน' : 'ช่างซ่อม'}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-[#0F172A]/10 border-2 border-white/20/20 shadow-sm overflow-hidden flex justify-center items-center">
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
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
              K
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-white">SmartDom</h2>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.15em] leading-none mt-1">Keeper</p>
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

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
