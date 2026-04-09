'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function RoomBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;
  const { data: session, status: sessionStatus } = useSession();
  console.log('Session Status:', sessionStatus, 'User:', session?.user?.email);
  
  const [room, setRoom] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: Info, 2: Booking, 3: Contract, 4: Check-in
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({ name: '', phone: '', email: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        const data = await res.json();
        if (data.success) setRoom(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [roomId]);

  const isRoomAvailable = room?.status?.toLowerCase() === 'available' || room?.status === 'ว่าง';

  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user) {
      setBookingData((prev) => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || '',
      }));
      
      // Force jump to Step 2 if in Step 1 and room is available
      if (step === 1 && room && isRoomAvailable) {
        console.log('Auto-jumping to Step 2 for authenticated user');
        setStep(2);
      }
    }
  }, [sessionStatus, session, room, step, isRoomAvailable]);

  const handleSignContract = async () => {
    setIsProcessing(true);
    try {
      // Update role from guest to tenant
      await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole: 'tenant' })
      });
      
      // Navigate to Check-in step
      setStep(4);
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการลงนามสัญญา');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBooking = async () => {
    setIsProcessing(true);
    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...room,
          status: 'Reserved'
        })
      });
      setStep(3);
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการจอง');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = async () => {
    setIsProcessing(true);
    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...room,
          status: 'Occupied'
        })
      });
      router.push(`/explore/${room.dorm_id}?success=true`);
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการย้ายเข้า');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-display uppercase tracking-widest text-[10px] animate-pulse">กำลังเตรียมห้องพักแด่คุณ...</div>;
  if (!room) return <div className="h-screen flex items-center justify-center">ไม่พบข้อมูลห้องพัก</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-24">
      {/* Back to Rooms */}
      <Link href={`/explore/${room.dorm_id}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l-7 7m7-7H3" /></svg>
        กลับไปเลือกห้องพัก
      </Link>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center mb-16 lg:mb-24 px-4 overflow-x-auto">
        {[
          { id: 1, name: 'Inquiry', label: 'สอบถาม' },
          { id: 2, name: 'Booking', label: 'จองห้อง' },
          { id: 3, name: 'Contract', label: 'ทำสัญญา' },
          { id: 4, name: 'Check-in', label: 'ย้ายเข้า' }
        ].map((s, i) => (
          <div key={s.id} className="flex items-center shrink-0">
            <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${step >= s.id ? 'opacity-100' : 'opacity-30'}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border ${step >= s.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-black/20'}`}>
                 {s.id}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
            </div>
            {i < 3 && <div className={`w-12 md:w-24 h-px mx-4 transition-all duration-1000 ${step > s.id ? 'bg-primary' : 'bg-black/10'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
        {/* Visual Content (Left Sidebar) */}
        <div className="lg:col-span-7 space-y-12">
           <div className="relative aspect-[4/3] rounded-[4rem] overflow-hidden shadow-2xl group">
             <Image 
               src={room.image_url || '/modern_dorm_room_2_1775739199686.png'} 
               alt={room.room_number} 
               fill 
               className="object-cover transition-transform duration-1000 group-hover:scale-105"
             />
             <div className="absolute top-8 left-8">
               <span className="px-6 py-2.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                 Room {room.room_number}
               </span>
             </div>
           </div>
           
           <div className="space-y-6">
             <div className="flex items-center gap-4">
               <span className="px-4 py-1.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest leading-none pt-2">{room.room_type}</span>
               <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Floor {room.floor} · Minimal Art Living</span>
             </div>
             <h2 className="text-4xl font-display font-black tracking-tighter italic">พื้นที่ที่ออกแบบมาเพื่ออิสระภาพ</h2>
             <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl">
               ห้องพักที่เป็นเอกลักษณ์พร้อมสิ่งอำนวยความสะดวกครบครัน สภาพแวดล้อมที่เงียบสงบเหมาะแก่การพักผ่อนและสร้างสรรค์สิ่งใหม่ๆ
             </p>
           </div>
        </div>

        {/* Action Content (Right Sidebar) */}
        <div className="lg:col-span-5 relative">
          <div className="bg-white rounded-[3rem] p-10 lg:p-14 border border-black/5 shadow-2xl relative overflow-hidden">
             {/* Step 1: Info & Inquiry */}
             {step === 1 && (
               <div className="animateIn-slideup">
                 <h3 className="text-2xl font-display font-black tracking-tight mb-2">สอบถามเพิ่มเติม</h3>
                 <p className="text-muted-foreground text-sm font-medium mb-10">เช็คสถานะห้องและนัดวันดูห้องพักจริงได้ที่นี่</p>
                 
                 <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-center py-4 border-b border-black/5">
                       <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">สถานะปัจจุบัน</span>
                       <span className={`text-xs font-black uppercase tracking-widest ${isRoomAvailable ? 'text-primary' : 'text-rose-500'}`}>
                          {isRoomAvailable ? 'ว่างพร้อมจอง' : 'ติดจองแล้ว'}
                       </span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-black/5">
                       <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">ค่าเช่ารายเดือน</span>
                       <span className="text-xl font-display font-black tracking-tight">฿{Number(room.price).toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                   {sessionStatus === 'loading' ? (
                      <div className="w-full py-5 bg-black/5 animate-pulse rounded-full text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Checking Authentication...
                      </div>
                   ) : sessionStatus === 'authenticated' ? (
                      <button 
                        onClick={() => setStep(2)}
                        disabled={!isRoomAvailable}
                        className={`w-full py-5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${isRoomAvailable ? 'bg-primary text-primary-foreground hover:scale-[1.02] shadow-xl shadow-primary/20' : 'bg-black/5 text-muted-foreground cursor-not-allowed'}`}
                      >
                        {isRoomAvailable ? 'จองเลย' : 'ห้องนี้ถูกจองแล้ว'}
                      </button>
                   ) : (
                      <Link 
                        href={`/signin?callbackUrl=/explore/room/${roomId}`}
                        className="w-full py-5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-black/20 transition-all text-center block"
                      >
                        เข้าสู่ระบบเพื่อจองเลย
                      </Link>
                   )}
                   <button className="w-full py-5 bg-white border border-black/10 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black/5 transition-all">นัดดูห้องพักจริง</button>
                 </div>
               </div>
             )}

             {/* Step 2: Booking Details */}
             {step === 2 && (
               <div className="animateIn-slideup">
                 <h3 className="text-2xl font-display font-black tracking-tight mb-2">ระบุข้อมูลผู้จอง</h3>
                 <p className="text-muted-foreground text-sm font-medium mb-10">ขั้นตอนที่ 1: วางเงินจองและล็อกห้องพัก</p>
                 
                 <div className="space-y-6 mb-12">
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-3">ชื่อ-นามสกุล</label>
                     <input 
                       type="text" 
                       className="w-full px-6 py-4 rounded-2xl bg-black/5 border border-transparent focus:border-primary focus:bg-white outline-none font-bold text-sm transition-all"
                       placeholder="สมชาย ใจดี"
                       value={bookingData.name}
                       onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-3">เบอร์โทรศัพท์ติดต่อ</label>
                     <input 
                       type="tel" 
                       className="w-full px-6 py-4 rounded-2xl bg-black/5 border border-transparent focus:border-primary focus:bg-white outline-none font-bold text-sm transition-all"
                       placeholder="081-XXX-XXXX"
                       value={bookingData.phone}
                       onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                     />
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white border border-black/10 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black/5 transition-all">ย้อนกลับ</button>
                   <button 
                     onClick={handleBooking}
                     disabled={!bookingData.name || !bookingData.phone || isProcessing}
                     className="flex-[2] py-5 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                   >
                     {isProcessing ? 'กำลังดำเนินการ...' : 'ชำระเงินจอง ฿1,000'}
                   </button>
                 </div>
               </div>
             )}

             {/* Step 3: Contract */}
             {step === 3 && (
               <div className="animateIn-slideup">
                 <h3 className="text-2xl font-display font-black tracking-tight mb-2">สัญญาเช่าดิจิทัล</h3>
                 <p className="text-muted-foreground text-sm font-medium mb-6">ขั้นตอนที่ 2: ตกลงเงื่อนไขและจ่ายเงินล่วงหน้า</p>
                 
                 <div className="bg-black/5 p-6 rounded-3xl mb-10 space-y-4 max-h-48 overflow-y-auto border border-black/5">
                    <p className="text-[10px] leading-relaxed font-bold uppercase tracking-widest opacity-40">Contract Agreement Summary</p>
                    <p className="text-xs font-medium leading-relaxed">
                       1. ค่าเช่ารายเดือน: ฿{Number(room.price).toLocaleString()} <br/>
                       2. เงินประกันความเสียหาย: ฿{Number(room.price) * 2} <br/>
                       3. ระยะสัญญาขั้นต่ำ: 12 เดือน <br/>
                       4. ผู้เช่าตกลงชำระเงินล่วงหน้า 1 เดือนเป็นต้น...
                    </p>
                 </div>

                 <div className="space-y-3 mb-12">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ยอดชำระก่อนย้ายเข้า</span>
                       <span className="text-xl font-display font-black tracking-tight">฿{(Number(room.price) * 3).toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={handleSignContract} 
                      disabled={isProcessing}
                      className="w-full py-5 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all font-display disabled:opacity-50"
                    >
                      {isProcessing ? 'กำลังดำเนินการ...' : 'ลงนามสัญญาและชำระส่วนที่เหลือ'}
                    </button>
                 </div>
               </div>
             )}

             {/* Step 4: Check-in */}
             {step === 4 && (
               <div className="animateIn-slideup">
                 <h3 className="text-2xl font-display font-black tracking-tight mb-2">ส่งมอบห้อง</h3>
                 <p className="text-muted-foreground text-sm font-medium mb-10">ขั้นตอนที่ 3: ตรวจสอบห้องและย้ายเข้า</p>
                 
                 <div className="space-y-6 mb-12">
                   {[
                     'จดมิเตอร์ไฟฟ้า: 1,240 หน่วย',
                     'จดมิเตอร์น้ำ: 345 หน่วย',
                     'ตรวจสอบสภาพเฟอร์นิเจอร์: ปกติ',
                     'รับกุญแจและคีย์การ์ด: เรียบร้อย'
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 py-3 border-b border-black/5">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                           </svg>
                        </div>
                        <span className="text-xs font-bold">{item}</span>
                     </div>
                   ))}
                 </div>

                 <button 
                   onClick={handleCheckIn}
                   disabled={isProcessing}
                   className="w-full py-5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-black/20 transition-all"
                 >
                   {isProcessing ? 'กำลังบันทึกข้อมูล...' : 'เสร็จสมบูรณ์ และเข้าพัก'}
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animateIn-slideup { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
    </div>
  );
}
