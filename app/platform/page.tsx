'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Stats {
  totalDorms: number;
  activeSubs: number;
  monthRevenue: number;
  totalRevenue: number;
}

interface RecentDorm {
  id: number;
  dorm_name: string;
  owner_name: string;
  status: string;
  created_at: string;
}

interface RecentSub {
  id: number;
  dorm_name: string;
  package_name: string;
  status: string;
  amount_paid: number;
  start_date: string;
  end_date: string;
}

export default function PlatformDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentDorms, setRecentDorms] = useState<RecentDorm[]>([]);
  const [recentSubs, setRecentSubs] = useState<RecentSub[]>([]);
  const [packageBreakdown, setPackageBreakdown] = useState<any[]>([]);
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
          setRecentSubs(data.recentSubs);
          setPackageBreakdown(data.packageBreakdown);
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

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'หอพักที่ใช้งาน', value: fmt(stats?.totalDorms ?? 0), icon: '🏢', color: 'from-blue-500 to-cyan-500', sub: 'Active Dorms' },
              { label: 'สมาชิกทั้งหมด', value: fmt(stats?.activeSubs ?? 0), icon: '🔖', color: 'from-violet-500 to-purple-600', sub: 'Active Subscriptions' },
              { label: 'รายรับเดือนนี้', value: `฿${fmt(stats?.monthRevenue ?? 0)}`, icon: '💰', color: 'from-emerald-500 to-teal-600', sub: 'Monthly Revenue' },
              { label: 'รายรับรวมทั้งหมด', value: `฿${fmt(stats?.totalRevenue ?? 0)}`, icon: '📈', color: 'from-amber-500 to-orange-600', sub: 'Total Revenue' },
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

          {/* Package Breakdown + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Package Breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                <span>📦</span> แพ็กเกจที่ใช้งาน
              </h3>
              <div className="space-y-3">
                {packageBreakdown.length === 0 ? (
                  <p className="text-white/30 text-sm">ยังไม่มีข้อมูล</p>
                ) : packageBreakdown.map((pkg: any, i: number) => {
                  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500'];
                  const total = packageBreakdown.reduce((s: number, p: any) => s + Number(p.count), 0);
                  const pct = total > 0 ? Math.round((Number(pkg.count) / total) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-white/70 text-sm font-semibold">{pkg.name}</span>
                        <span className="text-white text-sm font-black">{pkg.count} หอพัก</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Subscriptions */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold flex items-center gap-2"><span>🔖</span> การสมัครล่าสุด</h3>
                <a href="/platform/subscriptions" className="text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">ดูทั้งหมด →</a>
              </div>
              <div className="space-y-3">
                {recentSubs.length === 0 ? (
                  <p className="text-white/30 text-sm">ยังไม่มีข้อมูล</p>
                ) : recentSubs.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white font-semibold text-sm">{sub.dorm_name}</p>
                      <p className="text-white/40 text-xs">{sub.package_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">฿{fmt(sub.amount_paid)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        sub.status === 'Expired' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>{sub.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
