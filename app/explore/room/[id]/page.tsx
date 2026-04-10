'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatWidget from '@/app/components/ChatWidget';
import ContractSimulator from '@/app/components/ContractSimulator';
import ContractSigner from '@/app/components/ContractSigner';

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
  const [showSimulator, setShowSimulator] = useState(false);

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
        // Only override if data is empty (to avoid overwriting loaded progress)
        name: prev.name || session.user?.name || '',
        email: prev.email || session.user?.email || '',
      }));
      
      /* 
      // User requested to stay at Inquiry step (Step 1) initially
      // Force jump to Step 2 if in Step 1 and room is available
      if (step === 1 && room && isRoomAvailable) {
        console.log('Auto-jumping to Step 2 for authenticated user');
        setStep(2);
      }
      */
    }
  }, [sessionStatus, session, room, step, isRoomAvailable]);

  // Fetch saved progress on mount
  useEffect(() => {
    async function fetchProgress() {
      if (sessionStatus === 'authenticated' && session?.user?.email && roomId) {
        try {
          const res = await fetch(`/api/booking/progress?roomId=${roomId}`);
          const data = await res.json();
          if (data.success && data.data) {
            console.log('Restoring saved progress:', data.data);
            
            // Restore step only if they have already made a commitment (Step 3: Contract+)
            // Otherwise, always start at Step 1 (Inquiry) as requested
            if (data.data.current_step > 2) {
              setStep(data.data.current_step);
            } else {
              setStep(1); // Force Step 1 for fresh inquiries/early bookings
            }
            
            setBookingData(data.data.booking_data);
          }
        } catch (e) {
          console.error('[Fetch Progress Error]', e);
        }
      }
    }
    fetchProgress();
  }, [sessionStatus, session, roomId]);

  // Save progress whenever step or data changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (sessionStatus === 'authenticated' && step > 1 && roomId) {
        try {
          await fetch('/api/booking/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: parseInt(roomId),
              currentStep: step,
              bookingData
            })
          });
        } catch (e) {
          console.error('[Save Progress Error]', e);
        }
      }
    }, 1000); // Debounce save
    return () => clearTimeout(timer);
  }, [step, bookingData, sessionStatus, roomId]);

  const handleSignContract = async (signature: string) => {
    setIsProcessing(true);
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDateDate = new Date();
      endDateDate.setFullYear(endDateDate.getFullYear() + 1);
      const endDate = endDateDate.toISOString().split('T')[0];

      // 1. Save Contract to database
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: parseInt(roomId),
          signature,
          startDate,
          endDate,
          depositAmount: Number(room.price) * 2,
          monthlyRent: Number(room.price),
          tenantName: bookingData.name
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // 2. Update role from guest to tenant
      await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole: 'tenant' })
      });
      
      // Navigate to Check-in step
      setStep(4);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'เกิดข้อผิดพลาดในการลงนามสัญญา');
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
      // Final room update
      await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...room,
          status: 'Occupied'
        })
      });

      // Also ensure role is updated to tenant if not already
      await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole: 'tenant' })
      });
      
      // Clear booking progress
      await fetch('/api/booking/progress', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: parseInt(roomId) })
      });
      
      // Redirect to tenant dashboard
      router.push('/tenant');
      router.refresh();
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการย้ายเข้า');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-display uppercase tracking-widest text-[10px] animate-pulse">Loading...</div>;
  if (!room) return <div className="h-screen flex items-center justify-center font-display uppercase tracking-widest text-[10px]">Room not found</div>;

  const contractStartDate = new Date().toISOString().split('T')[0];
  const contractEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  const totalDeposit = Number(room.price) * 2;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-24">
        <Link href={`/explore/${room.dorm_id}`} className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-16 group">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l-7 7m7-7H3" /></svg>
          กลับไปเลือกห้องพัก
        </Link>

        <div className="flex items-center justify-center mb-24 lg:mb-32 px-4 overflow-x-auto pb-4">
          {[
            { id: 1, name: 'Inquiry', label: 'สอบถาม' },
            { id: 2, name: 'Booking', label: 'จองห้อง' },
            { id: 3, name: 'Contract', label: 'ทำสัญญา' },
            { id: 4, name: 'Check-in', label: 'ย้ายเข้า' }
          ].map((s, i) => (
            <div key={s.id} className="flex items-center shrink-0">
              <div className={`flex flex-col items-center gap-4 transition-all duration-700 ${step >= s.id ? 'opacity-100 scale-110' : 'opacity-20 translate-y-2'}`}>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black border-2 transition-all duration-500 rotate-45 ${step >= s.id ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20' : 'bg-transparent border-border'}`}>
                   <span className="-rotate-45">{s.id}</span>
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 transition-colors duration-500 ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
              {i < 3 && <div className={`w-16 md:w-28 h-0.5 mx-6 transition-all duration-1000 rounded-full ${step > s.id ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 items-start">
          <div className="lg:col-span-7 space-y-16 animate-reveal">
             <div className="relative aspect-[4/3] rounded-[5rem] overflow-hidden shadow-2xl group premium-shadow">
               <Image 
                 src={room.image_url || '/modern_dorm_room_2_1775739199686.png'} 
                 alt={room.room_number} 
                 fill 
                 className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
               />
               <div className="absolute top-10 left-10">
                 <div className="px-8 py-3 bg-white/20 backdrop-blur-xl rounded-full text-[11px] font-black uppercase tracking-widest text-white border border-white/20 shadow-2xl">
                   Room {room.room_number}
                 </div>
               </div>
             </div>
             
             <div className="space-y-10">
               <div className="flex items-center gap-6">
                 <span className="px-6 py-2.5 bg-foreground text-background rounded-full text-[10px] font-black uppercase tracking-widest leading-none pt-3">{room.room_type}</span>
                 <div className="h-4 w-px bg-border" />
                 <span className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em]">Floor {room.floor} · Minimal Art Living</span>
               </div>
               <h2 className="text-5xl lg:text-7xl font-display font-black tracking-tighter italic text-foreground ornament leading-[0.9]">พื้นที่ที่ออกแบบมาเพื่ออิสระภาพ</h2>
               <p className="text-muted-foreground font-black text-xl leading-relaxed max-w-3xl">
                 ห้องพักที่เป็นเอกลักษณ์พร้อมสิ่งอำนวยความสะดวกครบครัน สภาพแวดล้อมที่เงียบสงบเหมาะแก่การพักผ่อนและสร้างสรรค์สิ่งใหม่ๆ
               </p>
               <div className="h-px w-20 bg-primary/30" />
             </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-[4rem] p-12 lg:p-16 border border-border shadow-2xl relative overflow-hidden premium-shadow">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                
                {step === 1 && (
                  <div className="animateIn-slideup space-y-10">
                    <div>
                      <h3 className="text-3xl font-display font-black tracking-tight mb-3 text-foreground ornament">สอบถามเพิ่มเติม</h3>
                      <p className="text-muted-foreground text-sm font-black uppercase tracking-widest opacity-60">ช่องทางติดต่อเจ้าหน้าที่และข้อมูลโครงการ</p>
                    </div>
                    
                    <div className="space-y-6">
                       <div className="p-8 bg-secondary rounded-[3rem] border border-border shadow-sm group hover:border-primary/20 transition-colors">
                          <div className="flex items-center gap-6 mb-6">
                             <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-lg border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 rotate-6 group-hover:rotate-12">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Dormitory Office</p>
                                <p className="text-lg font-black text-foreground">{room.dorm_phone || '02-123-4567'}</p>
                             </div>
                          </div>
                          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">{room.dorm_address}</p>
                       </div>

                       <div className="p-8 bg-primary/[0.03] rounded-[3rem] border border-primary/10 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                          </div>
                          <div className="flex items-center gap-6 relative z-10">
                             <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 border-2 border-white">
                                {room.keeper_name ? room.keeper_name[0] : 'K'}
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">ผู้ดูแลหอพัก (Caretaker)</p>
                                <p className="text-lg font-black text-foreground">{room.keeper_name || 'คุณเจ้าหน้าที่'}</p>
                                <p className="text-xs font-black text-muted-foreground uppercase opacity-70">{room.keeper_phone || '08X-XXX-XXXX'}</p>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-2">
                         <div className="flex justify-between items-center py-5 border-b border-border">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">สถานะปัจจุบัน</span>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isRoomAvailable ? 'bg-primary' : 'bg-rose-500'} animate-pulse`} />
                              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isRoomAvailable ? 'text-primary' : 'text-rose-500'}`}>
                                 {isRoomAvailable ? 'ว่างพร้อมจอง' : 'ติดจองแล้ว'}
                              </span>
                            </div>
                         </div>
                         <div className="flex justify-between items-center py-5">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">ค่าเช่ารายเดือน</span>
                            <span className="text-3xl font-display font-black tracking-tight text-foreground">฿{Number(room.price).toLocaleString()}</span>
                         </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { l: 'พื้นที่ใช้สอย', v: '28-32 ตร.ม.' },
                        { l: 'ระเบียง', v: 'มีส่วนตัว' },
                        { l: 'เฟอร์นิเจอร์', v: 'ครบชุด' },
                        { l: 'สัตว์เลี้ยง', v: 'ไม่อนุญาต' }
                      ].map((h, i) => (
                        <div key={i} className="p-5 bg-secondary/50 border border-border rounded-[2rem] hover:bg-white transition-colors duration-500">
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">{h.l}</p>
                           <p className="text-xs font-black text-foreground">{h.v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-6">
                      {sessionStatus === 'loading' ? (
                         <div className="w-full py-6 bg-muted animate-pulse rounded-full text-center text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                           Checking Authorization...
                         </div>
                      ) : (
                         <div className="flex flex-col gap-4">
                           <button 
                             onClick={() => {
                               const chatBtn = document.querySelector('button[class*="bg-primary"][class*="w-16"]') as HTMLButtonElement;
                               if (chatBtn) chatBtn.click();
                             }}
                             className="w-full py-6 bg-foreground text-background rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] shadow-2xl shadow-black/20 transition-all font-display hover:brightness-110 active:scale-95"
                           >
                             แชทสอบถามข้อมูลเพิ่มเติม
                           </button>

                           <button 
                             onClick={() => setShowSimulator(true)}
                             className="w-full py-6 bg-white text-muted-foreground border border-border rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:border-primary/40 hover:text-primary transition-all active:scale-95"
                           >
                             จำลองคำนวณค่าสัญญาเช่า
                           </button>
                           
                           {(session?.user as any)?.role === 'tenant' ? (
                             <div className="p-10 bg-primary/[0.05] rounded-[3.5rem] border border-primary/20 text-center space-y-4 shadow-sm animate-reveal">
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">การจองถูกปิดใช้งาน</p>
                               <p className="text-lg font-black text-foreground leading-tight">คุณมีสัญญาเช่าในระบบแล้ว</p>
                               <p className="text-[11px] font-black text-muted-foreground/60 leading-relaxed uppercase tracking-widest">
                                 หากต้องการย้ายห้องหรือสอบถามเพิ่มเติม <br/> โปรดติดต่อเจ้าหน้าที่ผ่านช่องทางแชท
                               </p>
                               <Link href="/tenant" className="inline-block mt-4 px-10 py-3 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 transition-all">
                                 ไปที่แดชบอร์ด
                               </Link>
                             </div>
                           ) : isRoomAvailable ? (
                             <button 
                               onClick={() => setStep(2)}
                               className="w-full py-6 bg-primary/20 text-primary hover:bg-primary/30 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                             >
                               ตกลงเช่า และเริ่มจองห้อง
                             </button>
                           ) : null}
                         </div>
                      )}
                   </div>
                 </div>
                )}

               {step === 2 && (
                 <div className="animateIn-slideup space-y-10">
                   <div>
                     <h3 className="text-3xl font-display font-black tracking-tight mb-3 text-foreground ornament">ระบุข้อมูลผู้จอง</h3>
                     <p className="text-muted-foreground text-sm font-black uppercase tracking-widest opacity-60">ขั้นตอนการจองและล็อกห้องพัก</p>
                   </div>
                   
                   <div className="space-y-8">
                     <div className="space-y-4">
                       <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-4">ชื่อ-นามสกุล</label>
                       <input 
                         type="text" 
                         className="w-full px-8 py-5 rounded-3xl bg-secondary border-2 border-transparent focus:border-primary focus:bg-white outline-none font-black text-sm transition-all shadow-sm"
                         placeholder="ระบุชื่อจริงตามบัตรประชาชน"
                         value={bookingData.name}
                         onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                       />
                     </div>
                     <div className="space-y-4">
                       <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-4">เบอร์โทรศัพท์ติดต่อ</label>
                       <input 
                         type="tel" 
                         className="w-full px-8 py-5 rounded-3xl bg-secondary border-2 border-transparent focus:border-primary focus:bg-white outline-none font-black text-sm transition-all shadow-sm"
                         placeholder="08X-XXX-XXXX"
                         value={bookingData.phone}
                         onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                       />
                     </div>
                   </div>

                   <div className="flex flex-col gap-4 pt-10">
                     <button 
                        onClick={handleBooking}
                        disabled={!bookingData.name || !bookingData.phone || isProcessing}
                        className="w-full py-6 bg-primary text-primary-foreground rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/30 transition-all disabled:opacity-50"
                      >
                        {isProcessing ? 'กำลังดำเนินการ...' : 'ชำระเงินจอง ฿1,000'}
                      </button>
                      <button onClick={() => setStep(1)} className="w-full py-4 text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-[0.3em] transition-all">ย้อนกลับ</button>
                   </div>
                 </div>
               )}

               {step === 3 && (
                 <div className="animateIn-slideup space-y-10">
                   <div>
                     <h3 className="text-3xl font-display font-black tracking-tight mb-3 text-foreground ornament">สัญญาเช่าดิจิทัล</h3>
                     <p className="text-muted-foreground text-sm font-black uppercase tracking-widest opacity-60">ตกลงเงื่อนไขและจ่ายเงินล่วงหน้า</p>
                   </div>
                   
                   <div className="bg-secondary p-8 rounded-[2.5rem] border border-border shadow-inner">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Contract Overview</p>
                      <div className="space-y-6 text-xs font-black text-foreground/80 leading-relaxed uppercase tracking-widest">
                         <div className="flex justify-between items-center gap-4 border-b border-border pb-4">
                           <span className="opacity-50">Monthly Rent</span>
                           <span>฿{Number(room.price).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center gap-4 border-b border-border pb-4">
                           <span className="opacity-50">Deposit (2mo)</span>
                           <span>฿{(Number(room.price) * 2).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center gap-4 border-b border-border pb-4">
                           <span className="opacity-50">Minimum Stay</span>
                           <span>12 Months</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 bg-primary/[0.03] rounded-[2.5rem] border border-primary/10">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">รวมยอดชำระแรกเข้า</span>
                         <span className="text-4xl font-display font-black tracking-tighter text-foreground">฿{(Number(room.price) * 3).toLocaleString()}</span>
                      </div>
                   </div>

                   <div className="py-6">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 text-center">ลงชื่อในช่องด้านล่างเพื่อยืนยันสัญญา</p>
                      <button 
                        className="w-full py-6 bg-primary text-primary-foreground rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.05] active:scale-95 shadow-2xl shadow-primary/30 transition-all font-display"
                      >
                        อ่านและลงนามสัญญาเช่า (Sign Contract)
                      </button>
                   </div>

                   <div className="pt-2">
                     <p className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Secure Digital Signature via SmartDom Ecosystem</p>
                   </div>
                 </div>
               )}

               {step === 4 && (
                 <div className="animateIn-slideup space-y-10">
                   <div>
                     <h3 className="text-3xl font-display font-black tracking-tight mb-3 text-foreground ornament">ส่งมอบห้องพัก</h3>
                     <p className="text-muted-foreground text-sm font-black uppercase tracking-widest opacity-60">ตรวจสอบสภาพห้องและย้ายเข้า</p>
                   </div>
                   
                   <div className="space-y-2">
                     {[
                       'จดมิเตอร์ไฟฟ้า: 1,240 หน่วย',
                       'จดมิเตอร์น้ำ: 345 หน่วย',
                       'ตรวจสอบสภาพเฟอร์นิเจอร์: เรียบร้อย',
                       'รับกุญแจและคีย์การ์ด: เรียบร้อย'
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-6 py-5 border-b border-border transition-all hover:bg-secondary/30 px-4 rounded-2xl group">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                             </svg>
                          </div>
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">{item}</span>
                       </div>
                     ))}
                   </div>

                   <div className="pt-8">
                     <button 
                       onClick={handleCheckIn}
                       disabled={isProcessing}
                       className="w-full py-6 bg-foreground text-background rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.05] active:scale-95 shadow-2xl shadow-black/30 transition-all hover:brightness-125"
                     >
                       {isProcessing ? 'กำลังบันทึกข้อมูล...' : 'เสร็จสมบูรณ์ และเข้าพัก'}
                     </button>
                     <p className="text-center mt-8 text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Welcome to your new home</p>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animateIn-slideup { animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) both; }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        `}</style>

        {room && <ChatWidget dormId={room.dorm_id} ownerName={room.owner_name} />}

        {step === 3 && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-12 overflow-y-auto bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
             <div className="max-w-5xl w-full">
                <ContractSigner 
                  tenantName={bookingData.name}
                  roomNumber={room.room_number}
                  monthlyRent={Number(room.price)}
                  depositAmount={totalDeposit}
                  startDate={contractStartDate}
                  endDate={contractEndDate}
                  onSign={handleSignContract} 
                  onCancel={() => setStep(2)}
                />
             </div>
          </div>
        )}

        {showSimulator && room && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 overflow-y-auto bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
             <div className="max-w-4xl w-full animate-reveal">
                <ContractSimulator 
                  initialPrice={Number(room.price)} 
                  roomNumber={room.room_number}
                  onClose={() => setShowSimulator(false)} 
                />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
