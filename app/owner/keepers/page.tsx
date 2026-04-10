'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Keeper {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  position: string;
  dorm_id: number;
}

export default function KeepersManagement() {
  const router = useRouter();
  const [keepers, setKeepers] = useState<Keeper[]>([]);
  const [loading, setLoading] = useState(true);
  const [dormId, setDormId] = useState<number | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKeeper, setEditingKeeper] = useState<Keeper | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Maid',
    password: '',
  });


  useEffect(() => {
    const fetchDormData = async () => {
      const email = localStorage.getItem('userEmail') || 'owner@smartdom.com';
      try {
        const res = await fetch(`/api/owner/onboarding?email=${email}`);
        const data = await res.json();
        if (data.success && data.hasDorm) {
          setDormId(data.dorm.id);
          fetchKeepers(data.dorm.id);
        } else {
          router.push('/owner/onboarding');
        }
      } catch (err) {
        console.error('Error fetching dorm data:', err);
      }
    };
    fetchDormData();
  }, [router]);

  const fetchKeepers = async (id: number) => {
    try {
      const res = await fetch(`/api/keepers?dormId=${id}`);
      const data = await res.json();
      if (data.success) {
        setKeepers(data.data);
      }
    } catch (err) {
      console.error('Error fetching keepers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (keeper: Keeper | null = null) => {
    if (keeper) {
      setEditingKeeper(keeper);
      setFormData({
        name: keeper.name,
        email: keeper.email || '',
        phone: keeper.phone || '',
        position: keeper.position,
        password: '',
      });
    } else {
      setEditingKeeper(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: 'Maid',
        password: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dormId) return;

    const url = '/api/keepers';
    const method = editingKeeper ? 'PUT' : 'POST';
    const body = editingKeeper 
      ? { ...formData, id: editingKeeper.id } 
      : { ...formData, dorm_id: dormId };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchKeepers(dormId);
      }
    } catch (err) {
      console.error('Error saving keeper:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบรายชื่อเจ้าหน้าที่?')) return;
    try {
      const res = await fetch(`/api/keepers?id=${id}`, { method: 'DELETE' });
      if (res.ok && dormId) {
        fetchKeepers(dormId);
      }
    } catch (err) {
      console.error('Error deleting keeper:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 text-[#3E342B]">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black mb-2">จัดการเจ้าหน้าที่</h1>
            <p className="text-[#A08D74] font-medium">เพิ่ม แก้ไข และลบข้อมูลแม่บ้านหรือช่างประจำหอพัก</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-[#8B7355] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#8B7355]/20 hover:bg-[#725724] transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มเจ้าหน้าที่
          </button>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-[#FAF8F5] rounded-3xl animate-pulse" />)}
          </div>
        ) : keepers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-[#E5DFD3]">
            <p className="text-[#A08D74] font-bold">ยังไม่มีข้อมูลเจ้าหน้าที่ในระบบ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keepers.map((keeper) => (
              <div key={keeper.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-[#E5DFD3] hover:shadow-xl hover:shadow-[#DCD3C6]/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${keeper.position === 'Maid' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                    {keeper.position === 'Maid' ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(keeper)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(keeper.id)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black">{keeper.name}</h3>
                    <p className="text-xs font-bold text-[#A08D74] uppercase tracking-wider">{keeper.position === 'Maid' ? 'แม่บ้าน' : 'ช่างประจำหอ'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-[#5A4D41]">
                      <svg className="w-4 h-4 text-[#A08D74]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {keeper.email || 'ไม่มีข้อมูลอีเมล'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#5A4D41]">
                      <svg className="w-4 h-4 text-[#A08D74]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 .948.684V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {keeper.phone || 'ไม่มีข้อมูลติดต่อ'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tooltip */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl border border-[#E5DFD3] overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10">
              <h2 className="text-2xl font-black mb-6">{editingKeeper ? 'แก้ไขข้อมูลเจ้าหน้าที่' : 'เพิ่มเจ้าหน้าที่ใหม่'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#A08D74]">ชื่อ-นามสกุล</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] outline-none"
                    placeholder="เช่น สมศรี รักสบาย"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#A08D74]">เบอร์โทรศัพท์</label>
                    <input 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] outline-none"
                      placeholder="081-XXX-XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#A08D74]">ตำแหน่ง</label>
                    <select 
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] outline-none"
                    >
                      <option value="Maid">แม่บ้าน (Maid)</option>
                      <option value="Technician">ช่างเทคนิค (Technician)</option>
                    </select>
                  </div>
                </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[#A08D74]">อีเมล (ใช้เป็น Username)</label>
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] outline-none"
                      placeholder="email@example.com"
                    />
                  </div>

                  {!editingKeeper && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#A08D74]">รหัสผ่านสำหรับเจ้าหน้าที่</label>
                      <input 
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] outline-none"
                        placeholder="••••••••"
                      />
                      <p className="text-[9px] text-[#A08D74] ml-1">* เจ้าหน้าที่สามารถใช้ Email และรหัสผ่านนี้ล็อกอินเข้าสู่ระบบได้</p>
                    </div>
                  )}


                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-[#FAF8F5] text-[#A08D74] rounded-2xl font-bold hover:bg-[#E5DFD3] transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-[#3E342B] text-white rounded-2xl font-bold shadow-lg hover:-translate-y-1 transition-all"
                  >
                    {editingKeeper ? 'บันทึกการแก้ไข' : 'เพิ่มเจ้าหน้าที่'}
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
