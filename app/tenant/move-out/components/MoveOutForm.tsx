'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MoveOutForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const date = formData.get('date');
    const reason = formData.get('reason');

    if (!date) return alert('กรุณาระบุวันที่ต้องการย้ายออก');
    
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/move-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desiredDate: date, reason }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการส่งคำร้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E5DFD3] p-8 md:p-12 shadow-sm">
      <div className="mb-10">
         <div className="bg-[#FFF9F9] border border-rose-100 rounded-2xl p-6 text-sm text-rose-800 flex gap-4">
           <div className="shrink-0 bg-rose-100 h-10 w-10 rounded-full flex items-center justify-center text-rose-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           </div>
           <div>
             <strong className="block text-base mb-1 font-bold">เงื่อนไขการคืนเงินประกัน</strong>
             ทางหอพักกำหนดให้มีการแจ้งย้ายออกล่วงหน้าอย่างน้อย <span className="font-bold underline decoration-rose-200 decoration-2">30 วัน</span> ก่อนถึงกำหนดสัญญา มิเช่นนั้นอาจมีการหักเงินประกันตามที่ระบุไว้ในสัญญาเช่า
           </div>
         </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm font-bold text-[#A08D74] uppercase tracking-wider mb-2 font-mono ml-1">วันที่ต้องการย้ายออก</label>
          <input 
            type="date" 
            name="date"
            required
            className="w-full px-5 py-4 bg-[#FAF8F5] rounded-2xl border border-[#DCD3C6] focus:bg-white focus:ring-4 focus:ring-[#8B6A2B]/10 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-bold"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#A08D74] uppercase tracking-wider mb-2 font-mono ml-1">เบอร์โทรศัพท์ติดต่อกลับ</label>
          <input 
            type="tel" 
            name="phone"
            className="w-full px-5 py-4 bg-[#FAF8F5] rounded-2xl border border-[#DCD3C6] focus:bg-white focus:ring-4 focus:ring-[#8B6A2B]/10 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-bold"
            placeholder="08X-XXX-XXXX"
          />
        </div>
      </div>

      <div className="mb-10">
        <label className="block text-sm font-bold text-[#A08D74] uppercase tracking-wider mb-2 font-mono ml-1">เหตุผลที่ต้องการย้ายออก</label>
        <textarea 
          name="reason"
          rows={4}
          className="w-full px-5 py-4 bg-[#FAF8F5] rounded-2xl border border-[#DCD3C6] focus:bg-white focus:ring-4 focus:ring-[#8B6A2B]/10 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-medium resize-none leading-normal"
          placeholder="ระบุเหตุผลเบื้องต้นเพื่อให้เรานำไปพัฒนาบริการ..."
        ></textarea>
      </div>

      <div className="flex gap-4 border-t border-[#E5DFD3] pt-10">
        <button disabled={loading} type="submit" className="flex-1 bg-[#8B6A2B] hover:bg-[#725724] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-[#8B6A2B]/20 active:scale-[0.98] text-lg disabled:opacity-70 flex items-center justify-center gap-2">
           {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันการส่งเรื่องแจ้งย้ายออก'}
        </button>
      </div>
    </form>
  );
}
