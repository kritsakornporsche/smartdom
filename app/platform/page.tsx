'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { SYSTEM_UPDATES } from '@/lib/updatesData';

interface Stats {
  totalDorms: number;
  totalTenants: number;
  totalRooms: number;
  occupiedRooms: number;
}

interface RecentDorm {
  id: number;
  dorm_name: string;
  owner_name: string;
  status: string;
  created_at: string;
}

export default function PlatformDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentDorms, setRecentDorms] = useState<RecentDorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    async function checkDb() {
      try {
        const res = await fetch('/api/db-test');
        const data = await res.json();
        if (data.success) setDbStatus('connected');
        else { setDbStatus('error'); setErrorDetails(data.error); }
      } catch (err: any) {
        setDbStatus('error');
        setErrorDetails(err.message);
      }
    }
    checkDb();
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if ((session?.user as any)?.role !== 'platform_admin') {
      router.push('/signin');
      return;
    }
    fetch('/api/platform/dashboard')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setRecentDorms(data.recentDorms);
        }
      })
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const fmt = (n: number) => n.toLocaleString('th-TH');

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-white/50 text-sm font-semibold">กำลังโหลด...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-10 py-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Platform Dashboard</h1>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-0.5">ภาพรวมแพลตฟอร์ม SmartDom</p>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
          dbStatus === 'connected' ? 'bg-green-500/10 border-green-500/20' :
          dbStatus === 'error' ? 'bg-red-500/10 border-red-500/20' :
          'bg-yellow-500/10 border-yellow-500/20'
        }`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${
            dbStatus === 'connected' ? 'bg-green-400' :
            dbStatus === 'error' ? 'bg-red-400' :
            'bg-yellow-400'
          }`} />
          <span className={`text-xs font-bold ${
            dbStatus === 'connected' ? 'text-green-400' :
            dbStatus === 'error' ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {dbStatus === 'connected' ? 'ระบบทำงานปกติ (Online)' :
             dbStatus === 'error' ? 'พบปัญหาการเชื่อมต่อ (Offline)' :
             'กำลังตรวจสอบระบบ...'}
          </span>
        </div>
      </header>

      {dbStatus === 'error' && (
        <div className="mx-10 mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
          <div className="text-red-400 text-lg leading-none mt-0.5">⚠️</div>
          <div>
            <h4 className="text-red-400 font-bold text-sm">การเชื่อมต่อฐานข้อมูล/API ล้มเหลว</h4>
            <p className="text-red-400/80 text-xs mt-1 font-mono break-all">{errorDetails}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* System Version & Latest Update Banner */}
          {(() => {
            const latestUpdate = SYSTEM_UPDATES[0];
            return (
              <div className="bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-slate-900/40 border border-violet-500/30 rounded-3xl p-6 sm:p-7 relative overflow-hidden backdrop-blur-md shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        ระบบเวอร์ชัน {latestUpdate?.version || 'v2.5.0'}
                      </span>
                      <span className="text-white/40 text-xs font-medium">
                        อัปเดตล่าสุด: {latestUpdate?.date}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight">
                      {latestUpdate?.tagline}
                    </h2>
                    <p className="text-white/60 text-xs max-w-2xl leading-relaxed">
                      สรุปการปรับปรุงระบบ: ระบบแจ้งเตือนสลิปไปยังเจ้าของหอพักทันที, ปลดระวางโมดูลเหรียญ/Wallet, และจัดระเบียบโครงสร้างฐานข้อมูล Single Database เหลือ 21 ตารางมาตรฐาน
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href="/updates"
                      className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/20 flex items-center gap-2"
                    >
                      <span>📋</span>
                      <span>ดูบันทึกการอัปเดตฉบับเต็ม</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>

                {/* Micro Tasks Badges */}
                <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {latestUpdate?.tasks.map((task) => (
                    <div key={task.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white/80">
                          {task.category}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white/90 line-clamp-2" title={task.title}>
                        {task.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'หอพักที่ใช้งาน', value: fmt(stats?.totalDorms ?? 0), icon: '🏢', color: 'from-blue-500 to-cyan-500', sub: 'Active Dorms' },
              { label: 'ผู้เช่าทั้งหมดในระบบ', value: fmt(stats?.totalTenants ?? 0), icon: '👥', color: 'from-violet-500 to-purple-600', sub: 'Active Tenants' },
              { label: 'ห้องพักทั้งหมด', value: fmt(stats?.totalRooms ?? 0), icon: '🚪', color: 'from-emerald-500 to-teal-600', sub: 'Total Rooms' },
              { label: 'ห้องพักที่มีผู้เช่า', value: fmt(stats?.occupiedRooms ?? 0), icon: '🔑', color: 'from-amber-500 to-orange-600', sub: 'Occupied Rooms' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                  {kpi.icon}
                </div>
                <p className="text-3xl font-black text-white mb-1">{kpi.value}</p>
                <p className="text-white/60 text-xs font-semibold">{kpi.label}</p>
                <p className="text-white/25 text-[10px] uppercase tracking-wider mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <a href="/platform/dormitories" className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">🏢</div>
                 <div>
                   <h3 className="text-white font-bold group-hover:text-emerald-400 transition-colors">หอพักในระบบ</h3>
                   <p className="text-white/50 text-xs mt-0.5">ตรวจสอบและจัดการบัญชี</p>
                 </div>
              </div>
              <span className="text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">→</span>
            </a>
            <a href="/platform/tenants" className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xl">👥</div>
                 <div>
                   <h3 className="text-white font-bold group-hover:text-violet-400 transition-colors">ทะเบียนผู้เช่า</h3>
                   <p className="text-white/50 text-xs mt-0.5">เรียกดูรายชื่อตามหอพัก</p>
                 </div>
              </div>
              <span className="text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all">→</span>
            </a>
            <a href="/admin/diagrams" className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">📊</div>
                 <div>
                   <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">แผนภาพระบบ</h3>
                   <p className="text-white/50 text-xs mt-0.5">Use Case & Sequence Diagrams</p>
                 </div>
              </div>
              <span className="text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">→</span>
            </a>
          </div>

          {/* Recent Dormitories */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold flex items-center gap-2"><span>🏢</span> หอพักที่เพิ่งสมัครใหม่</h3>
              <a href="/platform/dormitories" className="text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">ดูทั้งหมด →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/30 text-xs uppercase tracking-widest">
                    <th className="text-left pb-3 font-bold">ชื่อหอพัก</th>
                    <th className="text-left pb-3 font-bold">เจ้าของ</th>
                    <th className="text-left pb-3 font-bold">วันที่สมัคร</th>
                    <th className="text-left pb-3 font-bold">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentDorms.length === 0 ? (
                    <tr><td colSpan={4} className="text-white/30 py-4">ยังไม่มีข้อมูล</td></tr>
                  ) : recentDorms.map((d) => (
                    <tr key={d.id} className="hover:bg-white/3 transition-colors">
                      <td className="py-3 text-white font-semibold">{d.dorm_name}</td>
                      <td className="py-3 text-white/60">{d.owner_name}</td>
                      <td className="py-3 text-white/60">{new Date(d.created_at).toLocaleDateString('th-TH')}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          d.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                          d.status === 'Suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
