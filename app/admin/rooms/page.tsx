'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminSidebar from '../components/AdminSidebar';

interface Room {
  id: number;
  room_number: string;
  room_type: string;
  price: number;
  status: string;
  floor: number;
  image_url: string | null;
  tenant_id: number | null;
  tenant_name: string | null;
  created_at: string;
}

interface Tenant {
  id: number;
  name: string;
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Standard');
  const [price, setPrice] = useState('');
  const [floor, setFloor] = useState('1');
  const [status, setStatus] = useState('ว่าง');
  const [imageUrl, setImageUrl] = useState('');
  const [tenantId, setTenantId] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch {
      console.error('Error fetching rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants');
      const data = await res.json();
      if (data.success) {
        setTenants(data.data);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter;
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    return matchesSearch && matchesFloor && matchesStatus;
  });

  const uniqueFloors = Array.from(new Set(rooms.map(room => room.floor.toString()))).sort((a, b) => parseInt(a) - parseInt(b));

  useEffect(() => {
    fetchRooms();
    fetchTenants();
  }, []);

  const resetForm = () => {
    setRoomNumber('');
    setPrice('');
    setRoomType('Standard');
    setFloor('1');
    setStatus('ว่าง');
    setImageUrl('');
    setTenantId('');
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setRoomNumber(room.room_number);
    setRoomType(room.room_type);
    setPrice(room.price.toString());
    setFloor(room.floor.toString());
    setStatus(room.status);
    setImageUrl(room.image_url || '');
    setTenantId(room.tenant_id?.toString() || '');
    setEditingId(room.id);
    setIsModalOpen(true);
    setFeedback({ message: '', type: '' });
  };

