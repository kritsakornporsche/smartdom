'use client';

import { useSession } from 'next-auth/react';
import KeeperSidebar from '../components/KeeperSidebar';
import { useState } from 'react';

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  if (status === 'loading') return null;

  // Generate 7 days mock
  const days = Array.from({length: 7}).map((_, i) => {
      const d = new Date(currentWeek);
      d.setDate(d.getDate() - d.getDay() + i + 1); // Start from Monday
      return d;
  });

  return (
    <div className="flex h-screen bg-[#FDFBF7]">
      <KeeperSidebar />
      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        <header className="h-20 bg-[#FAF8F5] border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[#3E342B]">ตารางงานประจำสัปดาห์</h1>
            <p className="text-xs text-[#A08D74] font-medium mt-0.5">วางแผนการทำงานและการนัดหมาย</p>
          </div>
        </header>

        <div className="p-8 lg:p-10 max-w-6xl mx-auto w-full space-y-8">
            <div className="bg-white rounded-[3rem] border border-[#E5DFD3] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold text-[#3E342B]">
                        สัปดาห์นี้
                    </h2>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-[#E5DFD3] rounded-xl text-xs font-bold text-[#A08D74] hover:bg-[#FAF8F5]">ก่อนหน้า</button>
                        <button className="px-4 py-2 border border-[#E5DFD3] rounded-xl text-xs font-bold text-[#A08D74] hover:bg-[#FAF8F5]">ถัดไป</button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-4">
                    {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((dayName, index) => (
                        <div key={dayName} className="flex flex-col gap-4">
                            <div className="text-center rounded-2xl py-3 flex flex-col items-center border border-[#E5DFD3] bg-[#FAF8F5]">
                                <span className="text-sm font-black uppercase text-[#A08D74]">{dayName}</span>
                                <span className="text-2xl font-display font-black text-[#3E342B]">{days[index].getDate()}</span>
                            </div>
                            <div className="h-48 rounded-2xl bg-[#F3EFE9]/50 border border-[#E5DFD3]/50 p-2 flex flex-col gap-2 overflow-y-auto">
                                {/* Mock Event for some days */}
                                {index === 0 && (
                                    <div className="bg-white border border-[#E5DFD3] rounded-xl p-2 shadow-sm relative group cursor-pointer hover:border-[#8B7355]">
                                        <div className="w-1 absolute left-0 top-2 bottom-2 bg-rose-500 rounded-r-md"></div>
                                        <p className="text-xs font-bold text-[#A08D74] ml-2">09:00 - ซ่อมด่วน</p>
                                        <p className="text-xs font-bold text-[#3E342B] leading-tight ml-2 mt-0.5">ห้อง 302</p>
                                    </div>
                                )}
                                {index === 2 && (
                                    <div className="bg-white border border-[#E5DFD3] rounded-xl p-2 shadow-sm relative group cursor-pointer hover:border-[#8B7355]">
                                        <div className="w-1 absolute left-0 top-2 bottom-2 bg-emerald-500 rounded-r-md"></div>
                                        <p className="text-xs font-bold text-[#A08D74] ml-2">14:00 - ล้างแอร์</p>
                                        <p className="text-xs font-bold text-[#3E342B] leading-tight ml-2 mt-0.5">ส่วนกลาง</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
