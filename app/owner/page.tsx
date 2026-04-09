'use client';

import { useState, useEffect } from 'react';
import OwnerSidebar from './components/OwnerSidebar';

interface Stats {
  totalRooms: number;
  occupiedRooms: number;
  totalTenants: number;
  pendingMaintenance: number;
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRooms: 10,
    occupiedRooms: 3,
    totalTenants: 3,
    pendingMaintenance: 1,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-slate-900 font-sans">
      <OwnerSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-[#2D3436]">Dashboard</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">การดำเนินงานสรุปรายวัน</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600">สถานะระบบ: ปกติ</span>
            </div>
            <div className="h-10 w-10 rounded-2xl overflow-hidden border-2 border-white shadow-lg shadow-slate-200">
               <img src="https://ui-avatars.com/api/?name=Owner&background=0984E3&color=fff" alt="Owner" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-gradient-to-br from-[#F0F2F5] to-white">
          <div className="max-w-6xl mx-auto space-y-10">
            
            {/* Welcome Section */}
            <div className="bg-white rounded-[32px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0984E3]/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-slate-800 mb-2">สวัสดีครับ, คุณเจ้าของหอ! 👋</h2>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                    ยินดีต้อนรับสู่ระบบจัดการ SmartDom วันนี้หอพักของคุณมีการจองใหม่ 0 รายการ และมีการแจ้งซ่อม 1 รายการ
                  </p>
                  <div className="mt-8 flex gap-3">
                    <button className="px-6 py-3 bg-[#0984E3] text-white rounded-2xl font-bold shadow-lg shadow-[#0984E3]/30 hover:scale-105 transition-all">
                       เพิ่มผู้เช่าใหม่
                    </button>
                    <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                       ออกใบแจ้งหนี้
                    </button>
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="w-48 h-48 bg-slate-50 rounded-[40px] flex items-center justify-center p-8 shadow-inner border border-slate-100">
                     <svg className="w-full h-full text-[#0984E3]/20" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                     </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'ห้องเช่าทั้งหมด', value: stats.totalRooms, icon: '🏢', color: 'bg-indigo-500' },
                { label: 'ห้องที่มีผู้เช่า', value: stats.occupiedRooms, icon: '🔑', color: 'bg-emerald-500' },
                { label: 'จำนวนผู้เช่า', value: stats.totalTenants, icon: '👥', color: 'bg-amber-500' },
                { label: 'รอดำเนินการซ่อม', value: stats.pendingMaintenance, icon: '🛠️', color: 'bg-rose-500' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-[28px] shadow-lg shadow-slate-200/40 border border-slate-100 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
                  <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-black/10`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 border uppercase tracking-widest mb-1 border-none">{item.label}</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions / Dorm Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Dorm Profile Card */}
              <div className="lg:col-span-2 bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/30">
                <div className="bg-[#2D3436] p-8 text-white flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-bold">ข้อมูลหอพัก</h3>
                     <p className="text-white/50 text-xs">แก้ไขข้อมูลหอพักของคุณได้ที่นี่</p>
                   </div>
                   <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">
                     แก้ไขข้อมูล
                   </button>
                </div>
                <div className="p-8 space-y-6 text-sm">
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                         <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ชื่อกิจการ</label>
                         <div className="font-bold text-slate-700">SmartDom Mansion</div>
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">เบอร์โทรศัพท์</label>
                         <div className="font-bold text-slate-700">088-999-8888</div>
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ที่ตั้งหอพัก</label>
                      <div className="font-bold text-slate-700 leading-relaxed">
                        888 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310
                      </div>
                   </div>
                </div>
              </div>

              {/* Maintenance Summary */}
              <div className="bg-[#0984E3] rounded-[32px] p-8 text-white shadow-xl shadow-[#0984E3]/30 flex flex-col items-center text-center justify-center">
                 <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-4">🔧</div>
                 <h3 className="text-lg font-bold mb-2">แจ้งซ่อมรอนอนุมัติ</h3>
                 <p className="text-white/70 text-sm mb-6">มีรายการแจ้งซ่อมใหม่จากผู้เช่า ห้อง 102 (แอร์เสีย)</p>
                 <button className="w-full py-3 bg-white text-[#0984E3] rounded-2xl font-bold shadow-lg hover:scale-105 transition-all">
                    ดูรายการแจ้งซ่อม
                 </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