  const handleDeleteRoom = async (id: number, roomNum: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบห้องพัก ${roomNum}?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setRooms(rooms.filter(r => r.id !== id));
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการลบห้องพัก');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.url);
      } else {
        alert(data.message || 'อัปโหลดล้มเหลว');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ message: 'กำลังบันทึกข้อมูล...', type: 'info' });
    
    const payload = {
      room_number: roomNumber,
      room_type: roomType,
      price: parseFloat(price),
      floor: parseInt(floor),
      status,
      image_url: imageUrl || null,
      tenant_id: status === 'มีผู้เช่า' ? (tenantId ? parseInt(tenantId) : null) : null
    };

    try {
      const url = editingId ? `/api/rooms/${editingId}` : '/api/rooms';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setFeedback({ message: `ห้องพักถูก${editingId ? 'แก้ไข' : 'สร้าง'}เรียบร้อยแล้ว!`, type: 'success' });
        setIsModalOpen(false);
        fetchRooms();
        resetForm();
      } else {
        setFeedback({ message: data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Available' || status === 'ว่าง') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'Occupied' || status === 'มีผู้เช่า') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'Reserved' || status === 'ติดจอง') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'Maintenance' || status === 'ปิดปรับปรุง') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getDisplayStatus = (status: string) => {
    if (status === 'Available') return 'ว่าง';
    if (status === 'Occupied') return 'มีผู้เช่า';
    if (status === 'Reserved') return 'ติดจอง';
    if (status === 'Maintenance') return 'ปิดปรับปรุง';
    return status;
  };
  
  const getDisplayRoomType = (type: string) => {
    if (type === 'Standard') return 'มาตรฐาน (Standard)';
    if (type === 'Premium') return 'พรีเมียม (Premium)';
    if (type === 'Suite') return 'สวีท (Suite)';
    if (type === 'Economy') return 'ห้องประหยัด (Economy)';
    return type;
  };

  const getFirstImage = (imageParam: string | null) => {
    if (!imageParam) return null;
    try {
      if (imageParam.startsWith('[') && imageParam.endsWith(']')) {
        const images = JSON.parse(imageParam);
        return images[0] || null;
      }
      return imageParam;
    } catch (e) {
      return imageParam;
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-[#3E342B]">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[#3E342B]">จัดการห้องพัก</h1>
            <p className="text-[10px] text-[#A08D74] font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Room Management System</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={openAddModal}
              className="bg-[#8B7355] hover:bg-[#7A6348] text-white font-bold px-5 py-2.5 rounded-full transition-all text-sm flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              เพิ่มห้องพัก
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#E5DFD3] shadow-sm">
              <Image width={40} height={40} src="https://ui-avatars.com/api/?name=Admin&background=8B7355&color=fff" alt="แอดมิน" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-5 rounded-3xl border border-[#E5DFD3] shadow-sm">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A08D74]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  placeholder="ค้นหาเลขห้อง..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] text-sm font-bold focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-all"
                />
              </div>
              <div className="flex gap-4">
                <select 
                  value={floorFilter}
                  onChange={(e) => setFloorFilter(e.target.value)}
                  className="rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-5 py-3 text-sm font-bold focus:border-[#8B7355] outline-none min-w-[120px]"
                >
                  <option value="all">ทุกชั้น</option>
                  {uniqueFloors.map(f => <option key={f} value={f}>ชั้น {f}</option>)}
                </select>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-5 py-3 text-sm font-bold focus:border-[#8B7355] outline-none min-w-[140px]"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="ว่าง">ว่าง</option>
                  <option value="มีผู้เช่า">มีผู้เช่า</option>
                  <option value="ติดจอง">ติดจอง</option>
                  <option value="ปิดปรับปรุง">ปิดปรับปรุง</option>
                </select>
              </div>
            </div>
            
            {/* Feedback Message */}
            {feedback.message && !isModalOpen && (
               <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm font-bold ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                 <span>{feedback.message}</span>
                 <button onClick={() => setFeedback({message: '', type: ''})} className="opacity-50 hover:opacity-100 text-lg leading-none">✕</button>
               </div>
            )}

            {/* Room List */}
            <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-sm p-6">
              {loading ? (
                <div className="p-12 text-center text-[#A08D74]">
                  <svg className="animate-spin h-8 w-8 text-[#8B7355] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  กำลังโหลดข้อมูล...
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-16 text-center">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <h3 className="font-display text-xl font-bold text-[#3E342B] mb-2">ไม่พบห้องที่คุณต้องการ</h3>
                  <p className="text-[#A08D74] mb-6 max-w-md mx-auto font-medium">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
                  <button onClick={() => {setSearchTerm(''); setFloorFilter('all'); setStatusFilter('all');}} className="text-[#8B7355] font-bold hover:underline">ล้างตัวกรองทั้งหมด</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRooms.map((room) => {
                    const displayImage = getFirstImage(room.image_url);
                    return (
                      <div key={room.id} className="group border border-[#E5DFD3] rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white">
                        <div className="aspect-[4/3] bg-[#FAF8F5] relative overflow-hidden">
                          {displayImage ? (
                            <Image 
                              src={displayImage} 
                              alt={`ห้อง ${room.room_number}`}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#A08D74]">
                              <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <span className="text-xs font-bold uppercase tracking-widest opacity-50">ไม่มีรูปภาพ</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${getStatusColor(room.status)}`}>
                              {getDisplayStatus(room.status)}
                            </span>
                          </div>
                        </div>
                      
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-display text-base font-bold text-[#3E342B]">ห้อง {room.room_number}</h3>
                            <span className="text-sm font-bold text-[#8B7355] bg-[#8B7355]/10 px-2.5 py-0.5 rounded-lg">
                              ฿{Number(room.price).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-[#A08D74] font-bold mb-4">
                            {getDisplayRoomType(room.room_type)} · ชั้น {room.floor}
                          </div>

                          {room.status === 'มีผู้เช่า' && room.tenant_name && (
                            <div className="flex items-center gap-2 mb-4 bg-[#8B7355]/5 p-2 rounded-xl border border-[#8B7355]/10">
                              <div className="w-6 h-6 rounded-full bg-[#8B7355]/20 flex items-center justify-center text-[10px] text-[#8B7355]">👤</div>
                              <span className="text-[11px] font-bold text-[#8B7355] truncate">ผู้เช่า: {room.tenant_name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 pt-4 border-t border-[#F3EFE9]">
                            <button 
                              onClick={() => openEditModal(room)}
                              className="flex-1 py-2 text-xs font-bold text-[#3E342B] bg-[#FAF8F5] hover:bg-[#F3EFE9] rounded-xl transition-colors"
                            >
                              แก้ไข
                            </button>
                            <button 
                              onClick={() => handleDeleteRoom(room.id, room.room_number)}
                              className="flex-1 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                            >
                              ลบ
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* เพิ่ม/แก้ไขห้องพัก Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#E5DFD3]">
            <div className="px-8 py-6 border-b border-[#E5DFD3] flex justify-between items-center">
              <h2 className="font-display text-xl font-bold text-[#3E342B]">{editingId ? 'แก้ไขข้อมูลห้องพัก' : 'เพิ่มห้องพักใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A08D74] hover:text-[#3E342B] transition-colors bg-[#FAF8F5] hover:bg-[#F3EFE9] p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveRoom} className="p-8 space-y-5">
              {feedback.message && feedback.type === 'error' && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm font-bold">
                  {feedback.message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#8B7355] mb-2">หมายเลขห้อง</label>
                  <input 
                    type="text" 
                    required 
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-5 py-3.5 text-sm font-bold focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-all placeholder:text-[#A08D74]/40"
                    placeholder="เช่น 101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#8B7355] mb-2">ชั้นที่</label>
                  <input 
                    type="number" 
                    required 
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-5 py-3.5 text-sm font-bold focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-all"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B7355] mb-2">ประเภทห้อง</label>
                <select 
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-5 py-3.5 text-sm font-bold focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-all"
                >
                  <option value="Standard">มาตรฐาน (Standard)</option>
                  <option value="Premium">พรีเมียม (Premium)</option>
                  <option value="Suite">สวีท (Suite)</option>
                  <option value="Economy">ห้องประหยัด (Economy)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#8B7355] mb-2">ราคาเช่า/เดือน (บาท)</label>
                  <input 
                    type="number" 
                    required 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-5 py-3.5 text-sm font-bold focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-all placeholder:text-[#A08D74]/40"
                    placeholder="4500"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#8B7355] mb-2">สถานะ</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-5 py-3.5 text-sm font-bold focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-all"
                  >
                    <option value="ว่าง">ว่าง</option>
                    <option value="ติดจอง">ติดจอง</option>
                    <option value="มีผู้เช่า">มีผู้เช่า</option>
                    <option value="ปิดปรับปรุง">ปิดปรับปรุง</option>
                  </select>
                </div>
              </div>

              {status === 'มีผู้เช่า' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#8B7355] mb-2">ระบุผู้เช่า</label>
                  <select 
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-5 py-3.5 text-sm font-bold focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-all"
                  >
                    <option value="">-- เลือกผู้เช่า --</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#8B7355] mb-2">รูปภาพห้องพัก</label>
                <div className="flex flex-col gap-4">
                  {imageUrl && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#E5DFD3] group">
                      <img src={imageUrl} alt="Room preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="room-image-upload"
                    />
                    <label 
                      htmlFor="room-image-upload"
                      className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                        uploading ? 'border-[#8B7355] bg-[#8B7355]/5 opacity-50' : 'border-[#E5DFD3] hover:border-[#8B7355]/50 hover:bg-[#8B7355]/5'
                      }`}
                    >
                      {uploading ? (
                        <svg className="animate-spin h-6 w-6 text-[#8B7355]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-[#A08D74] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-xs font-bold text-[#A08D74] uppercase tracking-widest">อัปโหลดรูปภาพ</span>
                          <span className="text-[10px] text-[#A08D74]/60 mt-1 uppercase tracking-tight">PNG, JPG, WEBP (สูงสุด 5MB)</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-full font-bold text-sm text-[#A08D74] hover:bg-[#FAF8F5] transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-full font-bold text-sm bg-[#8B7355] hover:bg-[#7A6348] text-white shadow-lg shadow-[#8B7355]/20 transition-all active:scale-[0.98]"
                >
                  {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มห้องพัก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
