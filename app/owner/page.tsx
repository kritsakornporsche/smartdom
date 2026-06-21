'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Stats {
  totalRooms: number;
  occupiedRooms: number;
  totalTenants: number;
  pendingMaintenance: number;
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    occupiedRooms: 0,
    totalTenants: 0,
    pendingMaintenance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [dormInfo, setDormInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      const email = localStorage.getItem('userEmail') || 'owner@smartdom.com';
      const savedDb = localStorage.getItem('selectedDormDbName');
      try {
        const res = await fetch(`/api/owner/onboarding?email=${email}${savedDb ? `&dormDbName=${savedDb}` : ''}`);
        const data = await res.json();
        
        if (data.success && !data.hasDorm) {
          router.push('/owner/onboarding');
        } else if (data.success) {
          setDormInfo(data.dorm);
          
          // Fetch Real Stats using dormDbName
          const dormDbName = data.dormDbName;
          if (dormDbName) {
            const statsRes = await fetch(`/api/owner/stats?dormDbName=${dormDbName}`);
            const statsData = await statsRes.json();
            if (statsData.success) {
              setStats(statsData.data);
            }
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [router]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#080F1E]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#080F1E]">
      {/* Top Navbar */}
      <header className="h-20 bg-[#0F172A]/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tight text-white">Dashboard</h1>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">การดำเนินงานสรุปรายวัน</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-white/80">สถานะระบบ: ปกติ</span>
          </div>
          <div className="h-10 w-10 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
             <Image width={40} height={40} src="https://ui-avatars.com/api/?name=Owner&background=6366F1&color=fff" alt="Owner" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Welcome Section */}
          <div className="bg-[#0F172A] rounded-[32px] p-10 shadow-xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-3xl font-black text-white mb-2">สวัสดีครับ, คุณเจ้าของหอ! 👋</h2>
                <p className="text-white/50 font-medium leading-relaxed max-w-md">
                  ยินดีต้อนรับสู่ระบบจัดการ SmartDom วันนี้หอพักของคุณมีการจองใหม่ 0 รายการ และมีการแจ้งซ่อม 1 รายการ
                </p>
                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => router.push('/owner/tenants')}
                    className="px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                     เพิ่มผู้เช่าใหม่
                  </button>
                  <button 
                    onClick={() => router.push('/owner/billing')}
                    className="px-6 py-3 bg-[#0F172A] border border-white/10 text-white/80 rounded-2xl font-bold hover:bg-white/5 transition-all active:scale-95"
                  >
                     ออกใบแจ้งหนี้
                  </button>
                  <button 
                    onClick={() => router.push('/tenant/contract/simulate')}
                    className="px-6 py-3 bg-white/5 text-white/60 rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95"
                  >
                     จำลองสัญญา
                  </button>
                </div>
              </div>

              <div className="shrink-0">
                <div className="w-48 h-48 bg-slate-800/40 rounded-[40px] flex items-center justify-center p-8 shadow-inner border border-white/10">
                   <svg className="w-full h-full text-primary/30" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                   </svg>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'ห้องเช่าทั้งหมด', value: stats.totalRooms, icon: '🏢', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', href: '/owner/rooms' },
              { label: 'ห้องที่มีผู้เช่า', value: stats.occupiedRooms, icon: '🔑', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', href: '/owner/rooms' },
              { label: 'จำนวนผู้เช่า', value: stats.totalTenants, icon: '👥', color: 'bg-violet-500/10 text-violet-400 border border-violet-500/20', href: '/owner/tenants' },
              { label: 'รอดำเนินการซ่อม', value: stats.pendingMaintenance, icon: '🛠️', color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', href: '/owner/maintenance' },
            ].map((item, i) => (
              <div 
                key={i} 
                onClick={() => item.href && router.push(item.href)}
                className="bg-[#0F172A] p-6 rounded-[28px] shadow-lg border border-white/10 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 cursor-pointer hover:border-primary"
              >
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-md`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-2xl font-black text-white/80 tracking-tight">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions / Dorm Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dorm Profile Card */}
            <div className="lg:col-span-2 bg-[#0F172A] rounded-[32px] overflow-hidden border border-white/10 shadow-xl">
              <div className="bg-gradient-to-r from-primary to-indigo-600 p-8 text-white flex items-center justify-between">
                 <div>
                   <h3 className="text-lg font-bold">ข้อมูลหอพัก</h3>
                   <p className="text-white/70 text-xs">แก้ไขข้อมูลหอพักของคุณได้ที่นี่</p>
                 </div>
                 <button 
                   onClick={() => router.push('/owner/settings')}
                   className="px-4 py-2 bg-[#0F172A]/20 hover:bg-[#0F172A]/40 rounded-xl text-xs font-bold transition-all border border-white/15 active:scale-95"
                 >
                   แก้ไขข้อมูล
                 </button>
              </div>
              <div className="p-8 space-y-6 text-sm">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                       <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">ชื่อกิจการ</label>
                       <div className="font-bold text-white">{dormInfo?.name || 'SmartDom Mansion'}</div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">เบอร์โทรศัพท์</label>
                       <div className="font-bold text-white">{dormInfo?.phone || '088-999-8888'}</div>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">ที่ตั้งหอพัก</label>
                    <div className="font-bold text-white leading-relaxed">
                      {dormInfo?.address || '888 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310'}
                    </div>
                 </div>
              </div>
            </div>

            {/* Maintenance Summary */}
            <div className="bg-[#0F172A] border border-white/10 rounded-[32px] p-8 text-white shadow-xl flex flex-col items-center text-center justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
               <div className="w-16 h-16 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center text-3xl mb-4">🔧</div>
               <h3 className="text-lg font-bold mb-2 text-white">แจ้งซ่อมรอนุมัติ</h3>
               <p className="text-white/50 text-sm mb-6 max-w-xs">มีรายการแจ้งซ่อมใหม่จากผู้เช่า ห้อง 102 (แอร์เสีย)</p>
               <button 
                 onClick={() => router.push('/owner/maintenance')}
                 className="w-full py-3.5 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/10 hover:scale-105 active:scale-95 transition-all"
               >
                  ดูรายการแจ้งซ่อม
               </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
