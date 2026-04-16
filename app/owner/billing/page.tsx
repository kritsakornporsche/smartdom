'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import PremiumDatePicker from '@/app/components/PremiumDatePicker';

interface Bill {
  id: number;
  title: string;
  amount: number;
  billing_cycle: string;
  due_date: string;
  status: string;
  tenant_name: string;
  room_number: string;
  created_at: string;
}

interface Tenant {
  id: number;
  name: string;
  room_number: string;
}

export default function OwnerBillingPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [bills, setBills] = useState<Bill[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerDormId, setOwnerDormId] = useState<number | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [formData, setFormData] = useState({
    tenant_id: '',
    title: 'ค่าเช่าห้องพักและสาธารณูปโภค',
    amount: '',
    billing_cycle: '',
    due_date: '',
  });

  const fetchBillData = async (dormId: number) => {
    setLoading(true);
    try {
      const [billsRes, tenantsRes] = await Promise.all([
        fetch(`/api/owner/billing?dormId=${dormId}`),
        fetch(`/api/tenants?dormId=${dormId}`)
      ]);
      
      const billsData = await billsRes.json();
      const tenantsData = await tenantsRes.json();
      
      if (billsData.success) setBills(billsData.data);
      if (tenantsData.success) setTenants(tenantsData.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (authStatus === 'authenticated' && session.user?.email) {
      fetch(`/api/owner/onboarding?email=${session.user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.hasDorm) {
            setOwnerDormId(data.dorm.id);
            fetchBillData(data.dorm.id);
          } else {
            setLoading(false);
          }
        });
    }
  }, [authStatus, session, router]);

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({
          tenant_id: '',
          title: 'ค่าเช่าห้องพักและสาธารณูปโภค',
          amount: '',
          billing_cycle: '',
          due_date: '',
        });
        if (ownerDormId) fetchBillData(ownerDormId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (billId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/owner/billing/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok && ownerDormId) fetchBillData(ownerDormId);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBill = async (billId: number) => {
    if (!confirm('ยืนยันการลบบิลนี้?')) return;
    try {
      const res = await fetch(`/api/owner/billing/${billId}`, { method: 'DELETE' });
      if (res.ok && ownerDormId) fetchBillData(ownerDormId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerDormId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/billing/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dormId: ownerDormId,
          billingCycle: formData.billing_cycle,
          dueDate: formData.due_date,
          title: formData.title,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setIsBatchModalOpen(false);
        fetchBillData(ownerDormId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBills = bills.filter(b => filterStatus === 'All' || b.status === filterStatus);
  
  const totalUnpaid = bills.filter(b => b.status === 'Unpaid').reduce((acc, b) => acc + Number(b.amount), 0);
  const totalPaidMonth = bills
    .filter(b => b.status === 'Paid')
    .reduce((acc, b) => acc + Number(b.amount), 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#3E342B] tracking-tight">การจัดการบิลและค่าเช่า</h1>
            <p className="text-[#8B7355] mt-2 font-medium">ตรวจสอบสถานะการชำระเงินและออกใบแจ้งหนี้ให้ผู้เช่า</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => {
                setFormData(prev => ({ ...prev, billing_cycle: `รอบเดือน ${new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}` }));
                setIsBatchModalOpen(true);
              }}
              className="bg-[#3E342B] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-[#3E342B]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-fit"
            >
              <svg className="w-5 h-5 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              ออกบิลทั้งหมด (Auto)
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-[#3E342B] border border-[#E5DFD3] px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-3 w-fit"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              ออกบิลรายบุคคล
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-[#E5DFD3] shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl group-hover:bg-rose-100 transition-colors" />
              <p className="text-[10px] font-black text-[#A08D74] uppercase tracking-[0.2em] mb-2">ยอดค้างชำระทั้งหมด</p>
              <h3 className="text-3xl font-black text-rose-500">฿{totalUnpaid.toLocaleString()}</h3>
              <p className="text-xs text-rose-400 mt-2 font-bold flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                 ต้องรีบติดตามการชำระ
              </p>
           </div>
           
           <div className="bg-white p-8 rounded-[2.5rem] border border-[#E5DFD3] shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors" />
              <p className="text-[10px] font-black text-[#A08D74] uppercase tracking-[0.2em] mb-2">ยอดรับชำระแล้ว (รวม)</p>
              <h3 className="text-3xl font-black text-emerald-600">฿{totalPaidMonth.toLocaleString()}</h3>
              <p className="text-xs text-emerald-500 mt-2 font-bold flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 กระแสเงินสดหมุนเวียนปกติ
              </p>
           </div>

           <div className="bg-[#3E342B] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hidden lg:block">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">จำนวนบิลทั้งหมด</p>
              <h3 className="text-3xl font-black text-white">{bills.length} ฉบับ</h3>
              <p className="text-xs text-white/60 mt-2 font-medium">อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}</p>
           </div>
        </div>

        {/* Filter & Table Section */}
        <div className="bg-white rounded-[2.5rem] border border-[#E5DFD3] shadow-sm overflow-hidden">
           <div className="p-8 border-b border-[#F3EFE9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DFD3] w-fit">
                 {['All', 'Unpaid', 'Paid', 'Overdue'].map((status) => (
                   <button
                     key={status}
                     onClick={() => setFilterStatus(status)}
                     className={cn(
                       "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                       filterStatus === status 
                        ? "bg-[#8B7355] text-white shadow-md shadow-[#8B7355]/20" 
                        : "text-[#A08D74] hover:text-[#5A4D41]"
                     )}
                   >
                     {status === 'All' ? 'ทั้งหมด' : status === 'Unpaid' ? 'ค้างชำระ' : status === 'Paid' ? 'จ่ายแล้ว' : 'เกินกำหนด'}
                   </button>
                 ))}
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-[#FAF8F5]">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ห้อง</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ชื่อผู้เช่า</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">รายการ</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">จำนวนเงิน</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">กำหนดชำระ</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">สถานะ</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest text-center">จัดการ</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#F3EFE9]">
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={7} className="px-8 py-6 h-20 bg-[#FAF8F5]/50" />
                        </tr>
                      ))
                    ) : filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-20 text-center text-[#A08D74] font-bold italic">ไม่พบข้อมูลบิลตามเงื่อนไขที่เลือก</td>
                      </tr>
                    ) : filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-[#FAF8F5] transition-colors group">
                         <td className="px-8 py-6 font-black text-[#3E342B]">{bill.room_number}</td>
                         <td className="px-8 py-6 text-[#5A4D41] font-bold">{bill.tenant_name}</td>
                         <td className="px-8 py-6">
                            <p className="text-sm font-bold text-[#3E342B]">{bill.title}</p>
                            <p className="text-[10px] text-[#A08D74] font-medium">{bill.billing_cycle}</p>
                         </td>
                         <td className="px-8 py-6 font-black text-[#8B6A2B] text-lg">฿{Number(bill.amount).toLocaleString()}</td>
                         <td className="px-8 py-6 text-sm font-bold text-[#5A4D41]">{new Date(bill.due_date).toLocaleDateString('th-TH')}</td>
                         <td className="px-8 py-6">
                            <select 
                              value={bill.status}
                              onChange={(e) => updateStatus(bill.id, e.target.value)}
                              className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-all",
                                bill.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                bill.status === 'Overdue' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                "bg-amber-50 text-amber-600 border-amber-100"
                              )}
                            >
                               <option value="Unpaid">ค้างชำระ</option>
                               <option value="Paid">จ่ายแล้ว</option>
                               <option value="Overdue">เกินกำหนด</option>
                            </select>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <button 
                              onClick={() => deleteBill(bill.id)}
                              className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Batch Billing Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
           <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-[#E5DFD3]">
              <div className="bg-[#3E342B] p-10 text-white relative rounded-t-[40px]">
                 <button onClick={() => setIsBatchModalOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <div className="flex items-center gap-4 mb-2">
                    <div className="h-10 w-10 bg-amber-400 rounded-xl flex items-center justify-center text-[#3E342B]">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                       <h2 className="text-2xl font-black">ออกบิลล่วงหน้าอัตโนมัติ</h2>
                       <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Smart Batch Invoicing</p>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-amber-50/50 border-b border-amber-100">
                 <p className="text-sm text-[#8B6A2B] font-bold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ระบบจะสร้างบิล "ค่าเช่า" ให้ผู้เช่าที่สถานะ Active ทุกคนในหอพักนี้
                 </p>
              </div>

              <form onSubmit={handleBatchGenerate} className="p-10 space-y-8">
                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-[#A08D74] uppercase tracking-widest mb-3 ml-1">หัวข้อบิล (ทุกห้อง)</label>
                       <input 
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 font-bold text-[#3E342B]"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-[10px] font-black text-[#A08D74] uppercase tracking-widest mb-3 ml-1">รอบบิล</label>
                          <input 
                             type="text"
                             required
                             value={formData.billing_cycle}
                             onChange={(e) => setFormData({...formData, billing_cycle: e.target.value})}
                             className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 font-bold text-[#3E342B]"
                          />
                       </div>
                       <div>
                          <PremiumDatePicker 
                             label="กำหนดชำระ"
                             date={formData.due_date}
                             onChange={(d) => setFormData({...formData, due_date: d})}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setIsBatchModalOpen(false)} className="flex-1 py-5 text-[#A08D74] font-bold hover:bg-[#FAF8F5] rounded-3xl transition-all">ยกเลิก</button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 py-5 bg-amber-400 text-[#3E342B] font-black rounded-3xl shadow-xl shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                       {submitting ? 'กำลังออกบิล...' : 'เริ่มออกบิลทันที'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Issuing Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
           <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-[#E5DFD3]">
              <div className="bg-[#3E342B] p-10 text-white relative rounded-t-[40px]">
                 <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <h2 className="text-3xl font-black">ออกใบแจ้งหนี้ใหม่</h2>
                 <p className="text-white/40 text-xs mt-2 font-bold uppercase tracking-[0.2em]">Billing Management System</p>
              </div>

              <form onSubmit={handleCreateBill} className="p-10 space-y-8">
                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-[#A08D74] uppercase tracking-widest mb-3 ml-1">เลือกผู้เช่า (ตามเลขห้อง)</label>
                       <select 
                          required
                          value={formData.tenant_id}
                          onChange={(e) => setFormData({...formData, tenant_id: e.target.value})}
                          className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl outline-none focus:ring-2 focus:ring-[#8B6A2B] font-bold text-[#3E342B] transition-all"
                       >
                          <option value="">เลือกห้องพัก...</option>
                          {tenants.map(t => (
                            <option key={t.id} value={t.id}>ห้อง {t.room_number} - {t.name}</option>
                          ))}
                       </select>
                    </div>

                    <div>
                       <label className="block text-[10px] font-black text-[#A08D74] uppercase tracking-widest mb-3 ml-1">หัวข้อบิล</label>
                       <input 
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl outline-none focus:ring-2 focus:ring-[#8B6A2B] font-bold text-[#3E342B]"
                          placeholder="เช่น ค่าเช่าเดือนกุมภาพันธ์"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-[10px] font-black text-[#A08D74] uppercase tracking-widest mb-3 ml-1">รอบบิล</label>
                          <input 
                             type="text"
                             required
                             value={formData.billing_cycle}
                             onChange={(e) => setFormData({...formData, billing_cycle: e.target.value})}
                             className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl outline-none focus:ring-2 focus:ring-[#8B6A2B] font-bold text-[#3E342B]"
                             placeholder="เช่น กุมภาพันธ์ 2026"
                          />
                       </div>
                       <div>
                          <PremiumDatePicker 
                             label="กำหนดชำระ"
                             date={formData.due_date}
                             onChange={(d) => setFormData({...formData, due_date: d})}
                          />
                       </div>
                    </div>

                    <div>
                       <label className="block text-[10px] font-black text-[#A08D74] uppercase tracking-widest mb-3 ml-1">จำนวนเงินรวม (บาท)</label>
                       <input 
                          type="number"
                          required
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          className="w-full px-8 py-5 bg-[#FAF8F5] border border-[#E5DFD3] rounded-3xl outline-none focus:ring-2 focus:ring-[#8B6A2B] font-black text-3xl text-[#8B6A2B]"
                          placeholder="0.00"
                       />
                    </div>
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-5 text-[#A08D74] font-bold hover:bg-[#FAF8F5] rounded-3xl transition-all border border-transparent hover:border-[#E5DFD3]"
                    >
                       ยกเลิก
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 py-5 bg-[#8B6A2B] text-white font-black rounded-3xl shadow-xl shadow-[#8B6A2B]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                       {submitting ? 'กำลังดำเนินการ...' : 'ยืนยันการออกบิล'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
