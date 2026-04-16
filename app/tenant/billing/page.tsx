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
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [modalType, setModalType] = useState<'qr' | 'upload' | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBill) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์รูปต้องมีขนาดไม่เกิน 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result;
      setUploading(true);
      try {
        const res = await fetch('/api/tenant/billing/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billId: selectedBill.id, slipData: base64Data }),
        });
        const json = await res.json();
        if (json.success) {
          setModalType(null);
          fetchBills();
        } else {
          alert('เกิดข้อผิดพลาด: ' + json.message);
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการโหลดไฟล์');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (status === 'loading') return null;

  const unpaidCount = bills.filter(b => b.status === 'Unpaid').length;

  return (
    <>
      <div className="p-8 lg:p-10">
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
                        <button 
                          onClick={() => { setSelectedBill(bill); setModalType('qr'); }}
                          className="w-full bg-[#3E342B] hover:bg-black text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-[#3E342B]/20 active:scale-[0.98]"
                        >
                          ชำระผ่านทาง QR Code
                        </button>
                        <button 
                          onClick={() => { setSelectedBill(bill); setModalType('upload'); }}
                          className="w-full bg-white hover:bg-[#F3EFE9] text-[#3E342B] border-2 border-[#E5DFD3] font-black py-4 px-6 rounded-2xl transition-all active:scale-[0.98] text-sm"
                        >
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

      {/* QR Code Modal */}
      {modalType === 'qr' && selectedBill && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 overflow-hidden shadow-2xl relative animate-in zoom-in-95">
             <button onClick={() => setModalType(null)} className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full hover:bg-black/5 text-[#A08D74]">✕</button>
             <h2 className="text-xl font-black text-[#3E342B] mb-6 text-center">สแกนชำระเงิน</h2>
             <div className="bg-[#FAF8F5] p-4 rounded-3xl border border-[#E5DFD3] flex justify-center mb-6">
                {/* using mock PromptPay qr generator */}
                <img src={`https://promptpay.io/0812345678/${selectedBill.amount}.png`} alt="QR Code" className="w-48 h-48 object-contain mix-blend-multiply" />
             </div>
             <div className="text-center space-y-1 mb-8">
               <p className="text-[10px] text-[#A08D74] font-black uppercase tracking-widest">ยอดที่ต้องชำระ (บาท)</p>
               <p className="text-3xl font-black text-primary">฿{Number(selectedBill.amount).toLocaleString()}</p>
             </div>
             <button 
                onClick={() => setModalType('upload')}
                className="w-full bg-[#3E342B] text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-[#3E342B]/20 active:scale-95"
             >
                แนบสลิปการโอน
             </button>
           </div>
         </div>
      )}

      {/* Upload Slip Modal */}
      {modalType === 'upload' && selectedBill && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 overflow-hidden shadow-2xl relative animate-in zoom-in-95">
             <button onClick={() => setModalType(null)} className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full hover:bg-black/5 text-[#A08D74]" disabled={uploading}>✕</button>
             <h2 className="text-xl font-black text-[#3E342B] mb-2">อัพโหลดหลักฐาน</h2>
             <p className="text-sm text-[#8B7355] font-medium mb-8">กรุณาแนบภาพสลิปที่เห็นยอดเงินและเวลาจัดเจน</p>
             
             <div className="border-2 border-dashed border-[#E5DFD3] rounded-[2rem] p-10 flex flex-col items-center justify-center bg-[#FAF8F5] relative group hover:border-[#8B6A2B] transition-colors mb-6 cursor-pointer">
                <input 
                   type="file" 
                   accept="image/*" 
                   onChange={handleFileUpload}
                   disabled={uploading}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                />
                <svg className={`w-12 h-12 mb-4 text-[#DCD3C6] group-hover:text-[#8B6A2B] transition-colors ${uploading ? 'animate-bounce' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <p className="font-bold text-[#3E342B] mb-1">{uploading ? 'กำลังประมวลผล...' : 'คลิกเพื่อเลือกไฟล์รูปภาพ'}</p>
                <p className="text-xs text-[#A08D74] font-medium">รองรับ JPG, PNG ขนาดไม่เกิน 5MB</p>
             </div>
             
             <div className="flex gap-4">
               <button 
                  onClick={() => setModalType(null)} 
                  disabled={uploading}
                  className="flex-1 py-4 border border-[#E5DFD3] text-[#A08D74] rounded-2xl font-bold text-sm hover:bg-[#FAF8F5]"
               >
                 ยกเลิก
               </button>
             </div>
           </div>
         </div>
      )}
    </>
  );
}
