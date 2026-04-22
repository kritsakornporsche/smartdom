'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function KeeperSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [counts, setCounts] = useState<{ pending: number; total: number }>({ pending: 0, total: 0 });
  
  const subRole = (session?.user as any)?.sub_role;

  useEffect(() => {
    if (subRole) {
      const fetchCounts = async () => {
        try {
          const res = await fetch(`/api/keeper/${subRole}/jobs`);
          const json = await res.json();
          if (json.success) {
            const jobs = json.data.jobs || [];
            const pending = jobs.filter((j: any) => j.status === 'pending' || j.status === 'rush').length;
            setCounts({ pending, total: jobs.length });
          }
        } catch (err) {
          console.error('Sidebar fetch error:', err);
        }
      };
      
      fetchCounts();
      const interval = setInterval(fetchCounts, 60000); // Check every 60s
      return () => clearInterval(interval);
    }
  }, [subRole]);

  const commonNavItems = [
    {
      href: '/keeper/schedule',
      label: 'ตารางงาน (Schedule)',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      href: '/keeper/supplies',
      label: 'เบิกวัสดุ/อุปกรณ์',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
  ];

  let navItems: any[] = [];

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
        href: '/keeper/maid/jobs',
        label: 'บันทึกทำความสะอาด',
        badge: counts.pending,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
      ...commonNavItems
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
        href: '/keeper/technician/jobs',
        label: 'รายการแจ้งซ่อม',
        badge: counts.pending,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      ...commonNavItems
    ];
  }

  return (
    <aside className="w-64 bg-[#FAF8F5] border-r border-[#E5DFD3] flex flex-col shrink-0 shadow-sm relative z-20">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-[#E5DFD3]">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[#8B7355] text-white font-display font-bold text-lg shadow-lg shadow-[#8B7355]/20 transition-transform group-hover:rotate-12">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight text-[#3E342B] leading-none">
              SmartDom
            </span>
            <span className="text-sm font-bold text-[#A08D74] mt-1">
              {subRole === 'technician' ? 'TECHNICIAN' : subRole === 'maid' ? 'MAID' : 'KEEPER'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="px-4 py-2 text-sm font-black uppercase tracking-wide text-[#A08D74]/60 mb-2">
          Dashboard
        </p>
        {navItems.length > 0 ? (
          navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all relative group ${
                  isActive
                    ? 'bg-[#8B7355] text-white shadow-xl shadow-[#8B7355]/30'
                    : 'text-[#A08D74] hover:bg-[#F3EFE9] hover:text-[#5A4D41]'
                }`}
              >
                <span className={`transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`}>{item.icon}</span>
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                   <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-black ${isActive ? 'bg-white text-[#8B7355]' : 'bg-rose-500 text-white animate-pulse'}`}>
                      {item.badge}
                   </span>
                )}
                {isActive && !item.badge && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </Link>
            );
          })
        ) : (
          <div className="px-4 text-xs text-[#A08D74]">ไม่มีเมนูที่กำหนด</div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E5DFD3] bg-white/50">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 text-[#A08D74] hover:text-[#5A4D41] rounded-2xl font-bold text-xs transition-colors hover:bg-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          ตั้งค่าโปรไฟล์
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-[#A08D74] hover:text-[#5A4D41] rounded-2xl font-bold text-xs transition-colors hover:bg-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          กลับหน้าหลัก
        </Link>
      </div>
    </aside>
  );
}
