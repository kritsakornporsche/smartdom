'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Package {
  id: number;
  name: string;
  price: number;
  max_rooms: number;
  features: string[];
}

export default function OwnerOnboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');

  const [dormData, setDormData] = useState({
    name: '',
    address: '',
    phone: '',
    water_rate: 18,
    electricity_rate: 8,
    pet_friendly: false,
    has_wifi: false,
    has_lan: false,
    has_parking: false,
    facilities: '',
    map_url: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (session?.user?.email) {
      setOwnerEmail(session.user.email);
    } else {
      return;
    }

    const checkOnboarding = async () => {
      try {
        const res = await fetch(`/api/owner/onboarding?email=${session.user?.email}`);
        const data = await res.json();
        if (data.success && data.hasDorm) {
          router.push('/owner');
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      }
    };

    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/owner/packages');
        const data = await res.json();
        if (data.success) {
          const formatted = data.data.map((p: any) => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features
          }));
          setPackages(formatted);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
      }
    };

    checkOnboarding();
    fetchPackages();
  }, [router, session, status]);


  const handleDormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!selectedPackage) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/owner/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail,
          dormData,
          packageId: selectedPackage
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep(3);
        setTimeout(() => router.push('/owner'), 3000);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#FDFBF7] text-[#3E342B] font-sans items-center py-20 px-6 w-full custom-scrollbar">
      <div className="max-w-4xl w-full">
        
        {/* Progress Bar */}
        {step < 3 && (
          <div className="mb-16">
            <div className="flex justify-between mb-4">
               <span className={`text-sm font-bold uppercase tracking-wider ${step >= 1 ? 'text-[#8B7355]' : 'text-[#DCD3C6]'}`}>1. ข้อมูลหอพัก</span>
               <span className={`text-sm font-bold uppercase tracking-wider ${step >= 2 ? 'text-[#8B7355]' : 'text-[#DCD3C6]'}`}>2. เลือกแพ็กเกจ</span>
            </div>
            <div className="h-1 bg-[#E5DFD3] rounded-full overflow-hidden">
               <div className={`h-full bg-[#8B7355] transition-all duration-700 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
            </div>
          </div>
        )}

        {/* STEP 1: Dormitory Details */}
        {step === 1 && (
          <div className="bg-white rounded-[40px] shadow-2xl shadow-[#DCD3C6]/40 border border-[#E5DFD3] p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="mb-10 text-center">
                <h2 className="text-3xl font-black mb-3">ตั้งค่าหอพักของคุณ</h2>
                <p className="text-[#A08D74] font-medium">กรอกข้อมูลพื้นฐานเพื่อเริ่มต้นการใช้งานระบบ</p>
             </div>

             <form onSubmit={handleDormSubmit} className="space-y-10 max-w-2xl mx-auto">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-[#5A4D41] border-b border-[#F3EFE9] pb-2">ข้อมูลพื้นฐาน</h3>
                  
                  <div className="space-y-2">
                     <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">ชื่อหอพัก / กิจการ <span className="text-red-400">*</span></label>
                     <input 
                      required
                      value={dormData.name}
                      onChange={(e) => setDormData({...dormData, name: e.target.value})}
                      placeholder="เช่น SmartDom Mansion"
                      className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 outline-none transition-all font-bold text-[#3E342B]"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">เบอร์โทรศัพท์ติดต่อ <span className="text-red-400">*</span></label>
                     <input 
                      required
                      value={dormData.phone}
                      onChange={(e) => setDormData({...dormData, phone: e.target.value})}
                      placeholder="02-XXX-XXXX"
                      className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] focus:ring-4 focus:ring-[#8B7355]/5 outline-none transition-all font-bold text-[#3E342B]"
                     />
                  </div>

                  <div className="space-y-2">
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

                <div className="space-y-6 pt-6 mt-6 border-t border-[#F3EFE9]">
                  <h3 className="text-xl font-black text-[#5A4D41] border-b border-[#F3EFE9] pb-2">สาธารณูปโภคและสิ่งอำนวยความสะดวก</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                         <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">ค่าน้ำ (บาท/หน่วย)</label>
                         <input 
                          type="number"
                          value={dormData.water_rate}
                          onChange={(e) => setDormData({...dormData, water_rate: Number(e.target.value)})}
                          className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] outline-none transition-all font-bold text-[#3E342B]"
                         />
                     </div>
                     <div className="space-y-2">
                         <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">ค่าไฟ (บาท/หน่วย)</label>
                         <input 
                          type="number"
                          value={dormData.electricity_rate}
                          onChange={(e) => setDormData({...dormData, electricity_rate: Number(e.target.value)})}
                          className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] outline-none transition-all font-bold text-[#3E342B]"
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

                  <div className="space-y-2">
                     <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">สวัสดิการและพื้นที่ส่วนกลางอื่นๆ</label>
                     <textarea 
                      value={dormData.facilities}
                      onChange={(e) => setDormData({...dormData, facilities: e.target.value})}
                      rows={2}
                      placeholder="เช่น ฟิตเนส 24 ชม., สระว่ายน้ำ, Co-working space..."
                      className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] outline-none transition-all font-bold text-[#3E342B] resize-none"
                     />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-sm font-black uppercase tracking-wide text-[#A08D74] ml-1">ลิงก์ฝังแผนที่ Google Maps (Embed URL)</label>
                     <input 
                      value={dormData.map_url}
                      onChange={(e) => setDormData({...dormData, map_url: e.target.value})}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#DCD3C6] rounded-2xl focus:bg-white focus:border-[#8B7355] outline-none transition-all font-bold text-[#3E342B]"
                     />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 mt-8 bg-[#3E342B] text-white rounded-2xl font-black text-sm uppercase tracking-wide shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                >
                  บันทึกข้อมูล & ไปยังขั้นตอนถัดไป →
                </button>
             </form>
          </div>
        )}

        {/* STEP 2: Package Selection */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="mb-12 text-center">
                <h2 className="text-3xl font-black mb-3 text-[#3E342B]">เลือกแพ็กเกจที่เหมาะกับคุณ</h2>
                <p className="text-[#A08D74] font-medium">ทุกแพ็กเกจรองรับการขยายตัวในอนาคต</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative p-8 rounded-[40px] border-2 cursor-pointer transition-all duration-500 flex flex-col h-full ${
                      selectedPackage === pkg.id 
                        ? 'border-[#8B7355] bg-white shadow-2xl scale-105' 
                        : 'border-[#E5DFD3] bg-[#FAF8F5] hover:border-[#8B7355]/40 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {selectedPackage === pkg.id && (
                      <div className="absolute top-6 right-6 w-6 h-6 bg-[#8B7355] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <h3 className="text-xl font-black text-[#8B7355] mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1 mb-8">
                       <span className="text-2xl font-black text-[#3E342B]">฿{Number(pkg.price).toLocaleString()}</span>
                       <span className="text-xs font-bold text-[#A08D74] uppercase">/ เดือน</span>
                    </div>
                    
                    <ul className="space-y-4 flex-1">
                       {pkg.features.map((f, i) => (
                         <li key={i} className="flex gap-3 text-xs font-bold text-[#5A4D41]">
                            <svg className="w-4 h-4 text-[#8B7355] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            {f}
                         </li>
                       ))}
                    </ul>

                    <div className="mt-8 pt-6 border-t border-[#F3EFE9]">
                       <p className="text-sm font-black uppercase text-[#A08D74]">รองรับสูงสุด: {pkg.max_rooms} ห้อง</p>
                    </div>
                  </div>
                ))}
             </div>

             <div className="flex gap-4 max-w-xl mx-auto">
               <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-5 bg-white border border-[#E5DFD3] text-[#A08D74] rounded-2xl font-black text-xs uppercase tracking-wide hover:bg-[#FAF8F5] transition-all"
                >
                  ย้อนกลับ
                </button>
                <button 
                  disabled={!selectedPackage || loading}
                  onClick={handleFinalSubmit}
                  className="flex-[2] py-5 bg-[#8B6A2B] text-white rounded-2xl font-black text-xs uppercase tracking-wide shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 transition-all"
                >
                  {loading ? 'กำลังประมวลผล...' : 'ยืนยันและเริ่มต้นใช้งาน →'}
                </button>
             </div>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="text-center bg-white rounded-[40px] p-20 shadow-2xl border border-[#E5DFD3] animate-in zoom-in duration-1000">
             <div className="w-24 h-24 bg-emerald-100 rounded-[32px] flex items-center justify-center mx-auto mb-10 ring-8 ring-emerald-50">
                <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h2 className="text-2xl font-black text-[#3E342B] mb-4">ยินดีด้วยครับ!</h2>
             <p className="text-xl text-[#A08D74] font-medium mb-10">หอพักของคุณพร้อมใช้งานในระบบ SmartDom แล้ว</p>
             <p className="text-xs font-bold text-[#DCD3C6] uppercase tracking-[0.5em] animate-pulse">กำลังนำคุณไปยังหน้าควบคุม...</p>
          </div>
        )}

      </div>
    </div>
  );
}
