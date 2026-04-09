'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  owner: 'bg-primary/10 text-primary',
  keeper: 'bg-amber-100 text-amber-700',
  tenant: 'bg-green-100 text-green-700',
};

export default function AdminDashboardPage() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // ── Check DB connection ──────────────────────────────────────────────────────
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

  // ── Fetch users from DB ──────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setSummary(data.summary);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-background border-b border-border flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">ภาพรวมระบบ</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">ยินดีต้อนรับสู่แผงควบคุม SmartDom</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              title="รีเฟรชข้อมูล"
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="relative w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-primary rounded-full border-2 border-background" />
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-border shadow-sm">
              <img src="https://ui-avatars.com/api/?name=Admin&background=c46a4a&color=fff" alt="แอดมิน" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* ── Database Connection Status ───────────────────────────────── */}
            <section className="bg-white border border-border rounded-3xl p-7 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h2 className="font-display text-base font-semibold text-foreground mb-1.5">สถานะการเชื่อมต่อฐานข้อมูล</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                    ตรวจสอบการเชื่อมต่อ Neon PostgreSQL แบบเรียลไทม์ หากพบข้อผิดพลาด กรุณาตรวจสอบค่าใน{' '}
                    <code className="bg-accent/60 px-1.5 py-0.5 rounded-md font-mono text-xs">.env.local</code>
                  </p>
                </div>
                <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shrink-0 ${
                  dbStatus === 'connected' ? 'bg-green-50 border-green-200 text-green-700'
                  : dbStatus === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-accent/30 border-border text-muted-foreground'
                }`}>
                  <div className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      dbStatus === 'connected' ? 'bg-green-500' : dbStatus === 'error' ? 'bg-rose-500' : 'bg-primary/60'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      dbStatus === 'connected' ? 'bg-green-500' : dbStatus === 'error' ? 'bg-rose-500' : 'bg-primary/60'
                    }`} />
                  </div>
                  <span className="font-semibold text-sm">
                    {dbStatus === 'connected' && 'เชื่อมต่อสำเร็จ'}
                    {dbStatus === 'checking' && 'กำลังตรวจสอบ...'}
                    {dbStatus === 'error' && 'เชื่อมต่อไม่สำเร็จ'}
                  </span>
                </div>
              </div>
              {dbStatus === 'error' && (
                <div className="mt-5 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1.5">รายละเอียดข้อผิดพลาด</div>
                  <div className="font-mono text-sm text-rose-700 break-all">{errorDetails}</div>
                </div>
              )}
              <div className="mt-5 pt-5 border-t border-border flex items-center gap-8 flex-wrap">
                {[
                  { label: 'ฐานข้อมูล', value: 'Neon Serverless PostgreSQL' },
                  { label: 'ภูมิภาค', value: 'AWS us-east-1' },
                  { label: 'สถานะ API', value: 'ออนไลน์' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{item.label}</div>
                    <div className="text-sm font-semibold text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Users Summary KPI ────────────────────────────────────────── */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'ผู้ใช้ทั้งหมด', value: summary.total, color: 'text-foreground' },
                  { label: 'แอดมิน', value: summary.owners, color: 'text-primary' },
                  { label: 'ผู้ดูแล', value: summary.keepers, color: 'text-amber-600' },
                  { label: 'ผู้เช่า', value: summary.tenants, color: 'text-green-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{s.label}</p>
                    <p className={`font-display text-3xl font-semibold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Users from DB (real-time) ────────────────────────────────── */}
            <section className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-border">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">ผู้ใช้งานในระบบ</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ดึงข้อมูลจริงจากฐานข้อมูล · อัปเดตล่าสุด {lastRefresh.toLocaleTimeString('th-TH')}
                  </p>
                </div>
                <button
                  onClick={fetchUsers}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-full transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  รีเฟรช
                </button>
              </div>

              {/* Table Body */}
              {loadingUsers ? (
                <div className="p-12 text-center text-muted-foreground">
                  <svg className="animate-spin h-7 w-7 text-primary mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm font-medium">กำลังดึงข้อมูลจากฐานข้อมูล...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-14 text-center">
                  <div className="w-14 h-14 bg-accent/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">ยังไม่มีผู้ใช้งาน</h3>
                  <p className="text-sm text-muted-foreground mb-5">เชิญผู้ใช้คนแรกสมัครผ่านหน้า Signup</p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:bg-primary/10 px-5 py-2.5 rounded-full border border-primary/20 transition-colors"
                  >
                    ไปหน้าสมัครสมาชิก →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-accent/20 border-b border-border">
                      <tr>
                        {['#', 'ชื่อ-นามสกุล', 'อีเมล', 'บทบาท', 'สถานะ', 'สมัครเมื่อ'].map((h) => (
                          <th key={h} className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-accent/10 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                            #{String(u.id).padStart(5, '0')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                {u.full_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-foreground whitespace-nowrap">{u.full_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleBadge[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                              {roleLabel[u.role] ?? u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1.5 text-xs font-semibold ${u.is_active ? 'text-green-600' : 'text-rose-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-rose-400'}`} />
                              {u.is_active ? 'ใช้งานอยู่' : 'ระงับการใช้งาน'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap text-xs">
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
                <div className="px-7 py-4 bg-accent/10 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">
                    แสดงทั้งหมด <span className="font-bold text-foreground">{users.length}</span> รายการ
                  </p>
                  <Link
                    href="/signup"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + เชิญผู้ใช้ใหม่
                  </Link>
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
