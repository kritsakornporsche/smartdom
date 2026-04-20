'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminSidebar from './components/AdminSidebar';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'tenant' | 'keeper' | 'owner';
  is_active: boolean;
  created_at: string;
}

interface UserSummary {
  total: string;
  owners: string;
  keepers: string;
  tenants: string;
  active: string;
}

const roleLabel: Record<string, string> = {
  owner: 'แอดมิน',
  keeper: 'ผู้ดูแล',
  tenant: 'ผู้เช่า',
};

const roleBadge: Record<string, string> = {
  owner: 'bg-[#8B7355]/10 text-[#8B7355]',
  keeper: 'bg-amber-100 text-amber-700',
  tenant: 'bg-green-100 text-green-700',
};

export default function AdminDashboardPage() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [data, setData] = useState({
    totalRooms: 0,
    totalTenants: 0,
    monthlyIncome: 0,
    revenueHistory: [] as { month: string; revenue: number }[]
  });

  // ── Fetch all data ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoadingStats(true);
    setLoadingUsers(true);
    try {
      const [dbRes, statsRes, usersRes] = await Promise.all([
        fetch('/api/db-test'),
        fetch('/api/admin/stats'),
        fetch('/api/auth/users')
      ]);
      
      const dbData = await dbRes.json();
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      
      if (dbData.success) {
        setDbStatus('connected');
      } else {
        setDbStatus('error');
        setErrorDetails(dbData.error);
      }
      
      if (statsData.success) {
        setData(statsData.data);
      }

      if (usersData.success) {
        setUsers(usersData.data);
        setSummary(usersData.summary);
        setLastRefresh(new Date());
      }
    } catch (err: any) {
      setDbStatus('error');
      setErrorDetails(err.message);
    } finally {
      setLoadingStats(false);
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = [
    {
      label: 'ห้องพักทั้งหมด',
      value: loadingStats ? '...' : data.totalRooms.toString(),
      trend: '+0',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'ผู้เช่าทั้งหมด',
      value: loadingStats ? '...' : data.totalTenants.toString(),
      trend: '+0',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'รายได้เดือนนี้',
      value: loadingStats ? '...' : `฿${data.monthlyIncome.toLocaleString()}`,
      trend: '0%',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-[#3E342B]">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[#3E342B]">ภาพรวมระบบ</h1>
            <p className="text-[10px] text-[#A08D74] font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Admin Management System</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              title="รีเฟรชข้อมูล"
              className="w-10 h-10 flex items-center justify-center text-[#A08D74] hover:text-[#3E342B] hover:bg-[#F3EFE9] rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#E5DFD3] shadow-sm">
              <Image width={40} height={40} src="https://ui-avatars.com/api/?name=Admin&background=8B7355&color=fff" alt="แอดมิน" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* ── Database Connection Status ───────────────────────────────── */}
            <section className="bg-white border border-[#E5DFD3] rounded-3xl p-7 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h2 className="font-display text-base font-bold text-[#3E342B] mb-1.5 whitespace-nowrap">สถานะการเชื่อมต่อฐานข้อมูล</h2>
                  <p className="text-sm text-[#A08D74] leading-relaxed max-w-lg font-medium">
                    ตรวจสอบการเชื่อมต่อ Neon PostgreSQL แบบเรียลไทม์ หากพบข้อผิดพลาด กรุณาตรวจสอบค่าใน{' '}
                    <code className="bg-[#FAF8F5] px-1.5 py-0.5 rounded-md font-mono text-xs text-[#8B6A2B] border border-[#E5DFD3]">.env.local</code>
                  </p>
                </div>
                <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shrink-0 ${
                  dbStatus === 'connected' ? 'bg-[#F0FDF4] border-emerald-200 text-emerald-700'
                  : dbStatus === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-[#F3EFE9] border-[#E5DFD3] text-[#A08D74]'
                }`}>
                  <div className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      dbStatus === 'connected' ? 'bg-emerald-500' : dbStatus === 'error' ? 'bg-rose-500' : 'bg-[#8B7355]/60'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      dbStatus === 'connected' ? 'bg-emerald-500' : dbStatus === 'error' ? 'bg-rose-500' : 'bg-[#8B7355]/60'
                    }`} />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-wider">
                    {dbStatus === 'connected' && 'Online'}
                    {dbStatus === 'checking' && 'Checking...'}
                    {dbStatus === 'error' && 'Offline'}
                  </span>
                </div>
              </div>

              {dbStatus === 'error' && (
                <div className="mt-5 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1.5">รายละเอียดข้อผิดพลาด</div>
                  <div className="font-mono text-sm text-rose-700 break-all">{errorDetails}</div>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-[#E5DFD3] flex items-center gap-8 flex-wrap">
                {[
                  { label: 'ฐานข้อมูล', value: 'Neon Serverless PostgreSQL' },
                  { label: 'ภูมิภาค', value: 'AWS us-east-1' },
                  { label: 'สถานะ API', value: 'ออนไลน์' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#A08D74] mb-0.5">{item.label}</div>
                    <div className="text-sm font-bold text-[#3E342B]">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── KPI Stats ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E5DFD3] rounded-3xl p-7 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform"
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#A08D74]">{stat.label}</p>
                    <div className="p-2 bg-[#F3EFE9] rounded-xl text-[#8B7355]">{stat.icon}</div>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="font-display text-3xl font-bold text-[#3E342B]">{stat.value}</span>
                    <span
                      className={`flex items-center gap-0.5 text-xs font-bold pb-1 ${
                        stat.trendUp ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d={stat.trendUp ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
                        />
                      </svg>
                      {stat.trend}
                    </span>
                  </div>
                  {/* Decorative */}
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#8B7355]/5 rounded-full blur-2xl group-hover:bg-[#8B7355]/10 transition-colors duration-500" />
                </div>
              ))}
            </div>

            {/* ── Revenue Summary Chart ────────────────────────────────────────── */}
            <section className="bg-white border border-[#E5DFD3] rounded-3xl p-7 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="font-display text-base font-bold text-[#3E342B]">สรุปรายได้รายเดือน</h2>
                  <p className="text-xs text-[#A08D74] font-medium mt-1">เปรียบเทียบผลประกอบการในรอบ 6 เดือนที่ผ่านมา</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-[10px] font-black uppercase text-emerald-600 border border-emerald-200 tracking-widest">
                      Real-time Data
                   </div>
                </div>
              </div>

              {loadingStats ? (
                <div className="h-64 flex items-center justify-center bg-[#FAF8F5] rounded-2xl animate-pulse">
                   <span className="text-xs font-bold text-[#A08D74] uppercase tracking-widest">กำลังคิดคำนวณข้อมูล...</span>
                </div>
              ) : (
                <div className="h-64 flex items-end gap-4 lg:gap-8 px-4 border-b border-[#F3EFE9]">
                  {data.revenueHistory.map((item, idx) => {
                    const maxRevenue = Math.max(...data.revenueHistory.map(h => h.revenue), 1000);
                    const heightPercent = (item.revenue / maxRevenue) * 100;
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-90 group-hover:scale-100 z-10">
                           <div className="bg-[#3E342B] text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                             ฿{item.revenue.toLocaleString()}
                           </div>
                        </div>

                        {/* Bar */}
                        <div 
                           style={{ height: `${Math.max(heightPercent, 5)}%` }} // Minimum height for visibility
                           className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 delay-[100ms] cursor-pointer relative overflow-hidden ${
                             idx === data.revenueHistory.length - 1 
                               ? 'bg-[#8B7355] shadow-lg shadow-[#8B7355]/20' 
                               : 'bg-[#E5DFD3] group-hover:bg-[#D5CDBF]'
                           }`}
                        >
                           <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/20 to-transparent" />
                        </div>
                        
                        {/* Month Label */}
                        <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#A08D74] group-hover:text-[#8B7355] transition-colors mb-[-1.5rem]">
                          {item.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Users Summary KPI ────────────────────────────────────────── */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'ผู้ใช้ทั้งหมด', value: summary.total, color: 'text-[#3E342B]' },
                  { label: 'เจ้าของหอ', value: summary.owners, color: 'text-[#8B6A2B]' },
                  { label: 'ผู้ดูแล', value: summary.keepers, color: 'text-[#A08D74]' },
                  { label: 'ผู้เช่า', value: summary.tenants, color: 'text-emerald-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-[#E5DFD3] rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#A08D74] mb-2">{s.label}</p>
                    <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Users from DB (real-time) ────────────────────────────────── */}
            <section className="bg-white border border-[#E5DFD3] rounded-3xl overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-[#E5DFD3]">
                <div>
                  <h2 className="font-display text-base font-bold text-[#3E342B]">ผู้ใช้งานในระบบ</h2>
                  <p className="text-[10px] text-[#A08D74] font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">
                    {lastRefresh ? `อัปเดตล่าสุด ${lastRefresh.toLocaleTimeString('th-TH')}` : 'กำลังดึงข้อมูล...'}
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="flex items-center gap-2 text-xs font-bold text-[#8B6A2B] hover:bg-[#F3EFE9] px-4 py-2 rounded-full transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  REFRESH
                </button>
              </div>


              {/* Table Body */}
              {loadingUsers ? (
                <div className="p-12 text-center text-[#A08D74]">
                  <svg className="animate-spin h-7 w-7 text-[#8B7355] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm font-medium">กำลังดึงข้อมูลจากฐานข้อมูล...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-14 text-center">
                  <div className="w-14 h-14 bg-[#F3EFE9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-[#A08D74]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#3E342B] mb-1">ยังไม่มีผู้ใช้งาน</h3>
                  <p className="text-sm text-[#A08D74] mb-5 font-medium">เชิญผู้ใช้คนแรกสมัครผ่านหน้า Signup</p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#8B7355] hover:bg-[#8B7355]/10 px-5 py-2.5 rounded-full border border-[#8B7355]/20 transition-colors"
                  >
                    ไปหน้าสมัครสมาชิก →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#FAF8F5] border-b border-[#E5DFD3]">
                      <tr>
                        {['#', 'ชื่อ-นามสกุล', 'อีเมล', 'บทบาท', 'สถานะ', 'สมัครเมื่อ'].map((h) => (
                          <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#A08D74] whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3EFE9]">

                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-[#A08D74]">
                            #{String(u.id).padStart(5, '0')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-[#8B7355]/10 flex items-center justify-center text-[#8B7355] font-bold text-sm shrink-0">
                                {u.full_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-[#3E342B] whitespace-nowrap">{u.full_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#A08D74] font-medium">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleBadge[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                              {roleLabel[u.role] ?? u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1.5 text-xs font-bold ${u.is_active ? 'text-emerald-600' : 'text-rose-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                              {u.is_active ? 'ใช้งานอยู่' : 'ระงับการใช้งาน'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#A08D74] font-medium whitespace-nowrap text-xs">
                            {formatDate(u.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer */}
              {!loadingUsers && users.length > 0 && (
                <div className="px-7 py-4 bg-[#FAF8F5] border-t border-[#E5DFD3] flex items-center justify-between">
                  <p className="text-xs text-[#A08D74] font-bold">
                    แสดงทั้งหมด <span className="font-bold text-[#3E342B]">{users.length}</span> รายการ
                  </p>
                  <Link
                    href="/signup"
                    className="text-xs font-bold text-[#8B7355] hover:underline"
                  >
                    + เชิญผู้ใช้ใหม่
                  </Link>
                </div>
              )}
            </section>

            {/* ── Quick Actions ────────────────────────────────────────── */}
            <section className="bg-white border border-[#E5DFD3] rounded-3xl p-7 shadow-sm">
              <h2 className="font-display text-base font-bold text-[#3E342B] mb-6">การดำเนินการด่วน</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/admin/rooms"
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-[#E5DFD3] hover:border-[#8B7355]/40 hover:bg-[#8B7355]/5 transition-all"
                >
                  <div className="p-3 bg-[#F3EFE9] rounded-xl text-[#8B7355] group-hover:bg-[#8B7355]/10 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-[#3E342B] text-sm">จัดการห้องพัก</div>
                    <div className="text-xs text-[#A08D74] mt-0.5 font-medium">เพิ่ม แก้ไข หรือลบข้อมูลห้องพัก</div>
                  </div>
                  <svg className="w-4 h-4 text-[#A08D74] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/admin/tenants"
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-[#E5DFD3] hover:border-[#8B7355]/40 hover:bg-[#8B7355]/5 transition-all"
                >
                  <div className="p-3 bg-[#F3EFE9] rounded-xl text-[#8B7355] group-hover:bg-[#8B7355]/10 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-[#3E342B] text-sm">จัดการผู้เช่า</div>
                    <div className="text-xs text-[#A08D74] mt-0.5 font-medium">ดูข้อมูลและจัดการผู้เช่าทั้งหมด</div>
                  </div>
                  <svg className="w-4 h-4 text-[#A08D74] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
