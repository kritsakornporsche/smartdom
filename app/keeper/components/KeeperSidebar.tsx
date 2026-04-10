'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function KeeperSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const subRole = (session?.user as any)?.sub_role;

  // Define nav items based on subRole
  let navItems: { href: string; label: string; icon: JSX.Element }[] = [];

  if (subRole === 'maid') {
    navItems = [
      {
        href: '/keeper/maid',
        label: 'ภาพรวมงานแม่บ้าน',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        href: '#', // placeholder
        label: 'บันทึกทำความสะอาด',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
    ];
  } else if (subRole === 'technician') {
    navItems = [
      {
        href: '/keeper/technician',
        label: 'ภาพรวมงานช่าง',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        href: '#', // placeholder
        label: 'รายการแจ้งซ่อม',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ];
  }

  return (
    <aside className="w-64 bg-[#FAF8F5] border-r border-[#E5DFD3] flex flex-col shrink-0 shadow-sm">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-[#E5DFD3]">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#8B7355] text-white font-display font-bold text-base shadow-sm transition-transform group-hover:scale-105">
            S
          </div>
          <span className="font-display font-bold text-base tracking-tight text-[#3E342B]">
            {subRole === 'technician' ? 'SmartDom ช่างซ่อม' : subRole === 'maid' ? 'SmartDom แม่บ้าน' : 'SmartDom Keeper'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A08D74] mb-2">
          เมนูการจัดการ
        </p>
        {navItems.length > 0 ? (
          navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-[#8B7355] text-white shadow-md'
                    : 'text-[#A08D74] hover:bg-[#F3EFE9] hover:text-[#5A4D41]'
                }`}
              >
                <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </Link>
            );
          })
        ) : (
          <div className="px-4 text-xs text-[#A08D74]">ไม่มีเมนูเนื่องจากผู้ใช้ไม่มีสิทธิ์ที่ถูกต้อง</div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E5DFD3]">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-[#A08D74] hover:text-[#5A4D41] rounded-xl font-medium text-sm transition-colors hover:bg-[#F3EFE9]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </aside>
  );
}
