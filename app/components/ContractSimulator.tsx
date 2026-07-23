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
        readOnly={true}
      />
    );
  }

  return (
    <div className="bg-card text-foreground rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 lg:p-10 border border-border shadow-2xl space-y-8 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-border pb-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight italic text-foreground">ระบบจำลองสัญญา</h2>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Smart Contract Simulator</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Controls (Left Side) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground">ค่าเช่ารายเดือน (฿)</label>
            <div className="relative group">
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-6 py-4 rounded-2xl bg-secondary/40 border border-border focus:border-primary focus:bg-background outline-none font-bold text-lg text-foreground transition-all shadow-sm"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-widest text-muted-foreground">THB</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground">เงินประกัน (เดือน)</label>
              <select 
                value={depositMonths}
                onChange={(e) => setDepositMonths(Number(e.target.value))}
                className="w-full px-6 py-4 rounded-2xl bg-secondary/40 border border-border focus:border-primary focus:bg-background outline-none font-bold text-sm text-foreground transition-all cursor-pointer shadow-sm"
              >
                {[1, 2, 3].map(m => (
                  <option key={m} value={m} className="bg-card text-foreground">{m} เดือน</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground">จ่ายล่วงหน้า (เดือน)</label>
              <select 
                value={advanceMonths}
                onChange={(e) => setAdvanceMonths(Number(e.target.value))}
                className="w-full px-6 py-4 rounded-2xl bg-secondary/40 border border-border focus:border-primary focus:bg-background outline-none font-bold text-sm text-foreground transition-all cursor-pointer shadow-sm"
              >
                {[1, 2].map(m => (
                  <option key={m} value={m} className="bg-card text-foreground">{m} เดือน</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">ระยะเวลาสัญญา</label>
              <span className="text-sm font-black text-primary px-3 py-1 bg-primary/10 rounded-full">{contractMonths} เดือน</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="24" 
              value={contractMonths}
              onChange={(e) => setContractMonths(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary transition-all"
            />
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>1 เดือน</span>
              <span>24 เดือน</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground">วันที่เริ่มเข้าพัก</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-secondary/40 border border-border focus:border-primary focus:bg-background outline-none font-bold text-sm text-foreground transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Results Card (Right Side) - ALWAYS WHITE BACKGROUND WITH BLACK TEXT IN ALL THEMES */}
        <div className="lg:col-span-5 bg-white text-slate-900 rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-slate-200 relative overflow-hidden">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">ยอดที่ต้องชำระวันทำสัญญา</p>
              <h3 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900 break-words">฿{totalUpfront.toLocaleString()}</h3>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-200 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">ค่าเช่าเฉลี่ยตามจริง</span>
                <span className="font-bold text-slate-900">฿{proRatedRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">เงินประกัน ({depositMonths} ด.)</span>
                <span className="font-bold text-slate-900">฿{depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">สิ้นสุดสัญญา</span>
                <span className="font-bold text-slate-900">{new Date(endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-5">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <p className="text-xs font-medium leading-relaxed text-slate-600">
                * ข้อมูลนี้เป็นการคำนวณเบื้องต้น รายละเอียดสุดท้ายจะถูกระบุในสัญญาอิเล็กทรอนิกส์หลังจากท่านยืนยันข้อมูล
              </p>
            </div>

            <button 
              onClick={() => setShowSigner(true)}
              disabled={isSubmitting}
              className={cn(
                "w-full py-4 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-wider",
                "hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20",
                "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              )}
            >
              อ่านข้อตกลง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
