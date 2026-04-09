'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OwnerSidebar from '../components/OwnerSidebar';

interface Room {
  id: number;
  room_number: string;
  room_type: string;
  price: number;
  status: string;
  floor: number;
}

export default function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Standard',
    price: 4500,
    floor: 1,
    status: 'Available'
  });

  const [ownerDormId, setOwnerDormId] = useState<number | null>(null);

  const fetchRooms = async (dormId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms?dormId=${dormId}`);
      const data = await res.json();
      if (data.success) setRooms(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Get owner email from localStorage
      const email = localStorage.getItem('userEmail') || 'owner@smartdom.com';
      try {
        const res = await fetch(`/api/owner/onboarding?email=${email}`);
        const data = await res.json();
        if (data.success && data.hasDorm) {
          setOwnerDormId(data.dorm.id);
          fetchRooms(data.dorm.id);
        } else if (data.success && !data.hasDorm) {
          // Redirect if no dorm
          router.push('/owner/onboarding');
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
    const method = editingRoom ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, dorm_id: ownerDormId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingRoom(null);
        setFormData({ room_number: '', room_type: 'Standard', price: 4500, floor: 1, status: 'Available' });
        if (ownerDormId) fetchRooms(ownerDormId);
      } else {

        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      price: room.price,
      floor: room.floor,
      status: room.status
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

  return (
    <div className="flex h-screen bg-[#FDFBF7]">
      <OwnerSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-[#3E342B]">จัดการห้องพัก</h1>
            <p className="text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">เพิ่ม แก้ไข ลบ ข้อมูลห้องพักในหอพักของคุณ</p>
          </div>
          <button 
             onClick={() => { setEditingRoom(null); setFormData({ room_number: '', room_type: 'Standard', price: 4500, floor: 1, status: 'Available' }); setIsModalOpen(true); }}
             className="px-6 py-3 bg-[#8B6A2B] text-white rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-all shadow-[#8B6A2B]/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            เพิ่มห้องพักใหม่
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-6xl mx-auto">
            
            {loading ? (
              <div className="flex items-center justify-center h-64 text-[#A08D74] font-bold">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-[#E5DFD3] shadow-[#DCD3C6]/20">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#FAF8F5] border-b border-[#E5DFD3]">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ห้อง</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ประเภท</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ราคา/เดือน</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ชั้น</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">สถานะ</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3EFE9]">
                    {rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-[#FAF8F5] transition-colors group">
                        <td className="px-8 py-5 font-black text-[#5A4D41] text-lg">{room.room_number}</td>
                        <td className="px-8 py-5">
                           <span className="px-3 py-1 bg-[#F3EFE9] text-[#8B7355] rounded-lg text-xs font-bold border border-[#DCD3C6]">{room.room_type}</span>
                        </td>
                        <td className="px-8 py-5 font-bold text-[#5A4D41]">฿{Number(room.price).toLocaleString()}</td>
                        <td className="px-8 py-5 text-[#A08D74] font-medium">ชั้น {room.floor}</td>
                         <td className="px-8 py-5">
                            <span className={`flex items-center gap-1.5 text-xs font-bold ${room.status === 'Available' ? 'text-emerald-600' : room.status === 'Reserved' || room.status === 'ติดจอง' ? 'text-amber-500' : 'text-blue-600'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'Available' ? 'bg-emerald-500' : room.status === 'Reserved' || room.status === 'ติดจอง' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                              {room.status === 'Available' ? 'ว่าง' : room.status === 'Reserved' || room.status === 'ติดจอง' ? 'ติดจอง' : 'มีผู้เช่า'}
                            </span>
                         </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(room)} className="p-2 text-[#8B7355] hover:bg-[#F3EFE9] rounded-lg transition-colors">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button onClick={() => handleDelete(room.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-[#E5DFD3]">
              <div className="bg-[#3E342B] p-8 text-white">
                 <h2 className="text-2xl font-black">{editingRoom ? 'แก้ไขห้องพัก' : 'เพิ่มห้องพักใหม่'}</h2>
                 <p className="text-white/50 text-xs mt-1 font-bold italic tracking-wide">SMARTDOM PREMIUM PREVIEW</p>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-bold text-[#A08D74] uppercase mb-2">เลขห้อง</label>
                    <input 
                       type="text" 
                       required
                       value={formData.room_number}
                       onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                       className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl focus:ring-2 focus:ring-[#8B6A2B] outline-none font-bold text-[#5A4D41]"
                       placeholder="เช่น 101"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-[#A08D74] uppercase mb-2">ประเภท</label>
                        <select 
                           value={formData.room_type}
                           onChange={(e) => setFormData({...formData, room_type: e.target.value})}
                           className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl font-bold outline-none text-[#5A4D41]"
                        >
                           <option>Standard</option>
                           <option>Deluxe</option>
                           <option>Suite</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[#A08D74] uppercase mb-2">ชั้น</label>
                        <input 
                           type="number" 
                           value={formData.floor}
                           onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                           className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl font-bold outline-none text-[#5A4D41]"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-[#A08D74] uppercase mb-2">ราคาเช่ารายเดือน</label>
                    <input 
                       type="number" 
                       required
                       value={formData.price}
                       onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                       className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl font-bold outline-none text-[#8B6A2B] text-xl"
                    />
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[#A08D74] font-bold hover:bg-[#FAF8F5] rounded-2xl transition-all">ยกเลิก</button>
                    <button type="submit" className="flex-1 py-4 bg-[#8B6A2B] text-white font-bold rounded-2xl shadow-lg shadow-[#8B6A2B]/20 hover:scale-105 transition-all">
                       {editingRoom ? 'อัปเดตข้อมูล' : 'ยืนยันเพิ่มห้อง'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
