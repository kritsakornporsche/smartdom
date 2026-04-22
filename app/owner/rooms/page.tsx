'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Room {
  id: number;
  room_number: string;
  room_type: string;
  price: number;
  status: string;
  floor: number;
  image_url?: string | null;
}

export default function RoomsManagement() {
  const { data: session, status: authStatus } = useSession();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dormError, setDormError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const router = useRouter();

  // Updated Form State to handle multiple images
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Standard',
    price: 4500,
    floor: 1,
    status: 'Available',
    images: [] as string[] // array of base64 strings
  });

  const [ownerDormId, setOwnerDormId] = useState<number | null>(null);

  const fetchRooms = async (dormId: number) => {
    setLoading(true);
    setDormError(null);
    try {
      const url = dormId > 0 ? `/api/rooms?dormId=${dormId}` : '/api/rooms';
      console.log('[Rooms] Fetching from:', url);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('[Rooms] Fetch result:', data);
      if (data.success) {
        setRooms(data.data);
      } else {
        setDormError(data.message || 'Failed to fetch rooms from API');
      }
    } catch (err: any) {
      console.error('[Rooms] Fetch error:', err);
      setDormError(`Network Error: ${err.message}. Please check if the server is running.`);
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
        console.log('[Rooms] Using Dorm ID from session:', dormId);
        setOwnerDormId(dormId);
        fetchRooms(dormId);
      } else {
        // Fallback for sessions without dorm_id or if it needs refresh
        const init = async () => {
          try {
            console.log('[Rooms] Initializing via fallback for:', session.user?.email);
            const res = await fetch(`/api/owner/onboarding?email=${session?.user?.email}`);
            const data = await res.json();
            console.log('[Rooms] Onboarding fallback data:', data);
            
            if (data.success && data.hasDorm) {
              setOwnerDormId(data.dorm.id);
              fetchRooms(data.dorm.id);
            } else {
              setLoading(false);
            }
          } catch (err) {
            console.error('[Rooms] Init error:', err);
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
    const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
    const method = editingRoom ? 'PUT' : 'POST';

    // Stringify images array for storage in the image_url column
    const payload = {
      ...formData,
      image_url: JSON.stringify(formData.images),
      dorm_id: ownerDormId
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingRoom(null);
        setFormData({ room_number: '', room_type: 'Standard', price: 4500, floor: 1, status: 'Available', images: [] });
        if (ownerDormId) fetchRooms(ownerDormId);
      } else {
        alert(`${data.message}${data.error ? `: ${data.error}` : ''}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    
    // Parse images from the stringified array
    let parsedImages = [];
    try {
      if (room.image_url) {
        if (room.image_url.startsWith('[')) {
          parsedImages = JSON.parse(room.image_url);
        } else {
          parsedImages = [room.image_url]; // legacy single image support
        }
      }
    } catch (e) {
      parsedImages = [room.image_url];
    }

    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      price: room.price,
      floor: room.floor,
      status: room.status,
      images: parsedImages
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบห้องพักนี้?')) return;
    try {
      await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      if (ownerDormId) fetchRooms(ownerDormId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getFirstImage = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return null;
    try {
      if (imageUrl.startsWith('[')) {
        const parsed = JSON.parse(imageUrl);
        return parsed[0] || null;
      }
      return imageUrl;
    } catch (e) {
      return imageUrl;
    }
  };

  const getImageCount = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return 0;
    try {
      if (imageUrl.startsWith('[')) {
        return JSON.parse(imageUrl).length;
      }
      return 1;
    } catch (e) {
      return 1;
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          room.room_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || room.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'Available').length,
    occupied: rooms.filter(r => r.status === 'Occupied' || r.status === 'มีผู้เช่า').length,
    maintenance: rooms.filter(r => r.status === 'Maintenance' || r.status === 'ปิดปรับปรุง').length,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FDFBF7]">
      {/* Header */}
      <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0 z-10 shadow-sm transition-all duration-300">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#8B7355] rounded-full" />
            <h1 className="text-2xl font-black text-[#3E342B] tracking-tight">จัดการห้องพัก</h1>
          </div>
          <p className="text-sm font-bold text-[#A08D74] uppercase tracking-wide ml-3.5 mt-0.5 opacity-80">
            SmartDom Asset & Unit Management
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="ค้นหาเลขห้อง หรือ ประเภท..." 
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
            onClick={() => { setEditingRoom(null); setFormData({ room_number: '', room_type: 'Standard', price: 4500, floor: 1, status: 'Available', images: [] }); setIsModalOpen(true); }}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 transition-all duration-300 group ${
              !ownerDormId 
              ? 'bg-[#E5DFD3] text-[#A08D74] cursor-not-allowed opacity-50' 
              : 'bg-[#3E342B] text-white shadow-[#3E342B]/20 hover:-translate-y-1 active:scale-95'
            }`}
          >
            <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </div>
            {ownerDormId ? 'เพิ่มห้องพัก' : 'กำลังเตรียมข้อมูล...'}
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="px-10 py-8 grid grid-cols-4 gap-6 shrink-0 bg-gradient-to-b from-white/40 to-transparent">
        {[
          { label: 'ยูนิตทั้งหมด', val: stats.total, color: 'bg-[#8B7355]', icon: '🏢' },
          { label: 'ห้องว่าง', val: stats.available, color: 'bg-emerald-500', icon: '✨' },
          { label: 'มีผู้เช่าแล้ว', val: stats.occupied, color: 'bg-blue-500', icon: '🔑' },
          { label: 'รอตรวจสภาพ', val: stats.maintenance, color: 'bg-amber-500', icon: '🛠️' },
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

      {/* Filter Section */}
      <div className="px-10 mb-2 flex items-center gap-6 shrink-0">
        <div className="flex bg-[#F3EFE9] p-1 rounded-2xl border border-[#E5DFD3]">
          {['All', 'Available', 'Occupied', 'Maintenance'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                filterStatus === s 
                ? 'bg-white text-[#3E342B] shadow-sm ring-1 ring-[#DCD3C6]' 
                : 'text-[#A08D74] hover:text-[#5A4D41]'
              }`}
            >
              {s === 'All' ? 'ทั้งหมด' : s === 'Available' ? 'ว่าง' : s === 'Occupied' ? 'มีผู้เช่า' : 'ปิดซ่อม'}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-[#E5DFD3]" />
        <p className="text-xs font-bold text-[#A08D74]">
          แสดง <span className="text-[#3E342B]">{filteredRooms.length}</span> จาก <span className="text-[#3E342B]">{rooms.length}</span> ห้อง
        </p>
      </div>

      {/* Room Grid */}
      <div className="flex-1 overflow-y-auto px-10 py-6 scroll-smooth custom-scrollbar">
        {dormError && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl mb-8 flex items-center gap-4 text-rose-600">
             <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center font-black">!</div>
             <div>
                <p className="font-bold text-sm">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
                <p className="text-xs opacity-80">{dormError}</p>
             </div>
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white h-[380px] rounded-[40px] border border-[#E5DFD3] animate-pulse flex flex-col p-6">
                <div className="bg-[#F3EFE9] h-48 rounded-3xl mb-6" />
                <div className="h-6 bg-[#F3EFE9] w-2/3 rounded-lg mb-4" />
                <div className="h-4 bg-[#F3EFE9] w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-24 h-24 bg-[#F3EFE9] rounded-full flex items-center justify-center text-2xl mb-6">🔍</div>
            <h3 className="text-xl font-black text-[#3E342B] mb-2 text-balance">ไม่พบข้อมูลห้องพักที่คุณต้องการ</h3>
            <p className="text-[#A08D74] text-sm font-medium">ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มห้องพักใหม่ในระบบ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
            {filteredRooms.map((room) => {
              const firstImage = getFirstImage(room.image_url);
              const extraCount = getImageCount(room.image_url) - 1;

              return (
              <div 
                key={room.id} 
                className="bg-white rounded-[40px] border border-[#E5DFD3] shadow-md shadow-[#DCD3C6]/10 overflow-hidden group hover:shadow-2xl hover:border-[#8B7355] hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                {/* Image Placeholder / Real Image */}
                <div className="relative h-56 w-full bg-[#FAF8F5] overflow-hidden">
                   {firstImage ? (
                     <>
                       <Image src={firstImage} alt={room.room_number} fill unoptimized className="object-cover group-hover:scale-110 transition-transform duration-700" />
                       {extraCount > 0 && (
                         <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-sm font-black px-2 py-1 rounded-lg">
                            +{extraCount} รูป
                         </div>
                       )}
                     </>
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                        <svg className="w-16 h-16 text-[#8B7355] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-sm font-black uppercase tracking-wider text-[#8B7355]">SMARTDOM UNIT</span>
                     </div>
                   )}
                   <div className="absolute top-4 left-4 bg-[#3E342B] text-white px-4 py-2 rounded-2xl text-sm font-black shadow-lg z-10">
                      ห้อง {room.room_number}
                   </div>
                   <div className={`absolute top-4 right-4 px-4 py-2 rounded-2xl text-sm font-black uppercase tracking-wider border backdrop-blur-md shadow-xl z-10 ${
                     room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                     room.status === 'Occupied' || room.status === 'มีผู้เช่า' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                   }`}>
                      {room.status === 'Available' ? 'ว่าง' : room.status === 'Occupied' || room.status === 'มีผู้เช่า' ? 'มีผู้เช่าแล้ว' : 'ปิดปรับปรุง'}
                   </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-[#A08D74] uppercase tracking-wide">{room.room_type} (Type)</span>
                      <span className="text-sm font-black text-[#A08D74] uppercase tracking-wide">ชั้น {room.floor} (Floor)</span>
                   </div>
                   <div className="flex items-end gap-1 mb-8">
                      <span className="text-3xl font-black text-[#3E342B]">฿{Number(room.price).toLocaleString()}</span>
                      <span className="text-xs font-bold text-[#A08D74] mb-1.5 whitespace-nowrap">/ เดือน</span>
                   </div>

                   <div className="mt-auto flex items-center gap-3 pt-6 border-t border-[#F3EFE9]">
                      <button 
                        onClick={() => handleEdit(room)}
                        className="flex-1 bg-[#FAF8F5] text-[#8B7355] py-3.5 rounded-2xl text-xs font-bold border border-[#E5DFD3] hover:bg-[#8B7355] hover:text-white hover:border-[#8B7355] hover:shadow-lg hover:shadow-[#8B7355]/20 transition-all active:scale-95"
                      >
                         แก้ไขข้อมูล
                      </button>
                      <button 
                        onClick={() => handleDelete(room.id)}
                        className="p-3.5 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group/del"
                      >
                         <svg className="w-5 h-5 group-hover/del:scale-125 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* CRUD Modal - Premium Redesign */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom duration-500 border border-[#8B7355]/20 max-h-[90vh] flex flex-col">
             <div className="bg-[#3E342B] px-10 py-10 text-white relative overflow-hidden shrink-0">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#8B7355] rounded-full blur-[100px] opacity-20" />
                <div className="relative z-10 text-center">
                  <h2 className="text-3xl font-black mb-1 tracking-tight">{editingRoom ? 'แก้ไขข้อมูลยูนิต' : 'เพิ่มยูนิตใหม่'}</h2>
                  <p className="text-white/40 text-xs font-black uppercase tracking-wider font-display font-medium">SMARTDOM PREMIUM REAL ESTATE</p>
                </div>
             </div>
             
             <div className="overflow-y-auto p-10 custom-scrollbar">
               <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">หมายเลขห้อง</label>
                        <input 
                          type="text" 
                          required
                          value={formData.room_number}
                          onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                          className="w-full px-6 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-[24px] focus:ring-4 focus:ring-[#8B7355]/10 focus:border-[#8B7355] focus:bg-white outline-none font-black text-[#3E342B] text-lg transition-all"
                          placeholder="101"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">ประเภท (Type)</label>
                        <select 
                            value={formData.room_type}
                            onChange={(e) => setFormData({...formData, room_type: e.target.value})}
                            className="w-full px-6 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-[24px] font-black outline-none text-[#3E342B] transition-all focus:bg-white cursor-pointer"
                        >
                            <option>Standard</option>
                            <option>Deluxe</option>
                            <option>Premium</option>
                            <option>Suite</option>
                        </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">ชั้น (Floor)</label>
                        <input 
                            type="number" 
                            value={formData.floor}
                            onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                            className="w-full px-6 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-[24px] font-black outline-none text-[#3E342B] focus:bg-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">สถานะ (Status)</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="w-full px-6 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-[24px] font-black outline-none text-[#3E342B] focus:bg-white cursor-pointer"
                        >
                            <option value="Available">ว่าง (Available)</option>
                            <option value="Occupied">มีผู้เช่า (Occupied)</option>
                            <option value="Maintenance">ปิดปรับปรุง (Maintenance)</option>
                        </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1 text-center">ราคาเช่ารายเดือน (Rental Price)</label>
                    <div className="relative group max-w-xs mx-auto">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-[#8B7355] group-focus-within:scale-110 transition-transform">฿</span>
                        <input 
                          type="number" 
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                          className="w-full pl-14 pr-6 py-5 bg-[#F3EFE9] border border-[#8B7355]/30 rounded-[30px] font-black outline-none text-[#3E342B] text-3xl text-center focus:ring-8 focus:ring-[#8B7355]/5 focus:bg-white transition-all"
                        />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">รูปภาพห้องพัก (Gallery - หลายรูป)</label>
                    
                    <div className="grid grid-cols-3 gap-4">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[#E5DFD3] group/img shadow-sm hover:border-[#8B7355] transition-all">
                              <Image src={img} alt={`Preview ${idx}`} fill unoptimized className="object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg scale-90"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                          </div>
                        ))}
                        
                        <label className="aspect-square rounded-2xl border-2 border-dashed border-[#E5DFD3] bg-[#FAF8F5] flex flex-col items-center justify-center cursor-pointer hover:border-[#8B7355] hover:bg-white transition-all group">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-6 h-6 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <span className="text-xs font-black text-[#8B7355] uppercase tracking-wider">เพิ่มรูป</span>
                            <input 
                                type="file" 
                                accept="image/*"
                                multiple
                                className="hidden" 
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-6 sr-only-btn-container shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)} 
                      className="flex-1 py-5 text-[#A08D74] font-black hover:bg-[#FAF8F5] rounded-[28px] transition-all"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="submit" 
                      className="flex-[2] py-5 bg-[#3E342B] text-white font-black rounded-[28px] shadow-2xl shadow-[#3E342B]/30 hover:-translate-y-1 active:scale-95 transition-all"
                    >
                        {editingRoom ? 'อัปเดตข้อมูล' : 'บันทึกลงฐานข้อมูล'}
                    </button>
                  </div>
               </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
