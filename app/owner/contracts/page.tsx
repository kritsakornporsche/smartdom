'use client';

import { useState, useEffect, useRef } from 'react';
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
  owner_signature_data?: string | null;
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

  const [activeTab, setActiveTab] = useState<'Pending' | 'Active'>('Pending');
  const [signingContract, setSigningContract] = useState<Contract | null>(null);

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasOwnerSigned, setHasOwnerSigned] = useState(false);

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

  useEffect(() => {
    if (formData.room_id) {
      const selectedRoom = rooms.find(r => r.id === parseInt(formData.room_id));
      if (selectedRoom) {
        setFormData(prev => ({
          ...prev,
          deposit_amount: selectedRoom.price * 2
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

  // Canvas functions
  useEffect(() => {
    if (signingContract) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
        }
      }
    }
  }, [signingContract]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasOwnerSigned(true);
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setHasOwnerSigned(false);
  };

  const handleApproveContract = async () => {
    if (!signingContract) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ownerSignatureData = canvas.toDataURL();
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/owner/contracts/${signingContract.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerSignatureData }),
      });
      const data = await res.json();
      if (data.success) {
        setSigningContract(null);
        setHasOwnerSigned(false);
        setActiveTab('Active');
        if (ownerDormId) fetchData(ownerDormId);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingContracts = contracts.filter(c => c.status === 'PendingOwnerSignature');
  const activeAndOtherContracts = contracts.filter(c => c.status !== 'PendingOwnerSignature' && c.status !== 'Pending');

  const displayedContracts = activeTab === 'Pending' ? pendingContracts : activeAndOtherContracts;

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

        {/* Dashboard / Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setActiveTab('Pending')}
            className={cn(
              "p-6 rounded-3xl cursor-pointer transition-all border",
              activeTab === 'Pending' 
                ? "bg-amber-100/50 border-amber-300 shadow-lg shadow-amber-900/5 scale-[1.02]" 
                : "bg-white border-[#E5DFD3] hover:bg-amber-50"
            )}
          >
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-2">สัญญาใหม่ (รอเจ้าของเซ็นอนุมัติ)</h3>
            <p className="text-4xl font-black text-amber-600">{pendingContracts.length} <span className="text-lg font-bold text-amber-700/50">รายการ</span></p>
          </div>
          <div 
            onClick={() => setActiveTab('Active')}
            className={cn(
              "p-6 rounded-3xl cursor-pointer transition-all border",
              activeTab === 'Active' 
                ? "bg-emerald-100/50 border-emerald-300 shadow-lg shadow-emerald-900/5 scale-[1.02]" 
                : "bg-white border-[#E5DFD3] hover:bg-emerald-50"
            )}
          >
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-2">สัญญาที่กำลังใช้งาน (Active)</h3>
            <p className="text-4xl font-black text-emerald-600">{activeAndOtherContracts.length} <span className="text-lg font-bold text-emerald-700/50">รายการ</span></p>
          </div>
        </div>

        {/* Contract List */}
        <div className="bg-white rounded-[2.5rem] border border-[#E5DFD3] shadow-sm overflow-hidden flex flex-col">
           <div className="p-8 border-b border-[#F3EFE9] bg-[#FAF8F5]/50 flex justify-between items-center">
              <h3 className="text-sm font-black text-[#A08D74] uppercase tracking-widest">
                {activeTab === 'Pending' ? 'รายการสัญญาที่รออนุมัติ' : 'รายการสัญญาเช่าทั้งหมดในระบบ'}
              </h3>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-[#FAF8F5]">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ผู้เช่า / ห้อง</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ระยะเวลาสัญญา</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">เงินประกัน</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">สถานะ</th>
                       <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest text-center">การจัดการ</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#F3EFE9]">
                    {loading ? (
                       <tr className="animate-pulse"><td colSpan={5} className="h-64 bg-[#FAF8F5]/30"></td></tr>
                    ) : displayedContracts.length === 0 ? (
                       <tr><td colSpan={5} className="py-20 text-center font-bold text-[#DCD3C6]">ไม่มีรายการในหมวดหมู่นี้</td></tr>
                    ) : displayedContracts.map((c) => (
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
                               c.status === 'PendingOwnerSignature' ? "bg-amber-50 text-amber-600 border-amber-100" :
                               c.status === 'Pending' ? "bg-blue-50 text-blue-600 border-blue-100" :
                               "bg-[#F3EFE9] text-[#A08D74] border-[#E5DFD3]"
                             )}>
                               {c.status === 'Active' ? 'อนุมัติแล้ว' : 
                                c.status === 'PendingOwnerSignature' ? 'รอเจ้าของเซ็น' : 
                                c.status === 'Pending' ? 'รอผู้เช่าเซ็น' : c.status}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                               {c.status === 'PendingOwnerSignature' ? (
                                  <button 
                                    onClick={() => setSigningContract(c)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
                                  >
                                    ตรวจและเซ็น
                                  </button>
                               ) : c.owner_signature_data ? (
                                  <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 whitespace-nowrap">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                     สมบูรณ์
                                  </div>
                               ) : (
                                  <div className="inline-flex items-center gap-2 text-[#A08D74] font-bold text-xs opacity-60 whitespace-nowrap">
                                     รอระบบอัตโนมัติ
                                  </div>
                               )}
                               
                               <button 
                                 onClick={() => router.push(`/owner/contracts/${c.id}`)}
                                 className="text-[#A08D74] hover:text-[#3E342B] border border-[#E5DFD3] hover:border-[#A08D74] bg-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                               >
                                 ดูรายละเอียด
                               </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Owner Signing Modal */}
      {signingContract && (
        <div className="fixed inset-0 bg-[#3E342B]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <div className="bg-white rounded-[3rem] w-full max-w-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-500 border border-[#E5DFD3]">
              <div className="bg-amber-50 border-b border-amber-100/50 p-8 sm:p-10 flex items-center justify-between rounded-t-[3rem]">
                 <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-amber-900">ตรวจและอนุมัติสัญญา</h2>
                    <p className="text-amber-700/60 font-bold text-xs uppercase tracking-[0.2em] mt-2">Owner Signature Approval</p>
                 </div>
                 <button onClick={() => { setSigningContract(null); setHasOwnerSigned(false); }} className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 hover:text-amber-800 border border-amber-200 transition-all">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <div className="p-8 sm:p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-4 text-sm bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5DFD3]">
                    <div><span className="block text-[10px] font-black text-[#A08D74] uppercase tracking-widest">ผู้เช่า</span><span className="font-bold text-[#3E342B]">{signingContract.tenant_name}</span></div>
                    <div><span className="block text-[10px] font-black text-[#A08D74] uppercase tracking-widest">ห้องพัก</span><span className="font-bold text-[#3E342B]">{signingContract.room_number}</span></div>
                    <div><span className="block text-[10px] font-black text-[#A08D74] uppercase tracking-widest">เงินประกัน</span><span className="font-bold text-emerald-600">฿{Number(signingContract.deposit_amount).toLocaleString()}</span></div>
                    <div><span className="block text-[10px] font-black text-[#A08D74] uppercase tracking-widest">ลายเซ็นผู้เช่า</span>
                      {signingContract.signature_data ? (
                         <div style={{ backgroundImage: `url(${signingContract.signature_data})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', height: '40px', width: '80px' }} />
                      ) : <span className="opacity-50">ไม่มีข้อมูล</span>}
                    </div>
                 </div>

                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A08D74]">ลงลายมือชื่อเจ้าของหอพัก</label>
                      <button onClick={clearCanvas} className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors">ล้างข้อมูล</button>
                   </div>
                   <div className="relative border-2 border-dashed border-[#E5DFD3] rounded-[2rem] overflow-hidden bg-white hover:border-amber-300 transition-colors h-48 w-full cursor-crosshair">
                     <canvas 
                       ref={canvasRef}
                       width={800}
                       height={200}
                       className="w-full h-full"
                       onMouseDown={startDrawing}
                       onMouseMove={draw}
                       onMouseUp={stopDrawing}
                       onMouseLeave={stopDrawing}
                       onTouchStart={startDrawing}
                       onTouchMove={draw}
                       onTouchEnd={stopDrawing}
                     />
                     {!hasOwnerSigned && (
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-xs font-black text-[#A08D74]/40 uppercase tracking-[0.5em] italic">Sign Here</span>
                       </div>
                     )}
                   </div>
                 </div>

                 <button 
                    onClick={handleApproveContract}
                    disabled={submitting || !hasOwnerSigned}
                    className="w-full py-5 bg-amber-600 text-white font-black rounded-3xl shadow-xl shadow-amber-900/10 hover:bg-amber-500 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
                 >
                    {submitting ? 'กำลังบันทึก...' : 'เซ็นอนุมัติและเพิ่มเข้าระบบผู้เช่า'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/60 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500 border border-[#E5DFD3]">
              <div className="bg-[#FAF8F5] border-b border-[#F3EFE9] p-10 flex items-center justify-between rounded-t-[3rem]">
                 <div>
                    <h2 className="text-3xl font-black text-[#3E342B]">สร้างสัญญาด้วยตนเอง</h2>
                    <p className="text-[#8B7355] font-bold text-xs uppercase tracking-[0.2em] mt-2">Manual Contract Creation</p>
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
                          className="w-full h-16 px-6 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl font-bold text-[#3E342B] outline-none transition-all"
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
                       <h3 className="font-black text-emerald-700 uppercase tracking-widest text-xs">ระบบคำนวณอัตโนมัติ</h3>
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
                       {submitting ? 'กำลังสร้างระบบสัญญา...' : 'บันทึกเข้าระบบ (รอผู้เช่าเซ็น)'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
