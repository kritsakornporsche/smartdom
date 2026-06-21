'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function OwnerSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    tax_id: '',
    water_rate: 18,
    electricity_rate: 8,
    has_wifi: false,
    has_parking: false,
    pet_friendly: false,
    has_lan: false,
    has_air_con: false,
    facilities: '',
    map_url: '',
    description: '',
    cover_image: ''
  });

  const loadSettings = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const email = session.user.email;
      const savedDb = localStorage.getItem('selectedDormDbName');
      if (!savedDb) {
        // Fallback: load onboarding to get the primary db
        const resOnb = await fetch(`/api/owner/onboarding?email=${email}`);
        const dataOnb = await resOnb.json();
        if (dataOnb.success && dataOnb.dormDbName) {
          localStorage.setItem('selectedDormDbName', dataOnb.dormDbName);
          await fetchSettings(email, dataOnb.dormDbName);
        } else {
          setLoading(false);
        }
      } else {
        await fetchSettings(email, savedDb);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchSettings = async (email: string, dbName: string) => {
    try {
      const res = await fetch(`/api/owner/settings?email=${email}&dormDbName=${dbName}`);
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setFormData({
          name: d.name || '',
          address: d.address || '',
          phone: d.phone || '',
          tax_id: d.tax_id || '',
          water_rate: Number(d.water_rate) || 18,
          electricity_rate: Number(d.electricity_rate) || 8,
          has_wifi: Boolean(d.has_wifi),
          has_parking: Boolean(d.has_parking),
          pet_friendly: Boolean(d.pet_friendly),
          has_lan: Boolean(d.has_lan),
          has_air_con: Boolean(d.has_air_con),
          facilities: d.facilities || '',
          map_url: d.map_url || '',
          description: d.description || '',
          cover_image: d.cover_image || ''
        });
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      loadSettings();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;
    
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const email = session.user.email;
      const savedDb = localStorage.getItem('selectedDormDbName');
      
      const res = await fetch('/api/owner/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          dormDbName: savedDb,
          ...formData
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'บันทึกข้อมูลหอพักเรียบร้อยแล้ว' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#080F1E]">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#080F1E]">
      <header className="h-20 bg-[#0F172A]/60 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">ตั้งค่าหอพัก</h1>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Dormitory Profile & Search Settings</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-4xl mx-auto">
          {message.text && (
            <div className={`p-4 mb-6 rounded-2xl font-bold text-sm text-center ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Info */}
            <div className="bg-[#0F172A] border border-white/20 rounded-3xl p-8 space-y-6">
              <h2 className="text-lg font-black text-white border-b border-white/10 pb-4">ข้อมูลทั่วไป (แสดงในหน้าค้นหา)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ชื่อหอพัก / กิจการ</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary"
                    placeholder="เช่น SmartDom Mansion"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary"
                    placeholder="เช่น 02-XXX-XXXX"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ลิงก์รูปภาพหน้าปกหอพัก</label>
                  <input
                    type="text"
                    value={formData.cover_image}
                    onChange={e => setFormData({ ...formData, cover_image: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary"
                    placeholder="เช่น https://images.unsplash.com/... (เว้นว่างไว้สำหรับค่าเริ่มต้น)"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">คำอธิบายรายละเอียดหอพัก (สั้นๆ)</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary resize-none"
                    placeholder="เช่น หอพักระดับพรีเมียม ใกล้มหาวิทยาลัย เดินทางสะดวก สงบ สะอาด..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ที่อยู่หอพัก</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary resize-none"
                    placeholder="ระบุเลขที่ ถนน แขวง เขต..."
                  />
                </div>
              </div>
            </div>

            {/* Rates & Rules */}
            <div className="bg-[#0F172A] border border-white/20 rounded-3xl p-8 space-y-6">
              <h2 className="text-lg font-black text-white border-b border-white/10 pb-4">ค่าน้ำ/ค่าไฟ และข้อมูลกฎหมาย</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ค่าน้ำ (บาท / ยูนิต)</label>
                  <input
                    type="number"
                    value={formData.water_rate}
                    onChange={e => setFormData({ ...formData, water_rate: Number(e.target.value) })}
                    className="w-full bg-[#0F172A] border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ค่าไฟ (บาท / ยูนิต)</label>
                  <input
                    type="number"
                    value={formData.electricity_rate}
                    onChange={e => setFormData({ ...formData, electricity_rate: Number(e.target.value) })}
                    className="w-full bg-[#0F172A] border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">เลขประจำตัวผู้เสียภาษี</label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary"
                    placeholder="เลข 13 หลัก"
                  />
                </div>
              </div>
            </div>

            {/* Features (Checkboxes) */}
            <div className="bg-[#0F172A] border border-white/20 rounded-3xl p-8 space-y-6">
              <h2 className="text-lg font-black text-white border-b border-white/10 pb-4">สิ่งอำนวยความสะดวกและเงื่อนไข (เพื่อการค้นหา)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'has_wifi', label: 'มีอินเทอร์เน็ต WiFi 📶' },
                  { key: 'has_parking', label: 'มีที่จอดรถยนต์ 🚗' },
                  { key: 'pet_friendly', label: 'อนุญาตให้เลี้ยงแมว/สัตว์เลี้ยง 🐱' },
                  { key: 'has_lan', label: 'มีสาย LAN ในห้อง 🔌' },
                  { key: 'has_air_con', label: 'มีห้องแอร์ ❄️' },
                ].map(item => (
                  <label
                    key={item.key}
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                      (formData as any)[item.key]
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-white/10 bg-[#080F1E]/50 text-white/50 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(formData as any)[item.key]}
                      onChange={e => setFormData({ ...formData, [item.key]: e.target.checked })}
                      className="sr-only"
                    />
                    <span className="text-sm font-black">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">สิ่งอำนวยความสะดวกอื่นๆ (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={e => setFormData({ ...formData, facilities: e.target.value })}
                  className="w-full bg-[#0F172A] border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary"
                  placeholder="เช่น ฟิตเนส, สระว่ายน้ำ, ระบบความปลอดภัย 24 ชม., กล้องวงจรปิด"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              {saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการตั้งค่าหอพัก'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
