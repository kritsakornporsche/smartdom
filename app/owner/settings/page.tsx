'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [dormData, setDormData] = useState({
    name: '',
    address: '',
    phone: '',
    water_rate: 0,
    electricity_rate: 8,
    pet_friendly: false,
    has_wifi: false,
    has_lan: false,
    has_parking: false,
    facilities: '',
    map_url: ''
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/owner/settings');
        const data = await res.json();
        
        if (data.success && data.data) {
          const fetchedData = data.data;
          setDormData({
            name: fetchedData.name || '',
            address: fetchedData.address || '',
            phone: fetchedData.phone || '',
            water_rate: Number(fetchedData.water_rate) || 0,
            electricity_rate: fetchedData.electricity_rate || 0,
            pet_friendly: !!fetchedData.pet_friendly,
            has_wifi: !!fetchedData.has_wifi,
            has_lan: !!fetchedData.has_lan,
            has_parking: !!fetchedData.has_parking,
            facilities: fetchedData.facilities || '',
            map_url: fetchedData.map_url || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchSettings();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/owner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dormData),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-8 lg:p-12 scroll-smooth custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <div>
          <h1 className="text-4xl font-black text-[#5A4D41] tracking-tight mb-2">ตั้งค่าหอพัก</h1>
          <p className="text-[#A08D74] font-bold">แก้ไขข้อมูลพื้นฐานและสิ่งอำนวยความสะดวกของหอพักคุณ</p>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-[#E5DFD3] p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            <div className="space-y-6">
              <h3 className="text-xl font-black text-[#5A4D41] border-b border-[#F3EFE9] pb-2">ข้อมูลพื้นฐาน</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                   <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">ชื่อหอพัก / กิจการ <span className="text-red-400">*</span></label>
                   <input 
                    required
                    value={dormData.name}
                    onChange={(e) => setDormData({...dormData, name: e.target.value})}
                    placeholder="เช่น SmartDom Mansion"
                    className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 outline-none transition-all font-bold text-[#3E342B]"
                   />
                </div>

                <div className="space-y-2 md:col-span-2">
                   <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">เบอร์โทรศัพท์ติดต่อ <span className="text-red-400">*</span></label>
                   <input 
                    required
                    value={dormData.phone}
                    onChange={(e) => setDormData({...dormData, phone: e.target.value})}
                    placeholder="02-XXX-XXXX"
                    className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 outline-none transition-all font-bold text-[#3E342B]"
                   />
                </div>

                <div className="space-y-2 md:col-span-2">
                   <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">ที่อยู่หอพัก <span className="text-red-400">*</span></label>
                   <textarea 
                    required
                    value={dormData.address}
                    onChange={(e) => setDormData({...dormData, address: e.target.value})}
                    rows={3}
                    placeholder="ระบุเลขที่ ถนน แขวง เขต..."
                    className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 outline-none transition-all font-bold text-[#3E342B] resize-none"
                   />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 mt-6 border-t border-[#F3EFE9]">
              <h3 className="text-xl font-black text-[#5A4D41] border-b border-[#F3EFE9] pb-2">สาธารณูปโภคและสิ่งอำนวยความสะดวก</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                     <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">ค่าน้ำ (บาท/หน่วย)</label>
                     <input 
                      type="number"
                      value={dormData.water_rate}
                      onChange={(e) => setDormData({...dormData, water_rate: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 outline-none transition-all font-bold text-[#3E342B]"
                     />
                 </div>
                 <div className="space-y-2">
                     <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">ค่าไฟ (บาท/หน่วย)</label>
                     <input 
                      type="number"
                      value={dormData.electricity_rate}
                      onChange={(e) => setDormData({...dormData, electricity_rate: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 outline-none transition-all font-bold text-[#3E342B]"
                     />
                 </div>
              </div>

              <div className="space-y-3 pt-2">
                 <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">บริการพื้นฐานที่มี</label>
                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                   <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${dormData.has_wifi ? 'bg-[#FAF8F5] border-[#8B7355]' : 'bg-white border-[#DCD3C6] hover:border-[#8B7355]/40'}`}>
                     <input type="checkbox" checked={dormData.has_wifi} onChange={(e) => setDormData({...dormData, has_wifi: e.target.checked})} className="w-5 h-5 accent-[#8B7355]" />
                     <span className="font-bold text-[#3E342B] text-sm">Wifi</span>
                   </label>
                   <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${dormData.has_lan ? 'bg-[#FAF8F5] border-[#8B7355]' : 'bg-white border-[#DCD3C6] hover:border-[#8B7355]/40'}`}>
                     <input type="checkbox" checked={dormData.has_lan} onChange={(e) => setDormData({...dormData, has_lan: e.target.checked})} className="w-5 h-5 accent-[#8B7355]" />
                     <span className="font-bold text-[#3E342B] text-sm">Lan</span>
                   </label>
                   <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${dormData.has_parking ? 'bg-[#FAF8F5] border-[#8B7355]' : 'bg-white border-[#DCD3C6] hover:border-[#8B7355]/40'}`}>
                     <input type="checkbox" checked={dormData.has_parking} onChange={(e) => setDormData({...dormData, has_parking: e.target.checked})} className="w-5 h-5 accent-[#8B7355]" />
                     <span className="font-bold text-[#3E342B] text-sm">ลานจอดรถ</span>
                   </label>
                   <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${dormData.pet_friendly ? 'bg-[#FAF8F5] border-[#8B7355]' : 'bg-white border-[#DCD3C6] hover:border-[#8B7355]/40'}`}>
                     <input type="checkbox" checked={dormData.pet_friendly} onChange={(e) => setDormData({...dormData, pet_friendly: e.target.checked})} className="w-5 h-5 accent-[#8B7355]" />
                     <span className="font-bold text-[#3E342B] text-sm">สัตว์เลี้ยง</span>
                   </label>
                 </div>
              </div>

              <div className="space-y-2 lg:col-span-2">
                 <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">สวัสดิการและพื้นที่ส่วนกลางอื่นๆ</label>
                 <textarea 
                  value={dormData.facilities}
                  onChange={(e) => setDormData({...dormData, facilities: e.target.value})}
                  rows={3}
                  placeholder="เช่น ฟิตเนส 24 ชม., สระว่ายน้ำ, Co-working space..."
                  className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 outline-none transition-all font-bold text-[#3E342B] resize-none"
                 />
              </div>
              
              <div className="space-y-2 lg:col-span-2">
                 <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">ลิงก์ฝังแผนที่ Google Maps (Embed URL)</label>
                 <input 
                  value={dormData.map_url}
                  onChange={(e) => setDormData({...dormData, map_url: e.target.value})}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 outline-none transition-all font-bold text-[#3E342B]"
                 />
              </div>
            </div>

            <div className="pt-8 border-t border-[#F3EFE9] flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="px-8 py-4 bg-[#8B7355] text-white rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-[#6b583f] transition-all disabled:opacity-50"
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}
