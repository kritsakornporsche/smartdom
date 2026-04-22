'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContractSimulatePage() {
  const [months, setMonths] = useState(12);
  const [roomRate, setRoomRate] = useState(5000);
  const [depositMonths, setDepositMonths] = useState(2);
  const [advanceMonths, setAdvanceMonths] = useState(1);

  const depositTotal = roomRate * depositMonths;
  const advanceTotal = roomRate * advanceMonths;
  const totalRequired = depositTotal + advanceTotal;

  return (
    <div className="p-8 lg:p-10 max-w-4xl mx-auto hidden-scrollbar">
      <div className="space-y-10 pb-16">
        
        <header>
          <Link href="/tenant" className="inline-flex items-center gap-2 text-sm font-bold text-[#A08D74] hover:text-[#8B7355] mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            กลับสู่หน้าหลัก
          </Link>
          <h1 className="text-3xl font-black text-[#3E342B] tracking-tight mb-2">จำลองสัญญาเช่า (Simulator)</h1>
          <p className="text-[#8B7355] font-medium text-lg">คำนวณค่าใช้จ่ายล่วงหน้า สำหรับการต่อสัญญาหรือเปลี่ยนห้องพัก</p>
        </header>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Controls */}
          <div className="md:col-span-3 space-y-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-[#E5DFD3] shadow-sm">
            <div>
              <label className="block text-sm font-bold text-[#A08D74] uppercase tracking-wider mb-4">ค่าเช่าห้องต่อเดือน (บาท)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="2000" max="15000" step="500" 
                  value={roomRate}
                  onChange={(e) => setRoomRate(Number(e.target.value))}
                  className="w-full accent-[#8B6A2B]"
                />
                <span className="font-black text-xl text-[#3E342B] w-24 text-right">฿{roomRate.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#A08D74] uppercase tracking-wider mb-3">เงินประกัน (เดือน)</label>
                <div className="flex rounded-xl overflow-hidden border border-[#DCD3C6]">
                   {[1, 2, 3].map(m => (
                     <button
                        key={`dep-${m}`}
                        onClick={() => setDepositMonths(m)}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${depositMonths === m ? 'bg-[#8B6A2B] text-white' : 'bg-[#FAF8F5] text-[#8B7355] hover:bg-[#F2EFE9]'}`}
                     >
                        {m}
                     </button>
                   ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#A08D74] uppercase tracking-wider mb-3">ล่วงหน้า (เดือน)</label>
                <div className="flex rounded-xl overflow-hidden border border-[#DCD3C6]">
                   {[1, 2].map(m => (
                     <button
                        key={`adv-${m}`}
                        onClick={() => setAdvanceMonths(m)}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${advanceMonths === m ? 'bg-[#8B6A2B] text-white' : 'bg-[#FAF8F5] text-[#8B7355] hover:bg-[#F2EFE9]'}`}
                     >
                        {m}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#A08D74] uppercase tracking-wider mb-4">ระยะเวลาสัญญา (เดือน)</label>
              <input 
                type="range" 
                min="1" max="24" step="1" 
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full accent-[#8B6A2B]"
              />
              <div className="flex justify-between text-xs font-bold text-[#A08D74] mt-2">
                <span>1 เดือน</span>
                <span className="text-[#8B6A2B] text-base">{months} เดือน</span>
                <span>24 เดือน</span>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#3E342B] rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-[#3E342B]/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-2xl"></div>
              
              <h3 className="text-sm font-bold text-white/60 tracking-wider uppercase mb-8">สรุปค่าใช้จ่ายวันทำสัญญา</h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs text-white/60 mb-1">เงินประกัน ({depositMonths} เดือน)</p>
                    <p className="text-lg font-bold">฿{depositTotal.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs text-white/60 mb-1">ค่าเช่าล่วงหน้า ({advanceMonths} เดือน)</p>
                    <p className="text-lg font-bold">฿{advanceTotal.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <p className="text-xs text-[#A08D74] font-bold uppercase tracking-wider mb-2">ยอดรวมที่ต้องชำระ (Total)</p>
                  <p className="text-2xl md:text-3xl font-black text-[#8B6A2B]">฿{totalRequired.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFF9F9] border border-rose-100 rounded-3xl p-6 flex gap-4">
                <svg className="w-6 h-6 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm text-rose-800 font-medium leading-normal">
                  <strong>หมายเหตุ:</strong> ข้อมูลนี้เป็นเพียงการจำลองเพื่อการวางแผนเบื้องต้นเท่านั้น โปรดติดต่อผู้ดูแลหอพักเพื่อตรวจสอบห้องว่างและราคาจริงก่อนทำสัญญา
                </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
