'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PremiumDatePicker from '@/app/components/PremiumDatePicker';

interface Contract {
  id: number;
  tenant_name: string;
  tenant_email?: string;
  tenant_phone?: string;
  room_number: string;
  room_type?: string;
  start_date: string;
  end_date: string;
  deposit_amount: number;
  monthly_rent?: number;
  status: string;
  contract_file_url?: string | null;
  renewal_requested?: number;
  renewal_note?: string | null;
  parent_contract_id?: number | null;
  created_at: string;
}

interface Room {
  id: number;
  room_number: string;
  price: number;
  status: string;
}

export default function OwnerContractsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerDormId, setOwnerDormId] = useState<number | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [previewingFileUrl, setPreviewingFileUrl] = useState<string | null>(null);
  const [previewingTitle, setPreviewingTitle] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');
  const [submitting, setSubmitting] = useState(false);

  // New Contract Form State
  const [formData, setFormData] = useState({
    tenant_name: '',
    tenant_email: '',
    tenant_phone: '',
    room_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    deposit_amount: 0,
    contract_file_url: '',
    contract_file_name: '',
  });

  // Renewal Form State
  const [renewData, setRenewData] = useState({
    new_end_date: '',
    deposit_amount: 0,
    contract_file_url: '',
    contract_file_name: '',
  });

  const fetchData = async (dormId: number) => {
    setLoading(true);
    try {
      const [contractsRes, roomsRes] = await Promise.all([
        fetch(`/api/owner/contracts?dormId=${dormId}`),
        fetch(`/api/rooms?dormId=${dormId}`)
      ]);

      const contractsJson = await contractsRes.json();
      const roomsJson = await roomsRes.json();

      if (contractsJson.success) setContracts(contractsJson.data);
      if (roomsJson.success) setRooms(roomsJson.data.filter((r: Room) => r.status === 'Available'));
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

    if (authStatus === 'authenticated' && session?.user?.email) {
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

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isRenewal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      if (isRenewal) {
        setRenewData(prev => ({
          ...prev,
          contract_file_url: resultStr,
          contract_file_name: file.name
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          contract_file_url: resultStr,
          contract_file_name: file.name
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Demo Auto-fill for New Contract
  const handleAutoFillDemo = () => {
    const firstRoom = rooms[0];
    setFormData({
      tenant_name: 'สมชาย ใจดี',
      tenant_email: 'tenant@gmail.com',
      tenant_phone: '089-123-4567',
      room_id: firstRoom ? firstRoom.id.toString() : '1',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      deposit_amount: firstRoom ? firstRoom.price * 2 : 9000,
      contract_file_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
      contract_file_name: 'สัญญาเช่าห้องพักฉบับจริง (สมชาย ใจดี).pdf (ตัวอย่าง)',
    });
    alert('⚡ เติมข้อมูลทดสอบสัญญาสำเร็จ!');
  };

  // Create Contract Submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room_id || !formData.tenant_name || !formData.tenant_email) {
      alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
      return;
    }
    if (!formData.contract_file_url) {
      alert('กรุณาแนบไฟล์/รูปถ่ายเอกสารสัญญาเช่าฉบับจริง');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dormId: ownerDormId
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('🎉 บันทึกสัญญาเช่าและปรับสถานะผู้เช่าสำเร็จเรียบร้อยแล้ว!');
        setIsCreateModalOpen(false);
        setFormData({
          tenant_name: '',
          tenant_email: '',
          tenant_phone: '',
          room_id: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          deposit_amount: 0,
          contract_file_url: '',
          contract_file_name: '',
        });
        if (ownerDormId) fetchData(ownerDormId);
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการบันทึกสัญญา');
      }
    } catch (err: any) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Renewal Submission
  const handleOpenRenewModal = (c: Contract) => {
    setRenewingContract(c);
    const defaultNewEnd = c.end_date 
      ? new Date(new Date(c.end_date).setFullYear(new Date(c.end_date).getFullYear() + 1)).toISOString().split('T')[0]
      : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

    setRenewData({
      new_end_date: defaultNewEnd,
      deposit_amount: c.deposit_amount || 0,
      contract_file_url: '',
      contract_file_name: '',
    });
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingContract) return;

    if (!renewData.new_end_date) {
      alert('กรุณาระบุวันสิ้นสุดสัญญาฉบับใหม่');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/contracts/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: renewingContract.id,
          new_end_date: renewData.new_end_date,
          deposit_amount: renewData.deposit_amount,
          contract_file_url: renewData.contract_file_url || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('🎉 ต่ออายุสัญญาเช่าเรียบร้อยแล้ว!');
        setRenewingContract(null);
        if (ownerDormId) fetchData(ownerDormId);
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการต่ออายุสัญญา');
      }
    } catch (err: any) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const activeContracts = contracts.filter(c => c.status === 'Active');
  const historyContracts = contracts.filter(c => c.status !== 'Active');
  const renewalRequestedCount = activeContracts.filter(c => c.renewal_requested === 1).length;

  const displayedContracts = activeTab === 'Active' ? activeContracts : historyContracts;

  return (
    <div className="flex-1 overflow-y-auto bg-[#080F1E] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <h1 className="text-3xl font-black text-white tracking-tight">บันทึกสัญญาเช่าและต่อสัญญา</h1>
            </div>
            <p className="text-white/50 text-sm font-medium ml-4 mt-1">
              แนบไฟล์/รูปถ่ายเอกสารสัญญาฉบับจริง อัปเดตสิทธิ์ลูกหออัตโนมัติ และจัดการการต่ออายุสัญญา
            </p>
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 self-start md:self-auto cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            📝 บันทึกสัญญาเช่าใหม่
          </button>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => setActiveTab('Active')}
            className={`p-6 rounded-3xl cursor-pointer transition-all border ${
              activeTab === 'Active' 
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-950/20' 
                : 'bg-[#0F172A] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">สัญญาที่มีผลบังคับใช้ (Active)</h3>
              <span className="text-xl">🟢</span>
            </div>
            <p className="text-4xl font-black text-white">{activeContracts.length} <span className="text-xs text-white/50 font-medium">สัญญา</span></p>
          </div>

          <div 
            onClick={() => setActiveTab('Active')}
            className={`p-6 rounded-3xl cursor-pointer transition-all border ${
              renewalRequestedCount > 0 
                ? 'bg-amber-500/15 border-amber-500/50 animate-pulse' 
                : 'bg-[#0F172A] border-white/10'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">ลูกหอส่งคำขอต่อสัญญา</h3>
              <span className="text-xl">🔔</span>
            </div>
            <p className="text-4xl font-black text-amber-400">{renewalRequestedCount} <span className="text-xs text-amber-300/60 font-medium">รายการ</span></p>
          </div>

          <div 
            onClick={() => setActiveTab('History')}
            className={`p-6 rounded-3xl cursor-pointer transition-all border ${
              activeTab === 'History' 
                ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-950/20' 
                : 'bg-[#0F172A] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest">ประวัติสัญญาเดิม (History)</h3>
              <span className="text-xl">📜</span>
            </div>
            <p className="text-4xl font-black text-white">{historyContracts.length} <span className="text-xs text-white/50 font-medium">รายการ</span></p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 gap-8">
          <button
            onClick={() => setActiveTab('Active')}
            className={`pb-4 font-black text-sm transition-all border-b-2 ${
              activeTab === 'Active' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            🟢 รายการสัญญาปัจจุบัน ({activeContracts.length})
          </button>
          <button
            onClick={() => setActiveTab('History')}
            className={`pb-4 font-black text-sm transition-all border-b-2 ${
              activeTab === 'History' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            📜 ประวัติสัญญาย้อนหลัง / หมดอายุ ({historyContracts.length})
          </button>
        </div>

        {/* Contracts Table */}
        <div className="bg-[#0F172A] rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0B0F19] border-b border-white/10">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-white/50 uppercase tracking-widest">ห้อง / ลูกหอ</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/50 uppercase tracking-widest">ระยะเวลาสัญญา</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/50 uppercase tracking-widest">เงินประกัน</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/50 uppercase tracking-widest">เอกสารสัญญาจริง</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/50 uppercase tracking-widest">สถานะ</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/50 uppercase tracking-widest text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-white/40 font-bold animate-pulse">
                      กำลังโหลดข้อมูลสัญญาเช่า...
                    </td>
                  </tr>
                ) : displayedContracts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-white/40 font-bold">
                      ไม่พบรายการสัญญาในหมวดหมู่นี้
                    </td>
                  </tr>
                ) : (
                  displayedContracts.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 text-primary font-black rounded-xl flex items-center justify-center text-sm border border-primary/30">
                            {c.room_number}
                          </div>
                          <div>
                            <p className="font-black text-white">{c.tenant_name}</p>
                            <p className="text-xs text-white/50">{c.tenant_email || 'ไม่ระบุอีเมล'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <p className="font-bold text-white">
                          {new Date(c.start_date).toLocaleDateString('th-TH')} - {new Date(c.end_date).toLocaleDateString('th-TH')}
                        </p>
                        {c.parent_contract_id && (
                          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mt-0.5">
                            🔄 ต่ออายุมาจากสัญญา #{c.parent_contract_id}
                          </span>
                        )}
                      </td>

                      <td className="px-8 py-6 font-bold text-emerald-400">
                        ฿{Number(c.deposit_amount || 0).toLocaleString()}
                      </td>

                      <td className="px-8 py-6">
                        {c.contract_file_url ? (
                          <button
                            onClick={() => {
                              setPreviewingFileUrl(c.contract_file_url || null);
                              setPreviewingTitle(`สัญญาเช่าห้อง ${c.room_number} (${c.tenant_name})`);
                            }}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <span>📄 ดูไฟล์สัญญา</span>
                          </button>
                        ) : (
                          <span className="text-xs text-white/40 italic">ไม่มีไฟล์แนบ</span>
                        )}
                      </td>

                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border inline-block ${
                            c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            c.status === 'Renewed' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-white/10 text-white/50 border-white/20'
                          }`}>
                            {c.status === 'Active' ? 'มีผลบังคับใช้' :
                             c.status === 'Renewed' ? 'ต่ออายุแล้ว' : c.status}
                          </span>

                          {c.renewal_requested === 1 && (
                            <span className="block text-[10px] font-bold text-amber-400 animate-pulse">
                              🔔 แจ้งขอต่อสัญญา ({c.renewal_note || 'ขอต่อสัญญา'})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {c.status === 'Active' && (
                            <button
                              onClick={() => handleOpenRenewModal(c)}
                              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span>🔄 ต่อสัญญา</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal 1: Create New Contract */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#0F172A] rounded-[36px] w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#0B0F19] border-b border-white/10 p-8 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-white">📝 บันทึกสัญญาเช่าใหม่</h2>
                <p className="text-xs text-white/50 font-medium mt-1">แนบไฟล์สัญญาเช่าจริงที่เซ็นแล้ว เพื่อยกระดับสิทธิ์ผู้เช่าเป็นลูกหออัตโนมัติ</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-8 custom-scrollbar">
              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  ⚡ เติมข้อมูลทดสอบสัญญา (Auto-fill Demo)
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">เลือกห้องพัก (เฉพาะห้องว่าง)</label>
                  <select
                    required
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white font-bold outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="" className="bg-[#0F172A]">-- เลือกห้องพัก --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id} className="bg-[#0F172A]">
                        ห้อง {r.room_number} (ราคา ฿{r.price.toLocaleString()}/เดือน)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">ชื่อ-นามสกุล ผู้เช่า</label>
                    <input
                      type="text"
                      required
                      placeholder="สมชาย ใจดี"
                      value={formData.tenant_name}
                      onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white font-bold outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">อีเมลผู้เช่า (สำหรับสร้างบัญชีเข้าใช้งาน)</label>
                    <input
                      type="email"
                      required
                      placeholder="tenant@gmail.com"
                      value={formData.tenant_email}
                      onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white font-bold outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">เบอร์โทรศัพท์ผู้เช่า</label>
                    <input
                      type="text"
                      placeholder="089-123-4567"
                      value={formData.tenant_phone}
                      onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white font-bold outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">เงินประกัน (Deposit)</label>
                    <input
                      type="number"
                      required
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white font-bold outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PremiumDatePicker
                    label="วันเริ่มสัญญา"
                    date={formData.start_date}
                    onChange={(d) => setFormData({ ...formData, start_date: d })}
                  />
                  <PremiumDatePicker
                    label="วันสิ้นสุดสัญญา"
                    date={formData.end_date}
                    onChange={(d) => setFormData({ ...formData, end_date: d })}
                  />
                </div>

                {/* Upload Signed Contract File */}
                <div className="space-y-3 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest">
                    📄 แนบไฟล์/รูปถ่ายเอกสารสัญญาฉบับจริง (Signed Contract File / Photo)
                  </label>
                  
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="w-full px-6 py-4 bg-black/30 border border-white/20 rounded-xl text-xs text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:brightness-110 cursor-pointer"
                  />
                  {formData.contract_file_name && (
                    <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 mt-2">
                      <span>✓ แนบไฟล์เรียบร้อย:</span> {formData.contract_file_name}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-4 text-white/50 font-bold hover:bg-white/5 rounded-2xl transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'กำลังบันทึกสัญญา...' : 'บันทึกสัญญาและตั้งสิทธิ์ลูกหอ →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Contract Renewal */}
      {renewingContract && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#0F172A] rounded-[36px] w-full max-w-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-[#0B0F19] border-b border-white/10 p-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">🔄 ต่ออายุสัญญาเช่า</h2>
                <p className="text-xs text-white/50 font-medium mt-1">ห้อง {renewingContract.room_number} - {renewingContract.tenant_name}</p>
              </div>
              <button 
                onClick={() => setRenewingContract(null)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="p-8 space-y-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-medium space-y-1">
                <p className="font-bold">สัญญาเดิม: {new Date(renewingContract.start_date).toLocaleDateString('th-TH')} - {new Date(renewingContract.end_date).toLocaleDateString('th-TH')}</p>
                {renewingContract.renewal_note && <p>คำขอจากลูกหอ: &quot;{renewingContract.renewal_note}&quot;</p>}
              </div>

              <PremiumDatePicker
                label="กำหนดวันสิ้นสุดสัญญาฉบับต่ออายุใหม่"
                date={renewData.new_end_date}
                onChange={(d) => setRenewData({ ...renewData, new_end_date: d })}
              />

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">เงินประกันใหม่ (ถ้ามี)</label>
                <input
                  type="number"
                  value={renewData.deposit_amount}
                  onChange={(e) => setRenewData({ ...renewData, deposit_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white font-bold outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Upload Renewal Signed Contract File */}
              <div className="space-y-3 p-6 bg-white/5 rounded-2xl border border-white/10">
                <label className="block text-[10px] font-black text-white/70 uppercase tracking-widest">
                  📄 แนบไฟล์/รูปถ่ายเอกสารสัญญาฉบับต่ออายุใหม่
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="w-full px-6 py-4 bg-black/30 border border-white/20 rounded-xl text-xs text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-white hover:file:brightness-110 cursor-pointer"
                />
                {renewData.contract_file_name && (
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 mt-2">
                    <span>✓ แนบไฟล์ต่ออายุเรียบร้อย:</span> {renewData.contract_file_name}
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setRenewingContract(null)}
                  className="flex-1 py-4 text-white/50 font-bold hover:bg-white/5 rounded-2xl transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-4 bg-amber-500 text-white font-black rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึกต่ออายุ...' : 'บันทึกต่ออายุสัญญา →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Preview Contract Document */}
      {previewingFileUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#0F172A] rounded-[36px] w-full max-w-4xl max-h-[90vh] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-[#0B0F19] border-b border-white/10 p-6 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-white">{previewingTitle}</h3>
              <div className="flex items-center gap-3">
                <a
                  href={previewingFileUrl}
                  download="contract_document"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-lg hover:brightness-110 transition-all"
                >
                  📥 ดาวน์โหลดเอกสาร
                </a>
                <button
                  onClick={() => setPreviewingFileUrl(null)}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center custom-scrollbar">
              {previewingFileUrl.startsWith('data:image') || previewingFileUrl.startsWith('http') ? (
                <div className="relative w-full min-h-[500px] flex items-center justify-center">
                  <Image
                    src={previewingFileUrl}
                    alt="Contract Document"
                    width={800}
                    height={1000}
                    unoptimized
                    className="max-w-full h-auto object-contain rounded-2xl shadow-2xl"
                  />
                </div>
              ) : (
                <iframe
                  src={previewingFileUrl}
                  className="w-full h-[600px] rounded-2xl border border-white/10"
                  title="Document Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
