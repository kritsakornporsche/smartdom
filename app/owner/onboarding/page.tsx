'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ── Amenities Config Categorized into 4 Detailed Groups ─────────────────────
const AMENITY_CATEGORIES = [
  {
    category: '1. สิ่งอำนวยความสะดวกภายในห้องพัก (In-Room Amenities)',
    subgroups: [
      {
        title: 'หอพักระดับพื้นฐาน - ปานกลาง (Basic to Mid-Range)',
        items: [
          '🛏️ เตียงนอน',
          '🚪 ตู้เสื้อผ้า',
          '🪑 โต๊ะทำงาน / โต๊ะเครื่องแป้ง',
          '❄️ เครื่องปรับอากาศ',
          '🌀 พัดลม',
          '🚿 เครื่องทำน้ำอุ่น',
          '🌅 ระเบียงส่วนตัว',
          '🪟 หน้าต่างพร้อมมุ้งลวด',
        ],
      },
      {
        title: 'หอพักระดับพรีเมียม / คอนโดเลี้ยงสัตว์ได้ (High-End & Specialized)',
        items: [
          '🧊 ตู้เย็น',
          '📺 ทีวี',
          '🍲 ไมโครเวฟ',
          '🫖 กาน้ำร้อน',
          '🍳 เคาน์เตอร์ครัว (Pantry)',
          '🚰 ซิงค์ล้างจาน',
          '🔥 เตาไฟฟ้าพร้อมเครื่องดูดควัน',
          '🔐 Digital Door Lock',
          '📺 สมาร์ททีวี',
          '🧺 เครื่องซักผ้าส่วนตัวในห้อง',
        ],
      },
    ],
  },
  {
    category: '2. สิ่งอำนวยความสะดวกส่วนกลาง (Common Facilities)',
    subgroups: [
      {
        title: 'พื้นที่บริการพื้นฐาน (พบได้ทั่วไป)',
        items: [
          '🧺 ตู้ซักผ้าและตู้อบผ้าหยอดเหรียญ / สแกน QR Code',
          '🚰 ตู้น้ำดื่มหยอดเหรียญ',
          '🛗 ลิฟต์โดยสาร',
          '🛵 ที่จอดรถจักรยานยนต์',
          '🚗 ที่จอดรถยนต์',
        ],
      },
      {
        title: 'พื้นที่ส่วนกลางระดับพรีเมียม (Lifestyle & Co-Working)',
        items: [
          '📚 Co-Working Space / ห้องอ่านหนังสือ',
          '🤝 ห้องประชุมส่วนตัว (Meeting Room)',
          '🏋️ ฟิตเนส (Fitness)',
          '🏊 สระว่ายน้ำ',
          '🧘 ห้องโยคะ',
          '🎮 ห้อง Game Room',
          '🎱 โต๊ะพูล',
          '👨‍🍳 Co-Kitchen (ครัวส่วนกลางสำหรับทำอาหารหนัก)',
          '🌿 สวนบนชั้นดาดฟ้า (Rooftop Garden)',
          '🌱 Co-Living Lawn',
        ],
      },
    ],
  },
  {
    category: '3. สิ่งอำนวยความสะดวกด้านเทคโนโลยีและบริการพิเศษ (Tech & Services)',
    subgroups: [
      {
        title: 'ระบบอินเทอร์เน็ต & พัสดุ',
        items: [
          '📶 Wi-Fi ส่วนกลาง (แชร์สปีด)',
          '⚡ LAN / Wi-Fi แยกห้อง (Dedicated High-Speed)',
          '📦 ชั้นวางพัสดุส่วนกลาง / ฝากนิติ',
          '📫 ตู้พัสดุอัจฉริยะ (Smart Locker 24 ชม.)',
        ],
      },
      {
        title: 'บริการเสริม (Add-on Services)',
        items: [
          '🧹 บริการทำความสะอาดห้องพักรายเดือน',
          '🥫 ตู้จำหน่ายสินค้าอัตโนมัติ (Vending Machine / ตู้เต่าบิน / 7-Eleven)',
          '🔌 จุดชาร์จรถยนต์ไฟฟ้า (EV Charger)',
          '🚐 บริการรถรับ-ส่ง (Shuttle Van) ไป ม. / รถไฟฟ้า',
        ],
      },
    ],
  },
  {
    category: '4. สิ่งอำนวยความสะดวกเฉพาะกลุ่ม (Specialized Amenities)',
    subgroups: [
      {
        title: 'หอพัก Pet-Friendly & หอพักหญิงล้วน',
        items: [
          '🐾 โซนขับถ่ายของสัตว์เลี้ยง (Pet Zone)',
          '🐕 สวนเดินเล่นสำหรับสุนัข/แมว',
          '🪵 วัสดุพื้นห้องกันรอยขีดข่วน',
          '👩‍🦰 ระบบสแกนใบหน้าเฉพาะผู้หญิง',
          '👮‍♀️ รปภ. หญิงดูแลความปลอดภัย',
          '📹 กล้องวงจรปิดครอบคลุมทุกจุดเสี่ยง',
        ],
      },
    ],
  },
];

