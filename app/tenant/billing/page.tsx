'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Bill {
  id: number;
  title: string;
  amount: string;
  billing_cycle: string;
  due_date: string;
  status: string;
}

export default function TenantBillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      fetchBills();
    }
  }, [status]);

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/tenant/billing/list');
      const json = await res.json();
      if (json.success) setBills(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return null;

  const unpaidCount = bills.filter(b => b.status === 'Unpaid').length;

  return (
    <div className="p-10 md:p-16">
      <div className="max-w-5xl mx-auto pb-16 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#3E342B]">ธุรกรรมและการชำระเงิน</h1>
            <p className="text-[#8B7355] font-medium text-lg">จัดการค่าเช่า ค่าน้ำ-ไฟ และประวัติการเงินของคุณ</p>
          </div>
          {unpaidCount > 0 && (
            <div className="bg-rose-50 border border-rose-100 px-6 py-3 rounded-2xl flex items-center gap-3 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span className="text-xs font-black text-rose-700 uppercase tracking-widest">
                    มียอดค้างชำระ {unpaidCount} รายการ
                </span>
            </div>
          )}
        </header>

        <div className="grid gap-8">
          {loading ? (
             <div className="p-20 text-center animate-pulse text-[#A08D74]">กำลังดึงข้อมูลบิลล่าสุด...</div>
          ) : bills.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#E5DFD3] rounded-[3rem] p-24 text-center">
              <div className="w-20 h-20 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-10 h-10 text-[#DCD3C6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-black text-[#3E342B] mb-2">ยังไม่มีข้อมูลยอดเรียกเก็บ</h3>
              <p className="text-[#A08D74] font-medium">เมื่อหอพักออกบิลใหม่ คุณจะเห็นรายละเอียดได้ที่นี่</p>
            </div>
          ) : bills.map((bill) => (
            <div key={bill.id} className="bg-white rounded-[3rem] border border-[#E5DFD3] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col xl:flex-row group">
               <div className="p-10 md:p-12 flex-1">
                 <div className="flex justify-between items-start mb-10">
                   <div>
                     <span className="text-[10px] font-black text-[#A08D74] uppercase tracking-[0.25em] mb-3 block">{bill.billing_cycle}</span>
                     <h3 className="text-2xl font-black text-[#3E342B] group-hover:text-primary transition-colors">{bill.title}</h3>
                   </div>
                   <span className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border-2 ${
                      bill.status === 'Unpaid' ? 'bg-[#FAF3E8] text-[#D4A373] border-[#E9C46A]' :
                      bill.status === 'Pending' ? 'bg-[#E3F2FD] text-[#2196F3] border-[#BBDEFB]' :
                      'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]'
                    }`}>
                      {bill.status === 'Unpaid' ? 'รอชำระเงิน' : bill.status === 'Pending' ? 'กำลังตรวจสอบ' : 'ชำระเรียบร้อย'}
                   </span>
                 </div>
                 
                 <div className="border-t border-[#F3EFE9] pt-10 mt-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-[#FAF8F5] p-8 rounded-[2rem] border border-[#E5DFD3]/50">
                     <p className="text-[10px] text-[#A08D74] font-black uppercase tracking-[0.2em] mb-3">Amount Due</p>
                     <p className="text-4xl font-black text-[#3E342B]">฿{Number(bill.amount).toLocaleString()}</p>
                   </div>
                   <div className="bg-[#FAF8F5] p-8 rounded-[2rem] border border-[#E5DFD3]/50">
                     <p className="text-[10px] text-[#A08D74] font-black uppercase tracking-[0.2em] mb-3">Payment Deadline</p>
                     <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                        <p className="text-xl font-black text-[#8B7355]">{new Date(bill.due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Action Area */}
               <div className="bg-[#FAF8F5] border-t xl:border-t-0 xl:border-l border-[#E5DFD3] p-10 md:p-12 flex flex-col justify-center gap-4 xl:w-80">
                  {bill.status === 'Unpaid' ? (
                    <>
                      <button className="w-full bg-[#3E342B] hover:bg-black text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-[#3E342B]/20 active:scale-[0.98]">
                        ชำระผ่านทาง QR Code
                      </button>
                      <button className="w-full bg-white hover:bg-[#F3EFE9] text-[#3E342B] border-2 border-[#E5DFD3] font-black py-4 px-6 rounded-2xl transition-all active:scale-[0.98] text-sm">
                        แจ้งโอนเงิน / เลือกไฟล์
                      </button>
                    </>
                  ) : (
                    <button disabled className={`w-full font-black py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 ${
                        bill.status === 'Pending' ? 'bg-blue-50 text-blue-600 border border-blue-100 cursor-wait' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                        {bill.status === 'Pending' ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                <span>กำลังตรวจสลิป...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span>ดาวน์โหลดใบเสร็จ</span>
                            </>
                        )}
                    </button>
                  )}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
