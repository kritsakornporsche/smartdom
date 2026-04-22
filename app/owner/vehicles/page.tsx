'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Vehicle {
  id: number;
  room_number: string;
  owner_name: string;
  license_plate: string;
  province: string;
  vehicle_type: string;
  brand_model: string;
  color: string;
}

export default function VehicleManagement() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerDormId, setOwnerDormId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    room_number: '',
    owner_name: '',
    license_plate: '',
    province: 'กรุงเทพฯ',
    vehicle_type: 'Car',
    brand_model: '',
    color: '',
  });

  const fetchVehicles = async (dormId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/vehicles?dormId=${dormId}`);
      const data = await res.json();
      if (data.success) setVehicles(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      const dormId = (session.user as any).dorm_id;
      if (dormId) {
        setOwnerDormId(dormId);
        fetchVehicles(dormId);
      }
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerDormId) return;

    try {
      const res = await fetch('/api/owner/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, dorm_id: ownerDormId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ room_number: '', owner_name: '', license_plate: '', province: 'กรุงเทพฯ', vehicle_type: 'Car', brand_model: '', color: '' });
        fetchVehicles(ownerDormId);
      }
    } catch (err) {
      alert('Failed to save vehicle');
    }
  };

  const deleteVehicle = async (id: number) => {
    if (!confirm('ยืนยันการลบข้อมูลรถ?')) return;
    try {
      await fetch(`/api/owner/vehicles/${id}`, { method: 'DELETE' });
      if (ownerDormId) fetchVehicles(ownerDormId);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.room_number.includes(searchQuery) || 
    v.license_plate.includes(searchQuery) ||
    v.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FDFBF7]">
      <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-[#8B7355] rounded-full" />
          <h1 className="text-2xl font-black text-[#3E342B] tracking-tight">จัดการข้อมูลรถและที่จอดรถ</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="ค้นหาเลขทะเบียน หรือ เลขห้อง..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-6 pr-6 py-3 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl text-sm font-bold text-[#5A4D41] focus:ring-2 focus:ring-[#8B7355] outline-none w-64"
          />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3.5 bg-[#3E342B] text-white rounded-2xl font-black text-sm shadow-xl hover:-translate-y-1 transition-all"
          >
            ลงทะเบียนรถใหม่
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 scroll-smooth custom-scrollbar">
        {loading ? (
             <div className="grid grid-cols-3 gap-6 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-3xl border border-[#E5DFD3]" />)}
             </div>
        ) : (
            <div className="grid grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-[32px] border border-[#E5DFD3] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 p-4 font-black text-2xl opacity-10 group-hover:opacity-20 transition-opacity ${vehicle.vehicle_type === 'Car' ? 'text-blue-500' : 'text-amber-500'}`}>
                    {vehicle.vehicle_type === 'Car' ? '🚗' : '🏍️'}
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#F3EFE9] rounded-2xl flex flex-col items-center justify-center border border-[#E5DFD3]">
                        <span className="text-sm font-black text-[#A08D74] uppercase tracking-tighter">Room</span>
                        <span className="text-xl font-black text-[#3E342B]">{vehicle.room_number}</span>
                    </div>
                    <div>
                        <h3 className="font-black text-[#3E342B] leading-tight">{vehicle.owner_name}</h3>
                        <p className="text-xs font-bold text-[#A08D74]">{vehicle.brand_model} • {vehicle.color}</p>
                    </div>
                  </div>

                  <div className="bg-[#F3EFE9]/50 rounded-2xl p-4 border border-[#E5DFD3]/50 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-[#A08D74] uppercase tracking-wider">License Plate</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-[#3E342B]">{vehicle.license_plate}</span>
                        <span className="text-sm font-bold text-[#A08D74]">{vehicle.province}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteVehicle(vehicle.id)}
                    className="w-full py-3 text-xs font-black text-rose-400 hover:text-rose-600 border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    ลบข้อมูล
                  </button>
                </div>
              ))}
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl border border-[#8B7355]/20">
             <div className="bg-[#3E342B] p-8 text-white">
                <h2 className="text-2xl font-black">ลงทะเบียนข้อมูลรถ</h2>
                <p className="text-white/40 text-sm font-black uppercase tracking-wide">Vehicle Information System</p>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">เลขห้อง</label>
                        <input type="text" required value={formData.room_number} onChange={(e) => setFormData({...formData, room_number: e.target.value})} className="w-full px-5 py-3.5 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black focus:bg-white outline-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">ชื่อเจ้าของรถ</label>
                        <input type="text" required value={formData.owner_name} onChange={(e) => setFormData({...formData, owner_name: e.target.value})} className="w-full px-5 py-3.5 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black focus:bg-white outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">ทะเบียนรถ</label>
                        <input type="text" required value={formData.license_plate} onChange={(e) => setFormData({...formData, license_plate: e.target.value})} className="w-full px-5 py-3.5 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black focus:bg-white outline-none" placeholder="กข 1234" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">จังหวัด</label>
                        <input type="text" required value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})} className="w-full px-5 py-3.5 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black focus:bg-white outline-none" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">ประเภทรถ</label>
                    <div className="flex gap-2">
                        {['Car', 'Motorcycle'].map(type => (
                            <button key={type} type="button" onClick={() => setFormData({...formData, vehicle_type: type})} className={`flex-1 py-3 rounded-xl border font-black text-xs transition-all ${formData.vehicle_type === type ? 'bg-[#3E342B] text-white border-[#3E342B]' : 'bg-[#F3EFE9] text-[#A08D74] border-[#E5DFD3]'}`}>
                                {type === 'Car' ? '🚗 รถยนต์' : '🏍️ จักรยานยนต์'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">ยี่ห้อ/รุ่น</label>
                        <input type="text" value={formData.brand_model} onChange={(e) => setFormData({...formData, brand_model: e.target.value})} className="w-full px-5 py-3.5 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black focus:bg-white outline-none" placeholder="Honda Civic" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">สีรถ</label>
                        <input type="text" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-full px-5 py-3.5 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black focus:bg-white outline-none" placeholder="สีขาว" />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black text-[#A08D74]">ยกเลิก</button>
                    <button type="submit" className="flex-[2] py-4 bg-[#3E342B] text-white text-xs font-black rounded-2xl shadow-xl shadow-black/10 hover:-translate-y-1 transition-all">บันทึกข้อมูลรถ</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
