'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

const navItems = [
  {
    group: 'ภาพรวม',
    items: [
      { href: '/platform', label: 'Dashboard', icon: '📊', exact: true },
    ],
  },
  {
    group: 'จัดการหอพัก',
    items: [
      { href: '/platform/dormitories', label: 'หอพักทั้งหมด', icon: '🏢' },
      { href: '/platform/subscriptions', label: 'การสมัครสมาชิก', icon: '🔖' },
    ],
  },
  {
    group: 'แพ็กเกจ',
    items: [
      { href: '/platform/packages', label: 'จัดการแพ็กเกจ', icon: '📦' },
    ],
  },
  {
    group: 'การเงิน',
    items: [
      { href: '/platform/accounting', label: 'บัญชีรายรับ', icon: '💰' },
      { href: '/platform/accounting/reports', label: 'รายงานรายรับ', icon: '📈' },
    ],
  },
  {
    group: 'ระบบ',
    items: [
      { href: '/platform/status', label: 'สถานะระบบ', icon: '🔌' },
      { href: '/platform/settings', label: 'ตั้งค่าระบบ', icon: '⚙️' },
    ],
  },
];

export default function PlatformSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Navbar */}
      <header className="h-16 bg-[#0F172A] border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-40 sticky top-0 shadow-sm">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-white/50 hover:bg-white/5 hover:text-white rounded-xl transition-colors focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-white text-lg shadow-lg flex-shrink-0">
            S
          </div>
          <div className="hidden sm:block">
            <h2 className="font-black text-white tracking-tight text-base">SmartDom</h2>
            <p className="text-[9px] font-bold text-violet-400 uppercase tracking-[0.15em] leading-none">Platform Admin</p>
          </div>
        </div>

        {/* Right side - Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{session?.user?.name || 'Platform Admin'}</p>
            <p className="text-xs text-white/40">Super User</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-white/10 border-2 border-white/20 shadow-sm overflow-hidden flex items-center justify-center">
             <span className="text-lg">👨‍💻</span>
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
        className={`fixed top-0 left-0 h-full w-72 bg-[#0F172A] border-r border-white/10 flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-black text-white text-lg shadow-lg flex-shrink-0">
              S
            </div>
            <div>
              <h2 className="font-black text-white tracking-tight text-sm">SmartDom</h2>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest leading-none mt-1">Platform Admin</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/50 hover:bg-white/5 hover:text-white rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Admin Info */}
        <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">ล็อกอินเป็น</p>
          <p className="text-sm font-bold text-white truncate">{session?.user?.name || 'Platform Admin'}</p>
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
                  const isActive = (item as any).exact ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        isActive
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                          : 'text-white/50 hover:bg-white/5 hover:text-white'
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
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xl font-semibold text-sm transition-all"
          >
            <span>🚪</span>
            ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}
