'use client';

import { useState } from 'react';
import ContractSigner from './ContractSigner';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface SimulatorProps {
  initialPrice?: number;
  roomNumber?: string;
  onClose?: () => void;
}

export default function ContractSimulator({ initialPrice = 5000, roomNumber = 'A101', onClose }: SimulatorProps) {
  const { data: session } = useSession();
  const [price, setPrice] = useState(initialPrice);
  const [depositMonths, setDepositMonths] = useState(2);
  const [advanceMonths, setAdvanceMonths] = useState(1);
  const [contractMonths, setContractMonths] = useState(12);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSigner, setShowSigner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pro-rated first month calculation
  const getProRatedRent = () => {
    const date = new Date(startDate);
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - date.getDate() + 1;
    return Math.round((price / daysInMonth) * remainingDays);
  };

  const proRatedRent = getProRatedRent();
  const depositAmount = price * depositMonths;
  const totalUpfront = depositAmount + proRatedRent;

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + contractMonths);

  const handleSign = async (signatureBase64: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contract/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber,
          monthlyRent: price,
          depositAmount,
          startDate,
          endDate: endDate.toISOString().split('T')[0],
          signatureData: signatureBase64,
        }),
      });

      if (response.ok) {
        toast.success('ยืนยันและลงนามสัญญาเรียบร้อยแล้ว!');
        if (onClose) onClose();
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกสัญญา');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกสัญญา');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSigner) {
    return (
      <ContractSigner
        tenantName={session?.user?.name || "ไม่ระบุชื่อ"}
        roomNumber={roomNumber}
        monthlyRent={price}
        depositAmount={depositAmount}
        startDate={startDate}
        endDate={endDate.toISOString().split('T')[0]}
        onSign={handleSign}
        onCancel={() => setShowSigner(false)}
      />
    );
  }

  return (
    <div className="bg-background rounded-[3rem] p-8 lg:p-14 border border-border/40 shadow-2xl space-y-12 animate-reveal">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight italic">ระบบจำลองสัญญา</h2>
          <p className="text-sm font-black uppercase tracking-wider text-primary">Smart Contract Simulator</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-3 bg-secondary/10 hover:bg-secondary/20 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-10">
          <div className="space-y-5">
            <label className="block text-sm font-black uppercase tracking-wide text-primary/60">ค่าเช่ารายเดือน (฿)</label>
            <div className="relative group">
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-8 py-5 rounded-2xl bg-secondary/10 border border-transparent focus:border-primary/30 focus:bg-white outline-none font-black text-xl transition-all duration-500 shadow-sm group-hover:shadow-md"
              />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black uppercase tracking-wider text-muted-foreground">Baht</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-5">
              <label className="block text-sm font-black uppercase tracking-wide text-primary/60">เงินประกัน (เดือน)</label>
              <select 
                value={depositMonths}
                onChange={(e) => setDepositMonths(Number(e.target.value))}
                className="w-full px-8 py-5 rounded-2xl bg-secondary/10 border border-transparent focus:border-primary/30 focus:bg-white outline-none font-black transition-all duration-500 cursor-pointer appearance-none shadow-sm"
              >
                {[1, 2, 3].map(m => (
                  <option key={m} value={m}>{m} เดือน</option>
                ))}
              </select>
            </div>
            <div className="space-y-5">
              <label className="block text-sm font-black uppercase tracking-wide text-primary/60">จ่ายล่วงหน้า (เดือน)</label>
              <select 
                value={advanceMonths}
                onChange={(e) => setAdvanceMonths(Number(e.target.value))}
                className="w-full px-8 py-5 rounded-2xl bg-secondary/10 border border-transparent focus:border-primary/30 focus:bg-white outline-none font-black transition-all duration-500 cursor-pointer appearance-none shadow-sm"
              >
                {[1, 2].map(m => (
                  <option key={m} value={m}>{m} เดือน</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <label className="text-sm font-black uppercase tracking-wide text-primary/60">ระยะเวลาสัญญา</label>
              <span className="text-sm font-black text-primary">{contractMonths} เดือน</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="24" 
              value={contractMonths}
              onChange={(e) => setContractMonths(Number(e.target.value))}
              className="w-full h-1.5 bg-secondary/20 rounded-full appearance-none cursor-pointer accent-primary transition-all"
            />
            <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-muted-foreground/40">
              <span>1 Month</span>
              <span>24 Months</span>
            </div>
          </div>

          <div className="space-y-5">
            <label className="block text-sm font-black uppercase tracking-wide text-primary/60">วันที่เริ่มเข้าพัก</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-8 py-5 rounded-2xl bg-secondary/10 border border-transparent focus:border-primary/30 focus:bg-white outline-none font-black transition-all duration-500 shadow-sm"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 bg-foreground text-background rounded-[3.5rem] p-10 lg:p-14 flex flex-col justify-between shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group border border-white/5">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] group-hover:bg-primary/20 transition-all duration-700" />
          
          <div className="relative z-10 space-y-14">
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-background/40 mb-4">ยอดที่ต้องชำระวันทำสัญญา</p>
              <h3 className="text-2xl font-display font-black tracking-tighter">฿{totalUpfront.toLocaleString()}</h3>
            </div>

            <div className="space-y-8 pt-12 border-t border-background/10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-normal text-background/40">ค่าเช่าเฉลี่ยตามจริง</span>
                <span className="text-sm font-black">฿{proRatedRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-normal text-background/40">เงินประกัน ({depositMonths} ด.)</span>
                <span className="text-sm font-black">฿{depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-normal text-background/40">สิ้นสุดสัญญา</span>
                <span className="text-sm font-black">{new Date(endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-16 space-y-8">
            <div className="bg-background/5 rounded-2xl p-5 border border-background/10 backdrop-blur-sm">
              <p className="text-xs font-bold leading-normal italic text-background/40 text-pretty">
                * ข้อมูลนี้เป็นการคำนวณเบื้องต้น รายละเอียดสุดท้ายจะถูกระบุในสัญญาอิเล็กทรอนิกส์หลังจากท่านยืนยันข้อมูล
              </p>
            </div>

            <button 
              onClick={() => setShowSigner(true)}
              disabled={isSubmitting}
              className={cn(
                "w-full py-6 bg-primary text-primary-foreground rounded-full text-sm font-black uppercase tracking-wider",
                "hover:bg-white hover:text-foreground hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-2xl shadow-primary/20",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              ทำสัญญาเช่าออนไลน์
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
