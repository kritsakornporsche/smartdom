'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');

  // 1. Personal Data (docs/dormitory_registration_data.md - Non-Financial)
  const [personalData, setPersonalData] = useState({
    fullName: '',
    idCardNumber: '',
    idCardImage: '',
    registeredAddress: '',
    mobilePhone: '',
    lineId: '',
    emergencyContact: '',
    taxId: '',
  });

  // 2. Dormitory Data
  const [dormData, setDormData] = useState({
    name: '',
    address: '',
    phone: '',
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

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalData.fullName.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุลจริงของผู้ประกอบการ/เจ้าของ');
      return;
    }
    if (!personalData.idCardNumber.trim()) {
      alert('กรุณากรอกเลขบัตรประจำตัวประชาชน / พาสปอร์ต');
      return;
    }
    if (!personalData.registeredAddress.trim()) {
      alert('กรุณากรอกที่อยู่ตามทะเบียนบ้าน');
      return;
    }
    if (!personalData.mobilePhone.trim()) {
      alert('กรุณากรอกเบอร์โทรศัพท์มือถือหลัก');
      return;
    }
    if (!personalData.emergencyContact.trim()) {
      alert('กรุณากรอกชื่อและเบอร์โทรผู้ติดต่อฉุกเฉิน');
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dormData.name.trim()) {
      alert('กรุณากรอกชื่อหอพัก');
      return;
    }
    if (!dormData.phone.trim()) {
      alert('กรุณากรอกเบอร์โทรศัพท์ติดต่อส่วนกลาง');
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
          personalData,
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
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#080F1E] text-white font-sans py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-3xl w-full mx-auto">
        
        {/* Step Progress Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10 max-w-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${step === 1 ? 'bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              1
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">ขั้นตอนที่ 1</p>
              <p className="text-xs font-bold text-white">ลงทะเบียนบุคคล</p>
            </div>
          </div>

          <div className={`h-px flex-1 mx-4 transition-all ${step >= 2 ? 'bg-primary' : 'bg-white/10'}`} />

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${step === 2 ? 'bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20' : step === 3 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-white/40'}`}>
              2
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">ขั้นตอนที่ 2</p>
              <p className="text-xs font-bold text-white">ตั้งค่าหอพัก</p>
            </div>
          </div>
        </div>

        {/* STEP 1: Personal Data Registration */}
        {step === 1 && (
          <div className="bg-[#0F172A] rounded-[32px] sm:rounded-[40px] shadow-2xl border border-white/10 p-6 sm:p-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
             <div className="mb-8 text-center">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                  👤 Personal Profile Registration
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">ลงทะเบียนข้อมูลบุคคล / เจ้าของหอพัก</h2>
                <p className="text-white/50 text-xs font-medium max-w-md mx-auto">
                  กรอกข้อมูลส่วนตัวสำหรับสัญญาและสิทธิ์บริหารหอพักตามมาตรฐาน PDPA (ไม่รวมข้อมูลการเงิน)
                </p>
             </div>

             <form onSubmit={handleStep1Submit} className="space-y-6 max-w-xl mx-auto">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     ชื่อ - นามสกุลจริง (เจ้าของ / ผู้มีอำนาจลงนาม) <span className="text-destructive">*</span>
                   </label>
                   <input 
                    required
                    value={personalData.fullName}
                    onChange={(e) => setPersonalData({...personalData, fullName: e.target.value})}
                    placeholder="เช่น นายสมชาย ใจดี"
                    className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                   />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                       เลขบัตรประชาชน / พาสปอร์ต <span className="text-destructive">*</span>
                     </label>
                     <input 
                      required
                      value={personalData.idCardNumber}
                      onChange={(e) => setPersonalData({...personalData, idCardNumber: e.target.value})}
                      placeholder="เลข 13 หลัก"
                      className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                       เบอร์โทรศัพท์มือถือหลัก <span className="text-destructive">*</span>
                     </label>
                     <input 
                      required
                      value={personalData.mobilePhone}
                      onChange={(e) => setPersonalData({...personalData, mobilePhone: e.target.value})}
                      placeholder="08X-XXX-XXXX"
                      className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                     />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     ที่อยู่ตามทะเบียนบ้าน / ที่อยู่จดทะเบียน <span className="text-destructive">*</span>
                   </label>
                   <textarea 
                    required
                    value={personalData.registeredAddress}
                    onChange={(e) => setPersonalData({...personalData, registeredAddress: e.target.value})}
                    rows={2}
                    placeholder="ระบุเลขที่บ้าน ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด..."
                    className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm resize-none"
                   />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">LINE ID / ช่องทางติดต่อ</label>
                     <input 
                      value={personalData.lineId}
                      onChange={(e) => setPersonalData({...personalData, lineId: e.target.value})}
                      placeholder="เช่น @smartowner"
                      className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                     <input 
                      value={personalData.taxId}
                      onChange={(e) => setPersonalData({...personalData, taxId: e.target.value})}
                      placeholder="เลข 13 หลัก (ถ้ามี)"
                      className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                     />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     ชื่อ-นามสกุล และ เบอร์โทรผู้ติดต่อฉุกเฉิน <span className="text-destructive">*</span>
                   </label>
                   <input 
                    required
                    value={personalData.emergencyContact}
                    onChange={(e) => setPersonalData({...personalData, emergencyContact: e.target.value})}
                    placeholder="เช่น นางสมศรี (คู่สมรส) - 081-999-XXXX"
                    className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     สำเนาบัตรประชาชน / พาสปอร์ต <span className="text-destructive">*</span>
                   </label>
                   <input 
                    value={personalData.idCardImage}
                    onChange={(e) => setPersonalData({...personalData, idCardImage: e.target.value})}
                    placeholder="ลิงก์ไฟล์ หรือ พิมพ์ 'แนบแล้ว' เพื่อผ่านขั้นตอน"
                    className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                   />
                   <p className="text-[10px] text-white/40 pl-1">
                     🔒 ข้อมูลได้รับคุ้มครองภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) และใช้เพื่อการระบุตัวตนในการทำสัญญาเท่านั้น
                   </p>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer mt-4"
                >
                  ถัดไป: ตั้งค่าข้อมูลหอพัก →
                </button>
             </form>
          </div>
        )}

        {/* STEP 2: Dormitory Details */}
        {step === 2 && (
          <div className="bg-[#0F172A] rounded-[32px] sm:rounded-[40px] shadow-2xl border border-white/10 p-6 sm:p-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
             <div className="mb-8 text-center">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                  🏢 Dormitory Registration
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">ตั้งค่าหอพักของคุณ</h2>
                <p className="text-white/50 text-xs font-medium max-w-md mx-auto">
                  กรอกข้อมูลสถานที่ อัตราค่าน้ำค่าน้ำไฟ และสิ่งอำนวยความสะดวกเพื่อเริ่มใช้งาน
                </p>
             </div>

             <form onSubmit={handleFinalSubmit} className="space-y-6 max-w-xl mx-auto">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     ชื่อหอพัก / กิจการ <span className="text-destructive">*</span>
                   </label>
                   <input 
                    required
                    value={dormData.name}
                    onChange={(e) => setDormData({...dormData, name: e.target.value})}
                    placeholder="เช่น SmartDom Mansion"
                    className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     เบอร์โทรศัพท์ติดต่อส่วนกลาง <span className="text-destructive">*</span>
                   </label>
                   <input 
                    required
                    value={dormData.phone}
                    onChange={(e) => setDormData({...dormData, phone: e.target.value})}
                    placeholder="02-XXX-XXXX หรือ 08X-XXX-XXXX"
                    className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     ที่อยู่หอพัก <span className="text-destructive">*</span>
                   </label>
                   <textarea 
                    required
                    value={dormData.address}
                    onChange={(e) => setDormData({...dormData, address: e.target.value})}
                    rows={2}
                    placeholder="ระบุเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด..."
                    className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm resize-none"
                   />
                </div>

                {/* Rates */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">อัตราค่าน้ำ / ค่าไฟ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ค่าน้ำ (บาท/ยูนิต)</label>
                      <input type="number" value={dormData.water_rate} onChange={e => setDormData({...dormData, water_rate: Number(e.target.value)})} className="w-full bg-[#080F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ค่าไฟ (บาท/ยูนิต)</label>
                      <input type="number" value={dormData.electricity_rate} onChange={e => setDormData({...dormData, electricity_rate: Number(e.target.value)})} className="w-full bg-[#080F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">สิ่งอำนวยความสะดวก</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'has_wifi', label: 'อินเทอร์เน็ต WiFi 📶' },
                      { key: 'has_parking', label: 'มีที่จอดรถยนต์ 🚗' },
                      { key: 'pet_friendly', label: 'อนุญาตเลี้ยงสัตว์ 🐱' },
                      { key: 'has_lan', label: 'สาย LAN ในห้อง 🔌' },
                      { key: 'has_air_con', label: 'มีห้องแอร์ ❄️' },
                    ].map(item => (
                      <label key={item.key} className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${(dormData as any)[item.key] ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-[#080F1E]/50 text-white/50 hover:border-white/20'}`}>
                        <input type="checkbox" checked={(dormData as any)[item.key]} onChange={e => setDormData({...dormData, [item.key]: e.target.checked})} className="sr-only" />
                        <span className="text-xs font-black">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">สิ่งอำนวยความสะดวกอื่นๆ</label>
                    <input type="text" value={dormData.facilities} onChange={e => setDormData({...dormData, facilities: e.target.value})} className="w-full bg-[#080F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-primary" placeholder="เช่น ฟิตเนส, สระว่ายน้ำ, กล้องวงจรปิด" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all cursor-pointer"
                  >
                    ← ย้อนกลับ
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loading ? 'กำลังประมวลผล...' : 'ยืนยันและเริ่มต้นใช้งาน →'}
                  </button>
                </div>
             </form>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="text-center bg-[#0F172A] rounded-[32px] sm:rounded-[40px] p-12 sm:p-20 shadow-2xl border border-white/10 animate-in zoom-in duration-500">
             <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-500/10 border border-emerald-500/30">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">ยินดีด้วยครับ!</h2>
             <p className="text-lg text-white/60 font-medium mb-8">ข้อมูลบุคคลและหอพักของคุณพร้อมใช้งานในระบบ SmartDom แล้ว</p>
             <p className="text-xs font-bold text-primary uppercase tracking-[0.4em] animate-pulse">กำลังนำคุณไปยังหน้าควบคุม...</p>
          </div>
        )}

      </div>
    </div>
  );
}
