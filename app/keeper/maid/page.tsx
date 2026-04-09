'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function MaidDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      const user = session?.user as any;
      if (user?.role !== 'keeper' || user?.sub_role !== 'maid') {
        router.push('/');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-rose-50/30 font-sans text-rose-950">
      {/* Header */}
      <header className="bg-white border-b border-rose-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            M
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">ระบบจัดการแม่บ้าน</h1>
            <p className="text-xs text-rose-500 font-medium tracking-wide">SMARTDOM MAID PANEL</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold hidden sm:inline-block">คุณ {session?.user?.name}</span>
          <button 
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="text-xs font-bold bg-rose-100 text-rose-700 px-4 py-2 rounded-full hover:bg-rose-200 transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
            <h3 className="text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">งานทำความสะอาดวันนี้</h3>
            <p className="text-4xl font-black text-rose-600">5 <span className="text-lg text-rose-400 font-medium">ห้อง</span></p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
            <h3 className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">กำลังรอดำเนินการ</h3>
            <p className="text-4xl font-black text-amber-500">2 <span className="text-lg text-amber-400 font-medium">ห้อง</span></p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
            <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">เสร็จสิ้นแล้ว</h3>
            <p className="text-4xl font-black text-emerald-500">3 <span className="text-lg text-emerald-400 font-medium">ห้อง</span></p>
          </div>
        </div>

        <section className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-rose-100 flex items-center justify-between">
            <h2 className="font-bold text-lg">รายการห้องที่ต้องทำความสะอาด</h2>
            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">อัปเดตล่าสุด: ตอนนี้</span>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-rose-50">
              {[
                { room: '101', status: 'รอทำความสะอาด', type: 'ย้ายออก', color: 'text-amber-500 bg-amber-50 border-amber-100' },
                { room: '205', status: 'ร้องขอพิเศษ', type: 'ทำความสะอาดรายสัปดาห์', color: 'text-rose-500 bg-rose-50 border-rose-100' },
                { room: '302', status: 'เสร็จสิ้น', type: 'ทำความสะอาดรายสัปดาห์', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
              ].map((task, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-rose-50/50 transition-colors gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl font-black">ห้อง {task.room}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${task.color}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-rose-600/70 font-medium">ประเภท: {task.type}</p>
                  </div>
                  <button className="whitespace-nowrap px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl shadow-md shadow-rose-500/20 transition-transform active:scale-95">
                    อัปเดตสถานะ
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </main>
    </div>
  );
}
