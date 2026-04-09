'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Room {
  id: number;
  room_number: string;
  room_type: string;
  price: number;
  status: string;
  floor: number;
  image_url: string | null;
  created_at: string;
}

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
      image_url: imageUrl || null
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
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">SmartDom</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">เมนูการจัดการ</div>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            ภาพรวมระบบ (Dashboard)
          </Link>
          <Link href="/admin/tenants" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            ผู้เช่า (Tenants)
          </Link>
          <Link href="/admin/rooms" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            ห้องพัก (Rooms)
          </Link>
          <Link href="/admin/billing" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ข้อมูลการเงิน (Billing)
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold">จัดการห้องพัก (Room Management)</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={openAddModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              เพิ่มห้องพัก
            </button>
            <div className="h-10 w-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden mix-blend-multiply">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="แอดมิน" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Feedback Message */}
            {feedback.message && !isModalOpen && (
               <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                 <span>{feedback.message}</span>
                 <button onClick={() => setFeedback({message: '', type: ''})} className="opacity-50 hover:opacity-100">✕</button>
               </div>
            )}

            {/* Room List grid layout (Card style to show image nicely) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  กำลังโหลดข้อมูล...
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-16 text-center">
                  <span className="text-6xl mb-4 block">🏢</span>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">ไม่พบข้อมูลห้องพัก</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">ดูเหมือนว่าคุณยังไม่ได้เพิ่มข้อมูลห้องพักลงในระบบ เริ่มตั้งค่าห้องแรกของคุณได้เลย</p>
                  <button onClick={openAddModal} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-6 py-2.5 rounded-xl font-semibold transition-colors">เพิ่มห้องพักห้องแรก</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {rooms.map((room) => (
                    <div key={room.id} className="group border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white">
                      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                        {room.image_url ? (
                          <img 
                            src={room.image_url} 
                            alt={`ห้อง ${room.room_number}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-xs font-medium uppercase tracking-widest opacity-60">ไม่มีรูปภาพ</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${getStatusColor(room.status)}`}>
                            {getDisplayStatus(room.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5 relative">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-bold text-slate-800">ห้อง {room.room_number}</h3>
                          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100/50">
                            ฿{Number(room.price).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 font-medium mb-4">
                          {getDisplayRoomType(room.room_type)} • ชั้น {room.floor}
                        </div>
                        
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                          <button 
                            onClick={() => openEditModal(room)}
                            className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            แก้ไข
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.id, room.room_number)}
                            className="flex-1 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200/50"
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

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'แก้ไขข้อมูลห้องพัก' : 'เพิ่มห้องพักใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveRoom} className="p-8">
              {feedback.message && feedback.type === 'error' && (
                <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-medium">
                  {feedback.message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">หมายเลขห้อง</label>
                  <input 
                    type="text" 
                    required 
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                    placeholder="เช่น 101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">ชั้นที่</label>
                  <input 
                    type="number" 
                    required 
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                    min="1"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 mb-2">ประเภทห้อง</label>
                <select 
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                >
                  <option value="Standard">มาตรฐาน (Standard)</option>
                  <option value="Premium">พรีเมียม (Premium)</option>
                  <option value="Suite">สวีท (Suite)</option>
                  <option value="Economy">ห้องประหยัด (Economy)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">ราคาเช่า/เดือน (บาท)</label>
                  <input 
                    type="number" 
                    required 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                    placeholder="4500"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">สถานะเริ่มต้น</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                  >
                    <option value="ว่าง">ว่าง</option>
                    <option value="มีผู้เช่า">มีผู้เช่า</option>
                    <option value="ปิดปรับปรุง">ปิดปรับปรุง</option>
                  </select>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-500 mb-2">ลิงก์รูปภาพ (Image URL)</label>
                <input 
                  type="url" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all font-medium text-slate-800"
                  placeholder="https://example.com/room-image.jpg"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-medium">เว้นว่างไว้หากไม่มีรูปภาพ คุณสามารถใช้ลิงก์รูปภาพจากเว็บทั่วไปเพื่อแสดงผลได้</p>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
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
