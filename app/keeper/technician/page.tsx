'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import KeeperSidebar from '../components/KeeperSidebar';

export default function TechnicianDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');

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

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('th-TH'));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('th-TH'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center bg-secondary/5 font-display text-muted-foreground">กำลังโหลดระบบ...</div>;
  }

  return (
    <div className="flex h-screen bg-secondary/5">
      <KeeperSidebar />
      
      <main className="flex-1 flex flex-col h-screen min-w-0">
        {/* Header */}
        <header className="h-20 bg-background border-b border-border flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">ภาพรวมงานช่าง</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">ยินดีต้อนรับสู่แผงควบคุม Technician Panel</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-muted-foreground hidden sm:block">เวลาปัจจุบัน: {currentTime}</div>
            <button
              onClick={() => signOut({ callbackUrl: '/signin' })}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors px-4 py-2 rounded-xl"
            >
              ออกจากระบบ
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-border shadow-sm">
              <Image width={40} height={40} src={`https://ui-avatars.com/api/?name=${session?.user?.name || 'Technician'}&background=4f46e5&color=fff`} alt="ช่างซ่อม" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-background border border-border shadow-sm p-6 rounded-3xl flex flex-col">
                <span className="text-sm font-semibold text-foreground">งานซ่อมทั้งหมด</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-display font-semibold">8</span>
                  <span className="text-sm text-muted-foreground font-medium">รายการ</span>
                </div>
              </div>
              <div className="bg-background border border-border shadow-sm p-6 rounded-3xl flex flex-col">
                <span className="text-sm font-semibold text-foreground">รอดำเนินการ / ด่วน</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-display font-semibold text-rose-500">3</span>
                  <span className="text-sm text-rose-500/70 font-medium">รายการ</span>
                </div>
              </div>
              <div className="bg-background border border-border shadow-sm p-6 rounded-3xl flex flex-col">
                <span className="text-sm font-semibold text-foreground">ซ่อมเสร็จแล้ว</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-display font-semibold text-green-500">5</span>
                  <span className="text-sm text-green-500/70 font-medium">รายการ</span>
                </div>
              </div>
            </div>

            {/* List */}
            <section className="bg-background border border-border rounded-3xl shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">รายการแจ้งซ่อม (ใบงาน)</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">ตรวจสอบและรับงานซ่อมแซมได้ที่นี่</p>
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {[
                  { room: '405', issue: 'แอร์น้ำหยด', time: '2 ชั่วโมงที่แล้ว', status: 'ยังไม่ได้รับงาน', isRush: true, bg: 'bg-rose-100 text-rose-700' },
                  { room: '201', issue: 'หลอดไฟระเบียงขาด', time: '5 ชั่วโมงที่แล้ว', status: 'กำลังดำเนินการ', isRush: false, bg: 'bg-amber-100 text-amber-700' },
                  { room: '112', issue: 'ก๊อกน้ำอ่างล้างหน้าไหลซึม', time: '1 วันที่แล้ว', status: 'รออะไหล่', isRush: false, bg: 'bg-secondary text-secondary-foreground' },
                ].map((task, i) => (
                  <div key={i} className="px-7 py-5 flex items-center gap-6 hover:bg-accent/40 transition-colors">
                    <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex flex-col items-center justify-center shrink-0 border border-border/50">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">ห้อง</span>
                      <span className="text-sm font-black text-foreground leading-none">{task.room}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">{task.issue}</h3>
                        {task.isRush && (
                          <span className="px-1.5 pt-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-rose-500 text-white leading-tight">
                            ด่วน
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${task.bg}`}>
                          {task.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground/80 font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          แจ้งเมื่อ {task.time}
                        </span>
                      </div>
                    </div>
                    <div>
                      <button className="text-xs font-semibold px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95">
                        รับงานซ่อม
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
