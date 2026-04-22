'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Parcel {
  id: number;
  dorm_id: number;
  room_number: string;
  recipient_name: string;
  tracking_number: string | null;
  carrier: string | null;
  status: string;
  received_date: string;
  picked_up_at: string | null;
  image_url: string | null;
}

export default function ParcelManagement() {
  const { data: session, status: authStatus } = useSession();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [ownerDormId, setOwnerDormId] = useState<number | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    room_number: '',
    recipient_name: '',
    tracking_number: '',
    carrier: 'Kerry',
    status: 'Received',
  });

  const carriers = ['Kerry', 'Flash', 'Thai Post', 'J&T', 'Shopee', 'Lazada', 'Other'];

  const fetchParcels = async (dormId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/parcels?dormId=${dormId}`);
      const data = await res.json();
      if (data.success) {
        setParcels(data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      console.error('[Parcels] Fetch error:', err);
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (authStatus === 'authenticated' && session?.user) {
      const dormId = (session.user as any).dorm_id;
      if (dormId) {
        setOwnerDormId(dormId);
        fetchParcels(dormId);
      } else {
        // Fallback
        const init = async () => {
          try {
            const res = await fetch(`/api/owner/onboarding?email=${session?.user?.email}`);
            const data = await res.json();
            if (data.success && data.hasDorm) {
              setOwnerDormId(data.dorm.id);
              fetchParcels(data.dorm.id);
            } else {
              setLoading(false);
            }
          } catch (err) {
            setLoading(false);
          }
        };
        init();
      }
    } else if (authStatus !== 'loading') {
      setLoading(false);
    }
  }, [authStatus, (session?.user as any)?.dorm_id, session?.user?.email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerDormId) return;

    try {
      const res = await fetch('/api/owner/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, dorm_id: ownerDormId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ room_number: '', recipient_name: '', tracking_number: '', carrier: 'Kerry', status: 'Received' });
        fetchParcels(ownerDormId);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to save parcel');
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/owner/parcels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && ownerDormId) {
        fetchParcels(ownerDormId);
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const deleteParcel = async (id: number) => {
    if (!confirm('Confirm delete?')) return;
    try {
      await fetch(`/api/owner/parcels/${id}`, { method: 'DELETE' });
      if (ownerDormId) fetchParcels(ownerDormId);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredParcels = parcels.filter(p => {
    const matchesSearch = p.room_number.includes(searchQuery) || 
                          (p.tracking_number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          p.recipient_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: parcels.length,
    waiting: parcels.filter(p => p.status === 'Received').length,
    pickedUp: parcels.filter(p => p.status === 'Picked Up').length,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FDFBF7]">
      {/* Header */}
      <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0 z-10 shadow-sm transition-all duration-300">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#8B7355] rounded-full" />
            <h1 className="text-2xl font-black text-[#3E342B] tracking-tight">จัดการพัสดุ</h1>
          </div>
          <p className="text-sm font-bold text-[#A08D74] uppercase tracking-wide ml-3.5 mt-0.5 opacity-80">
            SmartDom Parcel & Delivery System
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="ค้นหาเลขห้อง หรือ เลขพัสดุ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl text-sm font-bold text-[#5A4D41] focus:ring-2 focus:ring-[#8B7355] focus:bg-white transition-all outline-none w-64 group-hover:w-80 duration-500"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#A08D74] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button 
            disabled={!ownerDormId}
            onClick={() => setIsModalOpen(true)}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 transition-all duration-300 group ${
              !ownerDormId 
              ? 'bg-[#E5DFD3] text-[#A08D74] cursor-not-allowed opacity-50' 
              : 'bg-[#3E342B] text-white shadow-[#3E342B]/20 hover:-translate-y-1 active:scale-95'
            }`}
          >
            <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </div>
            ลงทะเบียนรับพัสดุ
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="px-10 py-8 grid grid-cols-3 gap-6 shrink-0 bg-gradient-to-b from-white/40 to-transparent">
        {[
          { label: 'พัสดุทั้งหมด', val: stats.total, color: 'bg-[#8B7355]', icon: '📦' },
          { label: 'ยังไม่ได้รับ', val: stats.waiting, color: 'bg-amber-500', icon: '⏳' },
          { label: 'รับไปแล้ว', val: stats.pickedUp, color: 'bg-emerald-500', icon: '✅' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-[#E5DFD3] shadow-sm flex items-center gap-5 hover:border-[#8B7355] transition-colors group">
            <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
              {s.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-[#A08D74] uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-black text-[#3E342B]">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-10 mb-4 flex items-center gap-6 shrink-0">
        <div className="flex bg-[#F3EFE9] p-1 rounded-2xl border border-[#E5DFD3]">
          {['All', 'Received', 'Picked Up'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                filterStatus === s 
                ? 'bg-white text-[#3E342B] shadow-sm ring-1 ring-[#DCD3C6]' 
                : 'text-[#A08D74] hover:text-[#5A4D41]'
              }`}
            >
              {s === 'All' ? 'ทั้งหมด' : s === 'Received' ? 'ยังไม่มารับ' : 'รับแล้ว'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-10 pb-10 scroll-smooth custom-scrollbar">
        {loading ? (
             <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-[#E5DFD3]" />)}
             </div>
        ) : filteredParcels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-40">
                <div className="text-2xl mb-4">📫</div>
                <p className="font-bold text-[#3E342B]">ไม่พบข้อมูลพัสดุ</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredParcels.map((parcel) => (
                <div key={parcel.id} className="bg-white rounded-3xl border border-[#E5DFD3] p-6 flex items-center justify-between hover:border-[#8B7355] transition-all group shadow-sm hover:shadow-xl">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#F3EFE9] rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-sm font-black text-[#A08D74] uppercase tracking-tighter">Room</span>
                        <span className="text-xl font-black text-[#3E342B]">{parcel.room_number}</span>
                    </div>
                    <div>
                        <h3 className="font-black text-[#3E342B] text-lg">{parcel.recipient_name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="px-2.5 py-1 bg-[#8B7355]/10 text-[#8B7355] text-sm font-black rounded-lg uppercase tracking-wider border border-[#8B7355]/20">
                                {parcel.carrier}
                            </span>
                            <span className="text-xs font-bold text-[#A08D74] tracking-tight">
                                {parcel.tracking_number || 'No tracking'}
                            </span>
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="text-right sr-only-md:hidden">
                        <p className="text-sm font-black text-[#A08D74] uppercase tracking-wider">Received Date</p>
                        <p className="text-sm font-bold text-[#3E342B] mt-0.5">
                            {new Date(parcel.received_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-sm font-bold text-[#A08D74] opacity-60">
                            {new Date(parcel.received_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {parcel.status === 'Received' ? (
                            <button 
                                onClick={() => updateStatus(parcel.id, 'Picked Up')}
                                className="px-6 py-3 bg-[#3E342B] text-white text-xs font-black rounded-2xl shadow-lg hover:-translate-y-1 transition-all active:scale-95"
                            >
                                ยืนยันการรับของ
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                <span className="text-xs font-black">รับแล้ว</span>
                            </div>
                        )}
                        <button 
                            onClick={() => deleteParcel(parcel.id)}
                            className="p-3 text-[#A08D74] hover:text-rose-500 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom duration-500 border border-[#8B7355]/20">
             <div className="bg-[#3E342B] p-8 text-white text-center relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#8B7355] rounded-full blur-3xl opacity-20" />
                <h2 className="text-2xl font-black mb-1">ลงทะเบียนพัสดุใหม่</h2>
                <p className="text-white/40 text-xs font-black uppercase tracking-wider">SmartDom Digital Logistics</p>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-1.5">
                        <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">เลขห้อง</label>
                        <input 
                            type="text" required
                            value={formData.room_number}
                            onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                            className="w-full px-5 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black text-center focus:bg-white outline-none focus:ring-2 focus:ring-[#8B7355] transition-all"
                            placeholder="101"
                        />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">ชื่อผู้รับบนพัสดุ</label>
                        <input 
                            type="text" required
                            value={formData.recipient_name}
                            onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                            className="w-full px-5 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black focus:bg-white outline-none focus:ring-2 focus:ring-[#8B7355] transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">ขนส่ง (Carrier)</label>
                    <div className="flex flex-wrap gap-2">
                        {carriers.map(c => (
                            <button
                                key={c} type="button"
                                onClick={() => setFormData({...formData, carrier: c})}
                                className={`px-4 py-2.5 rounded-xl text-sm font-black border transition-all ${
                                    formData.carrier === c 
                                    ? 'bg-[#3E342B] text-white border-[#3E342B] shadow-md shadow-black/10' 
                                    : 'bg-[#F3EFE9] text-[#A08D74] border-[#E5DFD3] hover:border-[#8B7355]'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">เลขพัสดุ (Tracking No.)</label>
                    <input 
                        type="text"
                        value={formData.tracking_number}
                        onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
                        className="w-full px-5 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black focus:bg-white outline-none focus:ring-2 focus:ring-[#8B7355] transition-all"
                        placeholder="TH123456789"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                        type="button" onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-4 text-xs font-black text-[#A08D74] hover:bg-[#F3EFE9] rounded-2xl transition-all"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        type="submit"
                        className="flex-[2] py-4 bg-[#3E342B] text-white text-xs font-black rounded-2xl shadow-xl shadow-black/10 hover:-translate-y-1 active:scale-95 transition-all"
                    >
                        บันทึกพัสดุ
                    </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
