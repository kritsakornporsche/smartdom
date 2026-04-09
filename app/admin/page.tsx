'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">SmartDom</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">เมนูการจัดการ</div>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            ภาพรวมระบบ (Dashboard)
          </Link>
          <Link href="/admin/tenants" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            ผู้เช่า (Tenants)
          </Link>
          <Link href="/admin/rooms" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            ห้องพัก (Rooms)
          </Link>
          <Link href="/admin/billing" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ข้อมูลการเงิน (Billing)
          </Link>
          <Link href="/admin/database" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4z" />
            </svg>
            ฐานข้อมูลตาราง (Database)
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold">ภาพรวมระบบ (Admin Dashboard)</h1>
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-10 w-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden mix-blend-multiply">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="แอดมิน" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Database Connection Status Card */}
            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold mb-1">สถานะฐานข้อมูล (Neon PostgreSQL)</h2>
                  <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
                    ตรวจเช็คสถานะการเชื่อมต่อฐานข้อมูลของคุณ หากพบข้อผิดพลาด กรุณาตรวจสอบ URL ในไฟล์ <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-xs">.env.local</code>
                  </p>
                </div>
                
                <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${
                  dbStatus === 'connected' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  dbStatus === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                  'bg-blue-50 border-blue-100 text-blue-700'
                }`}>
                  <div className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      dbStatus === 'connected' ? 'bg-emerald-400' :
                      dbStatus === 'error' ? 'bg-rose-400' :
                      'bg-blue-400'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                      dbStatus === 'connected' ? 'bg-emerald-500' :
                      dbStatus === 'error' ? 'bg-rose-500' :
                      'bg-blue-500'
                    }`}></span>
                  </div>
                  <span className="font-semibold text-sm">
                    {dbStatus === 'connected' && 'เชื่อมต่อสำเร็จ'}
                    {dbStatus === 'checking' && 'กำลังตรวจสอบ...'}
                    {dbStatus === 'error' && 'การเชื่อมต่อผิดพลาด'}
                  </span>
                </div>
              </div>

              {dbStatus === 'error' && (
                <div className="mt-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">Error Details</div>
                  <div className="font-mono text-sm text-rose-700 break-all">{errorDetails}</div>
                </div>
              )}
            </section>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'ห้องพักทั้งหมด', value: '120', trend: '+2', trendUp: true },
                { label: 'ผู้ใช้งานระบบ', value: '84', trend: '+5', trendUp: true },
                { label: 'รายได้เดือนนี้', value: '฿142,000', trend: '+12%', trendUp: true },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-sm font-semibold text-slate-500 mb-2">{stat.label}</h3>
                    <div className="flex items-end gap-3">
                      <span className="text-3xl font-bold text-slate-800">{stat.value}</span>
                      <span className={`flex items-center gap-1 text-sm font-semibold pb-1 ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                  {/* Decorative background shape */}
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors duration-500 mix-blend-multiply"></div>
                </div>
              ))}
            </div>

            {/* Placeholder for Next Steps */}
            <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-slate-800">พร้อมใช้งานระบบจัดการหอพัก!</h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                การเชื่อมต่อฐานข้อมูลและตัวจัดการแอดมินเสร็จสมบูรณ์ คุณสามารถจัดการห้องพักและผู้เช่าได้แล้ว
              </p>
              <Link href="/admin/rooms" className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-sm">
                ไปที่จัดการห้องพัก
              </Link>
            </section>

          </div>
        </div>
      </main>

    </div>
  );
}