export default function OwnerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');

  // 1. Personal Data (Separated Fields & Title & File Attachment)
  const [title, setTitle] = useState<'นาย' | 'นาง' | 'นางสาว' | 'อื่นๆ'>('นาย');
  const [customTitle, setCustomTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardFileName, setIdCardFileName] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [taxId, setTaxId] = useState('');

  // Emergency Contact (Separated into 3 fields)
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('คู่สมรส');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // 2. Dormitory Data & Map Pinning & Amenities Selection
  const [dormName, setDormName] = useState('');
  const [dormPhone, setDormPhone] = useState('');
  const [dormAddress, setDormAddress] = useState('');
  const [latitude, setLatitude] = useState('19.0286'); // Default UP / Phayao
  const [longitude, setLongitude] = useState('99.8967');
  const [mapUrl, setMapUrl] = useState('');
  const [waterRate, setWaterRate] = useState(18);
  const [electricityRate, setElectricityRate] = useState(8);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    '🛏️ เตียงนอน',
    '🚪 ตู้เสื้อผ้า',
    '🪑 โต๊ะทำงาน / โต๊ะเครื่องแป้ง',
    '❄️ เครื่องปรับอากาศ',
    '🚿 เครื่องทำน้ำอุ่น',
    '📶 Wi-Fi ส่วนกลาง (แชร์สปีด)',
    '🛵 ที่จอดรถจักรยานยนต์',
    '🚗 ที่จอดรถยนต์',
  ]);

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

  // ── Quick Test Auto-Fill Helpers ──────────────────────────────────────────
  const handleAutoFillStep1 = () => {
    setTitle('นาย');
    setFirstName('กฤษกร');
    setLastName('บัว');
    setIdCardNumber('1100200345678');
    setIdCardFileName('สำเนาบัตรประชาชน_กฤษกร_บัว.pdf (ผ่านการรับรองแล้ว)');
    setRegisteredAddress('99/1 หมู่ 5 ต.แม่กา อ.เมือง จ.พะเยา 56000');
    setMobilePhone('081-234-5678');
    setLineId('@kritsakorn');
    setEmergencyName('นางสมศรี บัว');
    setEmergencyRelation('มารดา');
    setEmergencyPhone('089-876-5432');
    setTaxId('1100200345678');
  };

  const handleAutoFillStep2 = () => {
    setDormName('SmartDom Grand Residence');
    setDormPhone('054-123-4567');
    setDormAddress('123/4 หมู่ 2 ถนนพหลโยธิน ต.แม่กา อ.เมือง จ.พะเยา 56000');
    setLatitude('19.0286');
    setLongitude('99.8967');
    setMapUrl('https://maps.google.com/?q=19.0286,99.8967');
    setWaterRate(18);
    setElectricityRate(8);
  };

  const handleAutoFillAllDemo = () => {
    handleAutoFillStep1();
    handleAutoFillStep2();
    alert('⚡ เติมข้อมูลตัวอย่างสำหรับการทดสอบเรียบร้อยแล้ว!');
  };

  // ── File Upload Handler ───────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardFileName(file.name);
    }
  };

  // ── Amenity Toggle Handler ────────────────────────────────────────────────
  const toggleAmenity = (item: string) => {
    setSelectedAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  // ── Step Submissions ──────────────────────────────────────────────────────
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      alert('กรุณากรอกชื่อและนามสกุลจริงของผู้ประกอบการ/เจ้าของ');
      return;
    }
    if (!idCardNumber.trim()) {
      alert('กรุณากรอกเลขบัตรประจำตัวประชาชน / พาสปอร์ต');
      return;
    }
    if (!registeredAddress.trim()) {
      alert('กรุณากรอกที่อยู่ตามทะเบียนบ้าน');
      return;
    }
    if (!mobilePhone.trim()) {
      alert('กรุณากรอกเบอร์โทรศัพท์มือถือหลัก');
      return;
    }
    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์ของผู้ติดต่อฉุกเฉิน');
      return;
    }
    if (!idCardFileName.trim()) {
      alert('กรุณาแนบไฟล์สำเนาบัตรประชาชน/พาสปอร์ต หรือกดปุ่ม "⚡ ทดสอบ: ข้ามการแนบไฟล์"');
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dormName.trim()) {
      alert('กรุณากรอกชื่อหอพัก');
      return;
    }
    if (!dormPhone.trim()) {
      alert('กรุณากรอกเบอร์โทรศัพท์ติดต่อส่วนกลาง');
      return;
    }
    if (!dormAddress.trim()) {
      alert('กรุณากรอกที่อยู่หอพัก');
      return;
    }

    setLoading(true);

    const prefixStr = title === 'อื่นๆ' ? (customTitle || 'นาย') : title;
    const fullNameStr = `${prefixStr} ${firstName.trim()} ${lastName.trim()}`.trim();
    const emergencyStr = `${emergencyName.trim()} (${emergencyRelation}) - ${emergencyPhone.trim()}`;
    
    const personalDataPayload = {
      title: prefixStr,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: fullNameStr,
      idCardNumber: idCardNumber.trim(),
      idCardImage: idCardFileName || 'สำเนาบัตรประชาชน (แนบไฟล์แล้ว)',
      registeredAddress: registeredAddress.trim(),
      mobilePhone: mobilePhone.trim(),
      lineId: lineId.trim(),
      emergencyContact: emergencyStr,
      taxId: taxId.trim(),
    };

    const dormDataPayload = {
      name: dormName.trim(),
      phone: dormPhone.trim(),
      address: dormAddress.trim(),
      latitude,
      longitude,
      mapUrl: mapUrl || `https://maps.google.com/?q=${latitude},${longitude}`,
      water_rate: waterRate,
      electricity_rate: electricityRate,
      has_wifi: selectedAmenities.some(a => a.includes('Wi-Fi')),
      has_parking: selectedAmenities.some(a => a.includes('ที่จอดรถ')),
      pet_friendly: selectedAmenities.some(a => a.includes('Pet-Friendly') || a.includes('สัตว์')),
      has_lan: selectedAmenities.some(a => a.includes('LAN')),
      has_air_con: selectedAmenities.some(a => a.includes('ปรับอากาศ') || a.includes('แอร์')),
      selectedAmenities,
      facilities: selectedAmenities.join(', '),
    };

    try {
      const res = await fetch('/api/owner/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail,
          personalData: personalDataPayload,
          dormData: dormDataPayload
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
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
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#080F1E] text-white font-sans py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl w-full mx-auto">

        {/* Global Demo Auto-fill Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-[#0F172A]/80 border border-primary/30 p-4 rounded-2xl backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <p className="text-xs font-bold text-white">ระบบ Onboarding ลงทะเบียนหอพักสมบูรณ์แบบ</p>
          </div>
          <button
            type="button"
            onClick={handleAutoFillAllDemo}
            className="px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            ⚡ เติมข้อมูลทดสอบทั้งหมดอัตโนมัติ (Auto-fill Demo)
          </button>
        </div>

        {/* Step Progress Bar */}
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
              <p className="text-xs font-bold text-white">ตั้งค่าหอพัก & สิ่งอำนวยความสะดวก</p>
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

             <form onSubmit={handleStep1Submit} className="space-y-6 max-w-2xl mx-auto">
                
                {/* 1. Title + First Name + Last Name (Separated) */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     คำนำหน้านาม - ชื่อจริง - นามสกุลจริง (เจ้าของ / ผู้มีอำนาจลงนาม) <span className="text-destructive">*</span>
                   </label>
                   <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                     <div className="sm:col-span-1">
                       <select
                         value={title}
                         onChange={(e) => setTitle(e.target.value as any)}
                         className="w-full px-4 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                       >
                         <option value="นาย">นาย (Mr.)</option>
                         <option value="นาง">นาง (Mrs.)</option>
                         <option value="นางสาว">นางสาว (Ms.)</option>
                         <option value="อื่นๆ">อื่นๆ</option>
                       </select>
                     </div>

                     {title === 'อื่นๆ' && (
                       <div className="sm:col-span-1">
                         <input
                           type="text"
                           value={customTitle}
                           onChange={(e) => setCustomTitle(e.target.value)}
                           placeholder="ระบุคำนำหน้านาม"
                           className="w-full px-4 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                         />
                       </div>
                     )}

                     <div className={title === 'อื่นๆ' ? "sm:col-span-1" : "sm:col-span-1.5 sm:col-span-2"}>
                       <input 
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="ชื่อจริง (เช่น กฤษกร)"
                        className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                       />
                     </div>

                     <div className={title === 'อื่นๆ' ? "sm:col-span-1" : "sm:col-span-1.5 sm:col-span-2"}>
                       <input 
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="นามสกุล (เช่น บัว)"
                        className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                       />
                     </div>
                   </div>
                </div>

                {/* ID Card & Mobile Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                       เลขบัตรประจำตัวประชาชน / พาสปอร์ต <span className="text-destructive">*</span>
                     </label>
                     <input 
                      required
                      value={idCardNumber}
                      onChange={(e) => setIdCardNumber(e.target.value)}
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
                      value={mobilePhone}
                      onChange={(e) => setMobilePhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                     />
                  </div>
                </div>

                {/* Registered Address */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     ที่อยู่ตามทะเบียนบ้าน / ที่อยู่จดทะเบียน <span className="text-destructive">*</span>
                   </label>
                   <textarea 
                    required
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    rows={2}
                    placeholder="ระบุเลขที่บ้าน ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด..."
                    className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm resize-none"
                   />
                </div>

                {/* LINE ID & Tax ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">LINE ID / ช่องทางติดต่อส่วนตัว</label>
                     <input 
                      value={lineId}
                      onChange={(e) => setLineId(e.target.value)}
                      placeholder="เช่น @smartowner"
                      className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                     <input 
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="เลข 13 หลัก (ถ้ามี)"
                      className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                     />
                  </div>
                </div>

                {/* 2. Emergency Contact (Separated 3 Fields) */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span>🚨</span> ข้อมูลผู้ติดต่อฉุกเฉิน (Emergency Contact) <span className="text-destructive">*</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-white/50 block pl-1">ชื่อ - นามสกุล ผู้ติดต่อฉุกเฉิน</label>
                      <input
                        required
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="เช่น นางสมศรี บัว"
                        className="w-full px-4 py-3 bg-[#080F1E] border border-white/10 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-white/50 block pl-1">ความสัมพันธ์</label>
                      <select
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        className="w-full px-4 py-3 bg-[#080F1E] border border-white/10 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="คู่สมรส">คู่สมรส</option>
                        <option value="บิดา/มารดา">บิดา / มารดา</option>
                        <option value="บุตร">บุตร</option>
                        <option value="พี่น้อง">พี่น้อง</option>
                        <option value="ญาติสนิท">ญาติสนิท</option>
                        <option value="เพื่อน">เพื่อน</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-white/50 block pl-1">เบอร์โทรศัพท์ฉุกเฉิน</label>
                      <input
                        required
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="08X-XXX-XXXX"
                        className="w-full px-4 py-3 bg-[#080F1E] border border-white/10 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. ID Card / Passport Attachment with Quick Bypass Button */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                      <span>📄</span> สำเนาบัตรประชาชน / พาสปอร์ต <span className="text-destructive">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIdCardFileName('สำเนาบัตรประชาชน_ผ่านการรับรองแล้ว.pdf')}
                      className="px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-xl text-[11px] font-black hover:bg-primary hover:text-white transition-all cursor-pointer"
                    >
                      ⚡ ทดสอบ: ข้ามการแนบไฟล์ (Mock Bypass)
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-primary/50 transition-all bg-[#080F1E]/60">
                    <input
                      type="file"
                      id="id-card-upload"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="id-card-upload" className="cursor-pointer block">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-white mb-1">
                        {idCardFileName ? `📎 ไฟล์ที่เลือก: ${idCardFileName}` : 'คลิกเพื่อเลือกไฟล์แนบ หรือลากไฟล์มาวางที่นี่'}
                      </p>
                      <p className="text-[11px] text-white/40">รองรับไฟล์รูปภาพ JPG, PNG หรือ PDF (ขนาดไม่เกิน 10MB)</p>
                    </label>
                  </div>
                  <p className="text-[10px] text-white/40 pl-1">
                    🔒 ข้อมูลได้รับคุ้มครองภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) และใช้เพื่อการระบุตัวตนในการทำสัญญาเท่านั้น
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAutoFillStep1}
                    className="w-1/3 py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all cursor-pointer"
                  >
                    ⚡ เติมตัวอย่าง Step 1
                  </button>
                  <button 
                    type="submit"
                    className="w-2/3 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                  >
                    ถัดไป: ตั้งค่าข้อมูลหอพัก & สิ่งอำนวยความสะดวก →
                  </button>
                </div>
             </form>
          </div>
        )}

        {/* STEP 2: Dormitory Details & Map Pinning & Categorized Amenities */}
        {step === 2 && (
          <div className="bg-[#0F172A] rounded-[32px] sm:rounded-[40px] shadow-2xl border border-white/10 p-6 sm:p-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
             <div className="mb-8 text-center">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                  🏢 Dormitory Registration & Amenities
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">ตั้งค่าหอพักและสิ่งอำนวยความสะดวก</h2>
                <p className="text-white/50 text-xs font-medium max-w-md mx-auto">
                  กรอกข้อมูลสถานที่ ปักหมุดพิกัดแผนที่ อัตราค่าน้ำไฟ และเลือกสิ่งอำนวยความสะดวก 4 หมวดหมู่
                </p>
             </div>

             <form onSubmit={handleFinalSubmit} className="space-y-8 max-w-2xl mx-auto">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     ชื่อหอพัก / กิจการ <span className="text-destructive">*</span>
                   </label>
                   <input 
                    required
                    value={dormName}
                    onChange={(e) => setDormName(e.target.value)}
                    placeholder="เช่น SmartDom Mansion"
                    className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">
                     เบอร์โทรศัพท์ติดต่อส่วนกลาง / นิติ <span className="text-destructive">*</span>
                   </label>
                   <input 
                    required
                    value={dormPhone}
                    onChange={(e) => setDormPhone(e.target.value)}
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
                    value={dormAddress}
                    onChange={(e) => setDormAddress(e.target.value)}
                    rows={2}
                    placeholder="ระบุเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด..."
                    className="w-full px-5 py-3.5 bg-[#080F1E] border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-white text-sm resize-none"
                   />
                </div>

                {/* 📍 Map Pinning Component */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <span>📍</span> การปักหมุดตำแหน่งหอพักบนแผนที่ (Map Location Pinning)
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setLatitude('19.0286');
                        setLongitude('99.8967');
                        setMapUrl('https://maps.google.com/?q=19.0286,99.8967');
                      }}
                      className="px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-xl text-[11px] font-black hover:bg-primary hover:text-white transition-all cursor-pointer"
                    >
                      📍 ปักหมุดพิกัด ม.พะเยา (ตัวอย่าง)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-white/50 block pl-1">ละติจูด (Latitude)</label>
                      <input
                        type="text"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="เช่น 19.0286"
                        className="w-full bg-[#080F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-white/50 block pl-1">ลองจิจูด (Longitude)</label>
                      <input
                        type="text"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="เช่น 99.8967"
                        className="w-full bg-[#080F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/50 block pl-1">ลิงก์ Google Maps / พิกัดปักหมุด</label>
                    <input
                      type="text"
                      value={mapUrl}
                      onChange={(e) => setMapUrl(e.target.value)}
                      placeholder="https://maps.google.com/?q=19.0286,99.8967"
                      className="w-full bg-[#080F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Interactive Map Box Preview */}
                  <div className="w-full h-36 bg-[#080F1E] rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg animate-bounce">
                      📍
                    </div>
                    <p className="text-xs font-bold text-white">ตำแหน่งหมุด: Lat {latitude}, Long {longitude}</p>
                    <a
                      href={mapUrl || `https://maps.google.com/?q=${latitude},${longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-black text-primary hover:underline"
                    >
                      🗺️ คลิกเพื่อทดสอบเปิดบน Google Maps ↗
                    </a>
                  </div>
                </div>

                {/* Utility Rates */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">อัตราค่าน้ำ / ค่าไฟ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ค่าน้ำ (บาท/ยูนิต)</label>
                      <input type="number" value={waterRate} onChange={e => setWaterRate(Number(e.target.value))} className="w-full bg-[#080F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block pl-1">ค่าไฟ (บาท/ยูนิต)</label>
                      <input type="number" value={electricityRate} onChange={e => setElectricityRate(Number(e.target.value))} className="w-full bg-[#080F1E] border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                {/* 🌟 4 Detailed Categories of Amenities (สิ่งอำนวยความสะดวก 4 หมวดหมู่) */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <span>✨</span> เลือกสิ่งอำนวยความสะดวกของหอพัก (4 หมวดหมู่)
                    </h3>
                    <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      เลือกแล้ว {selectedAmenities.length} รายการ
                    </span>
                  </div>

                  {AMENITY_CATEGORIES.map((cat, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <h4 className="text-xs font-black text-primary uppercase tracking-wider border-b border-white/10 pb-2">
                        {cat.category}
                      </h4>

                      {cat.subgroups.map((sub, sIdx) => (
                        <div key={sIdx} className="space-y-2">
                          <p className="text-[11px] font-bold text-white/60 italic pl-1">{sub.title}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {sub.items.map((item) => {
                              const isSelected = selectedAmenities.includes(item);
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => toggleAmenity(item)}
                                  className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer select-none ${
                                    isSelected
                                      ? 'border-primary bg-primary/20 text-white ring-1 ring-primary shadow-sm'
                                      : 'border-white/10 bg-[#080F1E]/50 text-white/50 hover:border-white/30 hover:text-white'
                                  }`}
                                >
                                  <span>{item}</span>
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${isSelected ? 'bg-primary text-primary-foreground' : 'border border-white/20'}`}>
                                    {isSelected ? '✓' : ''}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4">
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
