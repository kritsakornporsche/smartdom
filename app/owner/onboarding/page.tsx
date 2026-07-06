'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Package {
  id: number;
  name: string;
  price: number;
  max_rooms: number;
  max_dorms: number;
  features: string[];
}

export default function OwnerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');

  const [dormData, setDormData] = useState({
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
  });

  useEffect(() => {
    // In a real app, get this from session/localStorage
    const email = localStorage.getItem('userEmail') || 'owner@smartdom.com';
    setOwnerEmail(email);

    const searchParams = new URLSearchParams(window.location.search);
    const force = searchParams.get('force') === 'true';

    const checkOnboarding = async () => {
      try {
        const res = await fetch(`/api/owner/onboarding?email=${email}`);
        const data = await res.json();
        if (data.success && data.hasDorm && !force) {
          router.push('/owner');
        } else if (data.success && force && !data.canAddDorm) {
          alert(`คุณไม่สามารถเพิ่มหอพักได้ เนื่องจากขีดจำกัดการสร้างหอพักของแพ็กเกจปัจจุบันเต็มแล้ว (สูงสุด ${data.maxAllowedDorms || 1} หอพัก) กรุณาอัปเกรดแพ็กเกจของคุณ`);
          router.push('/owner');
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      }
    };

    checkOnboarding();
  }, [router]);


  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dormData.name.trim()) {
      alert('กรุณากรอกชื่อหอพัก');
      return;
    }
    if (!dormData.phone.trim()) {
      alert('กรุณากรอกเบอร์โทรศัพท์ติดต่อ');
      return;
    }
    if (!dormData.address.trim()) {
      alert('กรุณากรอกที่อยู่หอพัก');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/owner/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail,
          dormData
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error('ระบบเซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้ง');
      }

      if (data.success) {
        setStep(3);
        setTimeout(() => router.push('/owner'), 3000);
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#080F1E] text-white font-sans py-20 px-6">
      <div className="max-w-4xl w-full mx-auto">
        
        {/* STEP 1: Dormitory Details */}
        {step === 1 && (
          <div className="bg-[#0F172A] rounded-[40px] shadow-2xl shadow-[#DCD3C6]/40 border border-white/20/10 p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="mb-10 text-center">
                <h2 className="text-3xl font-black mb-3">ตั้งค่าหอพักของคุณ</h2>
                <p className="text-white/50 font-medium">กรอกข้อมูลพื้นฐานเพื่อเริ่มต้นการใช้งานระบบ</p>
             </div>

             <form onSubmit={handleFinalSubmit} className="space-y-8 max-w-xl mx-auto">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">ชื่อหอพัก / กิจการ</label>
                   <input 
                    value={dormData.name}
                    onChange={(e) => setDormData({...dormData, name: e.target.value})}
                    placeholder="เช่น SmartDom Mansion"
                    className="w-full px-6 py-4 bg-[#0F172A] border border-border rounded-2xl focus:bg-[#0F172A] focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-white"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">เบอร์โทรศัพท์ติดต่อ</label>
                   <input 
                    value={dormData.phone}
                    onChange={(e) => setDormData({...dormData, phone: e.target.value})}
                    placeholder="02-XXX-XXXX"
                    className="w-full px-6 py-4 bg-[#0F172A] border border-border rounded-2xl focus:bg-[#0F172A] focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-white"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">ที่อยู่หอพัก</label>
                   <textarea 
                    value={dormData.address}
                    onChange={(e) => setDormData({...dormData, address: e.target.value})}
                    rows={3}
                    placeholder="ระบุเลขที่ ถนน แขวง เขต..."
                    className="w-full px-6 py-4 bg-[#0F172A] border border-border rounded-2xl focus:bg-[#0F172A] focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-white resize-none"
                   />
                </div>

                {/* Rates & Legal */}
                <div className="p-8 rounded-[24px] bg-white/5 border border-white/10 space-y-6">
                  <h3 className="text-sm font-black text-white">ค่าน้ำ/ค่าไฟ และข้อมูลกฎหมาย</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ค่าน้ำ (บาท/ยูนิต)</label>
                      <input type="number" value={dormData.water_rate} onChange={e => setDormData({...dormData, water_rate: Number(e.target.value)})} className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ค่าไฟ (บาท/ยูนิต)</label>
                      <input type="number" value={dormData.electricity_rate} onChange={e => setDormData({...dormData, electricity_rate: Number(e.target.value)})} className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2 md:col-span-1 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">เลขผู้เสียภาษี</label>
                      <input type="text" value={dormData.tax_id} onChange={e => setDormData({...dormData, tax_id: e.target.value})} className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary" placeholder="เลข 13 หลัก" />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="p-8 rounded-[24px] bg-white/5 border border-white/10 space-y-6">
                  <h3 className="text-sm font-black text-white">สิ่งอำนวยความสะดวกและเงื่อนไข</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'has_wifi', label: 'อินเทอร์เน็ต WiFi 📶' },
                      { key: 'has_parking', label: 'มีที่จอดรถยนต์ 🚗' },
                      { key: 'pet_friendly', label: 'อนุญาตเลี้ยงสัตว์ 🐱' },
                      { key: 'has_lan', label: 'สาย LAN ในห้อง 🔌' },
                      { key: 'has_air_con', label: 'มีห้องแอร์ ❄️' },
                    ].map(item => (
                      <label key={item.key} className={`relative flex items-center gap-3 p-4 rounded-xl border cursor-pointer select-none transition-all ${(dormData as any)[item.key] ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-[#080F1E]/50 text-white/50 hover:border-white/20'}`}>
                        <input type="checkbox" checked={(dormData as any)[item.key]} onChange={e => setDormData({...dormData, [item.key]: e.target.checked})} className="sr-only" />
                        <span className="text-xs font-black">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">สิ่งอำนวยความสะดวกอื่นๆ</label>
                    <input type="text" value={dormData.facilities} onChange={e => setDormData({...dormData, facilities: e.target.value})} className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-primary" placeholder="เช่น ฟิตเนส, สระว่ายน้ำ, กล้องวงจรปิด" />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-[#3E342B] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {loading ? 'กำลังประมวลผล...' : 'ยืนยันและเริ่มต้นใช้งาน →'}
                </button>
             </form>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="text-center bg-[#0F172A] rounded-[40px] p-20 shadow-2xl border border-white/20/10 animate-in zoom-in duration-1000">
             <div className="w-24 h-24 bg-emerald-100 rounded-[32px] flex items-center justify-center mx-auto mb-10 ring-8 ring-emerald-50">
                <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h2 className="text-4xl font-black text-white mb-4">ยินดีด้วยครับ!</h2>
             <p className="text-xl text-white/50 font-medium mb-10">หอพักของคุณพร้อมใช้งานในระบบ SmartDom แล้ว</p>
             <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.5em] animate-pulse">กำลังนำคุณไปยังหน้าควบคุม...</p>
          </div>
        )}

      </div>
    </div>
  );
}
