'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import KeeperSidebar from '../components/KeeperSidebar';

interface MaidData {
  stats: {
    total: number;
    inProgress: number;
    completed: number;
  };
  jobs: Array<{
    id: number;
    status: string;
    job_type: string;
    created_at: string;
    room_number: string;
  }>;
}

const statusConfig: Record<string, { label: string; bg: string }> = {
  pending: { label: 'รอทำความสะอาด', bg: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'กำลังดำเนินการ', bg: 'bg-primary/10 text-primary' },
  completed: { label: 'เสร็จสิ้น', bg: 'bg-green-100 text-green-700' },
};

const jobTypeConfig: Record<string, string> = {
  move_out: 'ย้ายออก',
  weekly: 'ทำความสะอาดรายสัปดาห์',
  requested: 'ร้องขอพิเศษ',
};

export default function MaidDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [data, setData] = useState<MaidData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      const user = session?.user as any;
      if (user?.role !== 'keeper' || user?.sub_role !== 'maid') {
        router.push('/');
      } else {
        fetchData();
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

  const fetchData = async () => {
    try {
      const res = await fetch('/api/keeper/maid/jobs');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Error fetching maid jobs:', err);
    } finally {
      setLoadingData(false);
    }
  };

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
            <h1 className="font-display text-xl font-semibold tracking-tight">ภาพรวมงานแม่บ้าน</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">ยินดีต้อนรับสู่แผงควบคุม Maid Panel</p>
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
              <Image width={40} height={40} src={`https://ui-avatars.com/api/?name=${session?.user?.name || 'Maid'}&background=e2aba1&color=fff`} alt="แม่บ้าน" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-background border border-border shadow-sm p-6 rounded-3xl flex flex-col">
                <span className="text-sm font-semibold text-foreground">งานทำความสะอาดวันนี้</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-display font-semibold">{loadingData ? '-' : data?.stats?.total || 0}</span>
                  <span className="text-sm text-muted-foreground font-medium">ห้อง</span>
                </div>
              </div>
              <div className="bg-background border border-border shadow-sm p-6 rounded-3xl flex flex-col">
                <span className="text-sm font-semibold text-foreground">กำลังดำเนินการ</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-display font-semibold text-amber-500">{loadingData ? '-' : data?.stats?.inProgress || 0}</span>
                  <span className="text-sm text-amber-500/70 font-medium">ห้อง</span>
                </div>
              </div>
              <div className="bg-background border border-border shadow-sm p-6 rounded-3xl flex flex-col">
                <span className="text-sm font-semibold text-foreground">เสร็จสิ้นแล้ว</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-display font-semibold text-green-500">{loadingData ? '-' : data?.stats?.completed || 0}</span>
                  <span className="text-sm text-green-500/70 font-medium">ห้อง</span>
                </div>
              </div>
            </div>

            {/* List */}
            <section className="bg-background border border-border rounded-3xl shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">รายการห้องพัก (คิวงาน)</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">รายชื่อห้องที่ต้องเข้าไปทำความสะอาด</p>
                </div>
                <button onClick={fetchData} className="text-xs text-muted-foreground hover:text-foreground">รีเฟรชข้อมูล</button>
              </div>
              
              {loadingData ? (
                <div className="p-8 text-center text-sm text-muted-foreground">กำลังโหลดข้อมูล...</div>
              ) : data?.jobs.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">ไม่มีคิวงานทำความสะอาด</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {data?.jobs.map((task) => (
                    <div key={task.id} className="px-7 py-5 flex items-center gap-6 hover:bg-accent/40 transition-colors">
                      <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">ห้อง</span>
                        <span className="text-sm font-black text-foreground leading-none">{task.room_number || '-'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">{jobTypeConfig[task.job_type] || task.job_type}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${statusConfig[task.status]?.bg || 'bg-secondary text-secondary-foreground'}`}>
                            {statusConfig[task.status]?.label || task.status}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(task.created_at).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      </div>
                      <div>
                        {task.status !== 'completed' && (
                          <button className="text-xs font-semibold px-4 py-2 bg-primary text-primary-foreground rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform active:scale-95">
                            จัดการ
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
