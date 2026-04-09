'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from './components/AdminSidebar';

export default function AdminDashboardPage() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    async function checkDb() {
      try {
        const res = await fetch('/api/db-test');
        const data = await res.json();
        if (data.success) {
          setDbStatus('connected');
        } else {
          setDbStatus('error');
          setErrorDetails(data.error);
        }
      } catch (err: any) {
        setDbStatus('error');
        setErrorDetails(err.message);
      }
    }
    checkDb();
  }, []);

  const stats = [
    {
      label: 'ห้องพักทั้งหมด',
      value: '120',
      trend: '+2',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'ผู้ใช้งานระบบ',
      value: '84',
      trend: '+5',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'รายได้เดือนนี้',
      value: '฿142,000',
      trend: '+12%',
      trendUp: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

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

            {/* Database Connection Status */}
            <section className="bg-white border border-border rounded-3xl p-7 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h2 className="font-display text-base font-semibold text-foreground mb-1.5">
                    สถานะการเชื่อมต่อฐานข้อมูล
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                    ตรวจสอบการเชื่อมต่อ Neon PostgreSQL แบบเรียลไทม์ หากพบข้อผิดพลาด กรุณาตรวจสอบค่าใน{' '}
                    <code className="bg-accent/60 text-foreground/80 px-1.5 py-0.5 rounded-md font-mono text-xs">.env.local</code>
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shrink-0 ${
                    dbStatus === 'connected'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : dbStatus === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-accent/30 border-border text-muted-foreground'
                  }`}
                >
                  <div className="relative flex h-2.5 w-2.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        dbStatus === 'connected' ? 'bg-green-500' : dbStatus === 'error' ? 'bg-rose-500' : 'bg-primary/60'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        dbStatus === 'connected' ? 'bg-green-500' : dbStatus === 'error' ? 'bg-rose-500' : 'bg-primary/60'
                      }`}
                    />
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
                  <div className="font-mono text-sm text-rose-700 break-all leading-relaxed">{errorDetails}</div>
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

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white border border-border rounded-3xl p-7 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform"
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <div className="p-2 bg-accent/40 rounded-xl text-primary">{stat.icon}</div>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="font-display text-3xl font-semibold text-foreground">{stat.value}</span>
                    <span
                      className={`flex items-center gap-0.5 text-xs font-bold pb-1 ${
                        stat.trendUp ? 'text-green-600' : 'text-rose-500'
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
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <section className="bg-white border border-border rounded-3xl p-7 shadow-sm">
              <h2 className="font-display text-base font-semibold text-foreground mb-6">การดำเนินการด่วน</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/admin/rooms"
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <div className="p-3 bg-accent/50 rounded-xl text-primary group-hover:bg-primary/10 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">จัดการห้องพัก</div>
                    <div className="text-xs text-muted-foreground mt-0.5">เพิ่ม แก้ไข หรือลบข้อมูลห้องพัก</div>
                  </div>
                  <svg className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/admin/tenants"
                  className="group flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <div className="p-3 bg-accent/50 rounded-xl text-primary group-hover:bg-primary/10 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">จัดการผู้เช่า</div>
                    <div className="text-xs text-muted-foreground mt-0.5">ดูข้อมูลและจัดการผู้เช่าทั้งหมด</div>
                  </div>
                  <svg className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
