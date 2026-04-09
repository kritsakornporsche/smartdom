'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TechnicianDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      const user = session?.user as any;
      if (user?.role !== 'keeper' || user?.sub_role !== 'technician') {
        router.push('/');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-lg shadow-inner border border-indigo-400">
            T
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">ระบบช่างซ่อมบำรุง</h1>
            <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase">SmartDom Technician</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold hidden sm:inline-block text-slate-300">คุณ {session?.user?.name}</span>
          <button 
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-md hover:bg-slate-700 hover:text-white transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 space-y-6 mt-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">งานซ่อมทั้งหมด</h3>
            <p className="text-4xl font-black text-slate-700">8 <span className="text-sm text-slate-400 font-medium tracking-normal">รายการ</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <h3 className="text-rose-500 font-bold text-xs uppercase tracking-wider mb-2">ด่วน / รอดำเนินการ</h3>
            <p className="text-4xl font-black text-rose-600">3 <span className="text-sm text-rose-400 font-medium tracking-normal">รายการ</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <h3 className="text-emerald-500 font-bold text-xs uppercase tracking-wider mb-2">ซ่อมเสร็จแล้ว</h3>
            <p className="text-4xl font-black text-emerald-600">5 <span className="text-sm text-emerald-400 font-medium tracking-normal">รายการ</span></p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              รายการแจ้งซ่อม (ใบงาน)
            </h2>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-slate-100">
              {[
                { room: '405', issue: 'แอร์น้ำหยด', urgency: 'ด่วนมาก', status: 'ยังไม่ได้รับงาน', isRush: true },
                { room: '201', issue: 'หลอดไฟระเบียงขาด', urgency: 'ปกติ', status: 'กำลังดำเนินการ', isRush: false },
                { room: '112', issue: 'ก๊อกน้ำอ่างล้างหน้าไหลซึม', urgency: 'ปกติ', status: 'รออะไหล่', isRush: false },
              ].map((task, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors gap-4 group">
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 group-hover:border-indigo-300 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">ห้อง</span>
                      <span className="text-lg font-black text-slate-700 leading-none">{task.room}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-bold text-base text-slate-800">{task.issue}</span>
                        {task.isRush && (
                          <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-rose-100 text-rose-600 border border-rose-200">
                            ด่วน
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                          {task.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        แจ้งเมื่อ 2 ชั่วโมงที่แล้ว
                      </p>
                    </div>
                  </div>
                  <button className="whitespace-nowrap px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-transform active:scale-95 border border-indigo-700">
                    จัดการงานซ่อม
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
