'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import PremiumDatePicker from '@/app/components/PremiumDatePicker';

interface Contract {
  id: number;
  tenant_name: string;
  room_number: string;
  start_date: string;
  end_date: string;
  deposit_amount: number;
  monthly_rent: number;
  status: string;
  signature_data: string | null;
  created_at: string;
}

interface Room {
  id: number;
  room_number: string;
  price: number;
  status: string;
}

interface Tenant {
  id: number;
  name: string;
  email: string;
}

export default function OwnerContractsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerDormId, setOwnerDormId] = useState<number | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tenant_id: '',
    room_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    deposit_amount: 0,
  });

  const fetchData = async (dormId: number) => {
    setLoading(true);
    try {
      const [contractsRes, roomsRes, tenantsRes] = await Promise.all([
        fetch(`/api/owner/contracts?dormId=${dormId}`),
        fetch(`/api/rooms?dormId=${dormId}`),
        fetch(`/api/tenants?dormId=${dormId}`)
      ]);
      
      const contractsData = await contractsRes.json();
      const roomsData = await roomsRes.json();
      const tenantsData = await tenantsRes.json();
      
      if (contractsData.success) setContracts(contractsData.data);
      if (roomsData.success) setRooms(roomsData.data.filter((r: Room) => r.status === 'Available'));
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
            fetchData(data.dorm.id);
          } else {
            setLoading(false);
          }
        });
    }
  }, [authStatus, session, router]);

  // "Automation" Logic: Auto-calculate deposit based on selected room price
  useEffect(() => {
    if (formData.room_id) {
      const selectedRoom = rooms.find(r => r.id === parseInt(formData.room_id));
      if (selectedRoom) {
        setFormData(prev => ({
          ...prev,
          deposit_amount: selectedRoom.price * 2 // Default deposit: 2 months rent
        }));
      }
    }
  }, [formData.room_id, rooms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        if (ownerDormId) fetchData(ownerDormId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h1 className="text-4xl font-black text-[#3E342B] tracking-tight">ระบบสัญญาเช่าอัตโนมัติ</h1>
              <p className="text-[#8B7355] mt-2 font-medium">จัดการเอกสารสัญญาและลายเซ็นดิจิทัลผ่านระบบออนไลน์</p>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-[#3E342B] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-[#3E342B]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             สร้างสัญญาใหม่
           </button>
        </div>

        {/* Contract List */}
        <div className="bg-white rounded-[2.5rem] border border-[#E5DFD3] shadow-sm overflow-hidden">
           <div className="p-8 border-b border-[#F3EFE9] bg-[#FAF8F5]/50">
              <h3 className="text-sm font-black text-[#A08D74] uppercase tracking-widest">รายการสัญญาเช่าในระบบ</h3>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-[#FAF8F5]">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ผู้เช่า / ห้อง</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ระยะเวลาสัญญา</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">เงินประกัน</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">สถานะ</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest text-center">ลายเซ็น</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#F3EFE9]">
                    {loading ? (
                       <tr className="animate-pulse"><td colSpan={5} className="h-64 bg-[#FAF8F5]/30"></td></tr>
                    ) : contracts.length === 0 ? (
                       <tr><td colSpan={5} className="py-20 text-center font-bold text-[#DCD3C6]">ยังไม่มีสัญญาในระบบ</td></tr>
                    ) : contracts.map((c) => (
                       <tr key={c.id} className="hover:bg-[#FAF8F5] transition-colors group">
                          <td className="px-8 py-6">
                             <p className="font-black text-[#3E342B]">{c.tenant_name}</p>
                             <p className="text-xs font-bold text-[#8B7355]">ห้องพักหมายเลข {c.room_number}</p>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-sm font-bold text-[#3E342B]">{new Date(c.start_date).toLocaleDateString('th-TH')} - {new Date(c.end_date).toLocaleDateString('th-TH')}</p>
                             <p className="text-[10px] text-[#A08D74] font-medium uppercase tracking-wider">12 เดือน / สิ้นสุดปีหน้า</p>
                          </td>
                          <td className="px-8 py-6">
                             <p className="font-bold text-[#3E342B]">฿{Number(c.deposit_amount).toLocaleString()}</p>
                             <p className="text-[10px] text-[#A08D74] font-medium">คำนวณจากค่าเช่า 2 เดือน</p>
                          </td>
                          <td className="px-8 py-6">
                             <span className={cn(
                               "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border",
                               c.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                               c.status === 'Pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                               "bg-[#F3EFE9] text-[#A08D74] border-[#E5DFD3]"
                             )}>
                               {c.status === 'Active' ? 'ลงนามแล้ว' : c.status === 'Pending' ? 'รอลงนาม' : c.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                             {c.signature_data ? (
                                <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                   ตรวจสอบแล้ว
                                </div>
                             ) : (
                                <div className="inline-flex items-center gap-2 text-amber-500 font-bold text-xs opacity-60">
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                   รอผู้เช่าลงนาม...
                                </div>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/60 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500 border border-[#E5DFD3]">
              <div className="bg-[#FAF8F5] border-b border-[#F3EFE9] p-10 flex items-center justify-between rounded-t-[3rem]">
                 <div>
                    <h2 className="text-3xl font-black text-[#3E342B]">สร้างสัญญาอัตโนมัติ</h2>
                    <p className="text-[#8B7355] font-bold text-xs uppercase tracking-[0.2em] mt-2">SmartDom Auto-Contract Engine</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-[#A08D74] hover:text-[#3E342B] border border-[#E5DFD3] transition-all">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-[#A08D74] uppercase tracking-[0.1em] ml-2">1. เลือกห้องที่จะทำสัญญา</label>
                       <select 
                          required
                          value={formData.room_id}
                          onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                          className="w-full h-16 px-6 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl font-bold text-[#3E342B] outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                       >
                          <option value="">เลือกห้องพัก (เฉพาะที่ว่าง)...</option>
                          {rooms.map(r => (
                             <option key={r.id} value={r.id}>ห้อง {r.room_number} (ราคา ฿{r.price.toLocaleString()}/ด.)</option>
                          ))}
                       </select>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-[#A08D74] uppercase tracking-[0.1em] ml-2">2. กำหนดตัวตนผู้เช่า</label>
                       <select 
                          required
                          value={formData.tenant_id}
                          onChange={(e) => setFormData({...formData, tenant_id: e.target.value})}
                          className="w-full h-16 px-6 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl font-bold text-[#3E342B] outline-none transition-all"
                       >
                          <option value="">เลือกผู้เช่าในระบบ...</option>
                          {tenants.map(t => (
                             <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div className="p-8 rounded-[2rem] bg-emerald-50/50 border border-emerald-100/50 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       </div>
                       <h3 className="font-black text-emerald-700 uppercase tracking-widest text-xs">ระบบคำนวณอัตโนมัติ (Smart Calculation)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <PremiumDatePicker 
                          label="วันเริ่มสัญญา"
                          date={formData.start_date}
                          onChange={(d) => setFormData({...formData, start_date: d})}
                       />
                       <PremiumDatePicker 
                          label="วันสิ้นสุดสัญญา"
                          date={formData.end_date}
                          onChange={(d) => setFormData({...formData, end_date: d})}
                       />
                       <div>
                          <label className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-wider mb-2 block">เงินประกัน (2 เดือน)</label>
                          <p className="text-2xl font-black text-emerald-600">฿{formData.deposit_amount.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-[#A08D74] font-bold hover:bg-[#FAF8F5] rounded-3xl transition-all">ยกเลิก</button>
                    <button 
                       type="submit" 
                       disabled={submitting}
                       className="flex-1 py-5 bg-[#3E342B] text-white font-black rounded-3xl shadow-2xl shadow-[#3E342B]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                       {submitting ? 'กำลังสร้างระบบสัญญา...' : 'สร้างและพร้อมส่งลงนาม'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
