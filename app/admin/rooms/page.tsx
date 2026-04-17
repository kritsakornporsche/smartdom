'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '../components/AdminSidebar';

interface Room {
  id: number;
  room_number: string;
  room_type: string;
  price: number;
  status: string;
  floor: number;
  image_url: string | null;
  images: string[];
  amenities: string[];
  created_at: string;
}

const AMENITIES_LIST = [
  { id: 'wifi', label: 'Wifi', icon: '📶' },
  { id: 'ac', label: 'แอร์', icon: '❄️' },
  { id: 'tv', label: 'ทีวี', icon: '📺' },
  { id: 'fridge', label: 'ตู้เย็น', icon: '🧊' },
  { id: 'parking', label: 'ที่จอดรถ', icon: '🚗' },
];

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Standard');
  const [price, setPrice] = useState('');
  const [floor, setFloor] = useState('1');
  const [status, setStatus] = useState('ว่าง');
  const [imageUrl, setImageUrl] = useState('');
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
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
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const resetForm = () => {
    setRoomNumber('');
    setPrice('');
    setRoomType('Standard');
    setFloor('1');
    setStatus('ว่าง');
    setImageUrl('');
    setExtraImages([]);
    setSelectedAmenities([]);
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
    setExtraImages(room.images || []);
    setSelectedAmenities(room.amenities || []);
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
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
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
      images: extraImages,
      amenities: selectedAmenities
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
    } catch (err) {
      setFeedback({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย', type: 'error' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'extra', index?: number) => {
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
        if (target === 'main') {
          setImageUrl(data.url);
        } else if (target === 'extra' && index !== undefined) {
          const newExtras = [...extraImages];
          newExtras[index] = data.url;
          setExtraImages(newExtras.filter(url => url !== ''));
        }
      } else {
        alert(data.message || 'อัปโหลดล้มเหลว');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
    }
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const filteredRooms = (rooms || []).filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter;
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    return matchesSearch && matchesFloor && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    // English mapping fallback for backwards compat if data was entered in English
    if (status === 'Available' || status === 'ว่าง') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'Occupied' || status === 'มีผู้เช่า') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'Maintenance' || status === 'ปิดปรับปรุง') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getDisplayStatus = (status: string) => {
    if (status === 'Available') return 'ว่าง';
    if (status === 'Occupied') return 'มีผู้เช่า';
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

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-background border-b border-border flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">จัดการห้องพัก</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">เพิ่ม แก้ไข และลบข้อมูลห้องพักในระบบ</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={openAddModal}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-full transition-all text-sm flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              เพิ่มห้องพัก
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-border shadow-sm">
              <img src="https://ui-avatars.com/api/?name=Admin&background=c46a4a&color=fff" alt="แอดมิน" />
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <section className="px-10 py-5 bg-background border-b border-border flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="ค้นหาเลขห้อง..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-accent/30 border border-border rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="bg-accent/30 border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary"
            >
              <option value="all">ทุกชั้น</option>
              {[1, 2, 3, 4, 5].map(f => <option key={f} value={f}>ชั้น {f}</option>)}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-accent/30 border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="ว่าง">ว่าง</option>
              <option value="มีผู้เช่า">มีผู้เช่า</option>
              <option value="ปิดปรับปรุง">ปิดปรับปรุง</option>
            </select>
          </div>
        </section>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Feedback Message */}
            {feedback.message && !isModalOpen && (
               <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                 <span>{feedback.message}</span>
                 <button onClick={() => setFeedback({message: '', type: ''})} className="opacity-50 hover:opacity-100 text-lg leading-none">✕</button>
               </div>
            )}

            {/* Room List */}
            <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
              {loading ? (
                <div className="p-12 text-center text-muted-foreground">
                  <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  กำลังโหลดข้อมูล...
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-16 text-center">
                  <span className="text-6xl mb-4 block">🏢</span>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">ไม่พบข้อมูลห้องพัก</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">ยังไม่มีข้อมูลห้องพักในระบบ เริ่มเพิ่มห้องพักห้องแรกของคุณได้เลย</p>
                  <button onClick={openAddModal} className="bg-primary/10 text-primary hover:bg-primary/20 px-6 py-2.5 rounded-full font-semibold transition-colors text-sm">เพิ่มห้องพักห้องแรก</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRooms.map((room) => (
                    <div key={room.id} className="group border border-border rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white">
                      <div className="aspect-[4/3] bg-accent/20 relative overflow-hidden">
                        {room.image_url ? (
                          <img 
                            src={room.image_url} 
                            alt={`ห้อง ${room.room_number}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-xs font-medium uppercase tracking-widest opacity-50">ไม่มีรูปภาพ</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${getStatusColor(room.status)}`}>
                            {getDisplayStatus(room.status)}
                          </span>
                        </div>
                        {room.images && room.images.length > 0 && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 border border-white/20">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              +{room.images.length}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-display text-base font-semibold text-foreground">ห้อง {room.room_number}</h3>
                          <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
                            ฿{Number(room.price).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground font-medium mb-3">
                          {getDisplayRoomType(room.room_type)} · ชั้น {room.floor}
                        </div>
                        
                        {/* Amenities Icons */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {room.amenities?.map(aId => {
                            const amenity = AMENITIES_LIST.find(a => a.id === aId);
                            return amenity ? (
                              <span key={aId} title={amenity.label} className="w-7 h-7 flex items-center justify-center bg-accent/30 rounded-lg text-xs grayscale hover:grayscale-0 transition-all cursor-default">
                                {amenity.icon}
                              </span>
                            ) : null;
                          })}
                          {(room.amenities?.length || 0) === 0 && (
                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">ไม่มีสิ่งอำนวยความสะดวก</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 pt-4 border-t border-border">
                          <button 
                            onClick={() => openEditModal(room)}
                            className="flex-1 py-2 text-xs font-bold text-foreground bg-accent/40 hover:bg-accent/70 rounded-xl transition-colors"
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
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* เพิ่ม/แก้ไขห้องพัก Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-border">
            <div className="px-8 py-6 border-b border-border flex justify-between items-center">
              <h2 className="font-display text-xl font-semibold text-foreground">{editingId ? 'แก้ไขข้อมูลห้องพัก' : 'เพิ่มห้องพักใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors bg-accent/50 hover:bg-accent p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveRoom} className="p-8 space-y-5">
              {feedback.message && feedback.type === 'error' && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm font-medium">
                  {feedback.message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">หมายเลขห้อง</label>
                  <input 
                    type="text" 
                    required 
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full rounded-2xl border border-border/40 bg-background px-5 py-3.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40"
                    placeholder="เช่น 101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">ชั้นที่</label>
                  <input 
                    type="number" 
                    required 
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full rounded-2xl border border-border/40 bg-background px-5 py-3.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">ประเภทห้อง</label>
                <select 
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full rounded-2xl border border-border/40 bg-background px-5 py-3.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="Standard">มาตรฐาน (Standard)</option>
                  <option value="Premium">พรีเมียม (Premium)</option>
                  <option value="Suite">สวีท (Suite)</option>
                  <option value="Economy">ห้องประหยัด (Economy)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">ราคาเช่า/เดือน (บาท)</label>
                  <input 
                    type="number" 
                    required 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-2xl border border-border/40 bg-background px-5 py-3.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40"
                    placeholder="4500"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">สถานะ</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-2xl border border-border/40 bg-background px-5 py-3.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  >
                    <option value="ว่าง">ว่าง</option>
                    <option value="มีผู้เช่า">มีผู้เช่า</option>
                    <option value="ปิดปรับปรุง">ปิดปรับปรุง</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-3">สิ่งอำนวยความสะดวก</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_LIST.map(amenity => (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                          selectedAmenities.includes(amenity.id)
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-accent/30 border-border text-muted-foreground'
                        }`}
                      >
                        <span>{amenity.icon}</span>
                        {amenity.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-3">แกลเลอรี่ภาพ (สูงสุด 4 รูปเสริม)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden bg-accent/10">
                        {extraImages[idx] ? (
                          <>
                            <img src={extraImages[idx]} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => setExtraImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shadow-lg"
                            >✕</button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center">
                            <svg className="w-5 h-5 text-muted-foreground opacity-40 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            <span className="text-[10px] font-black uppercase text-muted-foreground/60">เพิ่มรูป</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'extra', idx)} disabled={uploading} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-3">รูปภาพหลัก</label>
                <div className="relative aspect-[21/9] rounded-3xl border-2 border-dashed border-border bg-accent/10 overflow-hidden group">
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt="Room preview" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label className="cursor-pointer bg-white text-foreground px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                          เปลี่ยนรูป
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'main')} disabled={uploading} />
                        </label>
                        <button type="button" onClick={() => setImageUrl('')} className="bg-rose-500 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                          ลบรูป
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-accent/20 transition-colors">
                      <div className="p-4 bg-primary/10 rounded-2xl mb-3">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">คลิกหรือลากไฟล์เพื่ออัปโหลด</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'main')} disabled={uploading} />
                    </label>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin h-8 w-8 text-primary mb-3 border-4 border-primary border-t-transparent rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">กำลังอัปโหลด...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-full font-bold text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-full font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
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
