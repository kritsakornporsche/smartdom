'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Room {
  id: number;
  room_number: string;
  room_type: string;
  price: string;
  status: string;
  floor: number;
  image_url: string | null;
  display_status?: string;
  move_out_date?: string | null;
  move_out_status?: string | null;
}

export default function GuestDormRoomsPage({ params }: { params: Promise<{ dormId: string }> }) {
  const resolvedParams = use(params);
  const dormId = resolvedParams.dormId;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormName, setDormName] = useState('...');
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'available' | 'moving_out'>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch dorm info
        const dRes = await fetch('/api/dorms');
        const dData = await dRes.json();
        if (dData.success) {
           const d = dData.data.find((item: any) => item.id.toString() === dormId);
           if (d) setDormName(d.name);
        }

        // Fetch rooms for this dorm with explore filter enabled
        const res = await fetch(`/api/rooms?dormId=${dormId}&explore=true`);
        const data = await res.json();
        if (data.success) {
          setRooms(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dormId]);

  // Determine if room is strictly available or moving out
  const isAvailable = (room: Room) => {
    return room.display_status === 'Available' || room.status === 'Available' || room.status === 'ว่าง';
  };

  const isMovingOut = (room: Room) => {
    return (
      room.display_status === 'MovingOut' ||
      room.status === 'MovingOut' ||
      room.status === 'Moving Out' ||
      room.status === 'กำลังจะย้ายออก' ||
      Boolean(room.move_out_date)
    );
  };

  // Filter only rooms that are either Available OR Moving Out
  const validRooms = rooms.filter(r => isAvailable(r) || isMovingOut(r));

  const filteredRooms = validRooms.filter(r => {
    if (filterTab === 'available') return isAvailable(r);
    if (filterTab === 'moving_out') return isMovingOut(r);
    return true;
  });

  const availableCount = validRooms.filter(isAvailable).length;
  const movingOutCount = validRooms.filter(isMovingOut).length;

  const getFirstImage = (imageParam: string | null) => {
    if (!imageParam) return '/modern_dorm_room_2_1775739199686.png';
    try {
      if (imageParam.startsWith('[') && imageParam.endsWith(']')) {
        const images = JSON.parse(imageParam);
        return images[0] || '/modern_dorm_room_2_1775739199686.png';
      }
      return imageParam;
    } catch (e) {
      return imageParam;
    }
  };

  const formatMoveOutDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto">
      <Link href="/explore" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12 group">
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l-7 7m7-7H3" /></svg>
        ย้อนกลับไปเลือกหอพัก
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 animate-reveal">
        <div className="space-y-4">
           <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black tracking-tighter italic text-foreground ornament break-words">{dormName}</h1>
           <p className="text-muted-foreground font-black text-lg flex items-center gap-3">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             รายการห้องว่างและห้องที่กำลังจะย้ายออก (เปิดรับจอง)
           </p>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/60 dark:bg-card border border-border rounded-full shadow-inner">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              filterTab === 'all'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ทั้งหมด ({validRooms.length})
          </button>
          <button
            onClick={() => setFilterTab('available')}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              filterTab === 'available'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ว่างพร้อมอยู่ ({availableCount})
          </button>
          <button
            onClick={() => setFilterTab('moving_out')}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              filterTab === 'moving_out'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            กำลังจะย้ายออก ({movingOutCount})
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-border mb-12" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[4/5] sm:aspect-[3.5/5.5] rounded-[3rem] sm:rounded-[4rem] bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-24 px-6 bg-card border border-border rounded-[3rem] shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">ยังไม่มีห้องพักที่ตรงกับเงื่อนไข</h3>
            <p className="text-muted-foreground text-sm font-medium">
              {filterTab === 'available' 
                ? 'ขณะนี้ยังไม่มีห้องว่างพร้อมอยู่ ลองดูห้องที่กำลังจะย้ายออกหรือเลือกหอพักอื่น'
                : filterTab === 'moving_out'
                ? 'ขณะนี้ยังไม่มีห้องที่กำลังจะย้ายออก'
                : 'ขณะนี้ไม่มีห้องว่างหรือห้องที่กำลังจะย้ายออกสำหรับหอพักนี้'}
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => setFilterTab('all')}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              ดูห้องทั้งหมด
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredRooms.map((room) => {
            const roomIsAvailable = isAvailable(room);
            const moveOutFormatted = formatMoveOutDate(room.move_out_date);

            return (
              <Link 
                href={`/explore/room/${room.id}`} 
                key={room.id}
                className="group relative flex flex-col aspect-[4/5] sm:aspect-[3.5/5.5] rounded-[3rem] sm:rounded-[4rem] overflow-hidden bg-white dark:bg-card border border-border shadow-2xl transition-all duration-700 hover:-translate-y-4 premium-shadow"
              >
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={getFirstImage(room.image_url)} 
                    alt={room.room_number} 
                    fill 
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-95 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="relative z-10 mt-auto p-8 sm:p-12 text-white">
                   <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">
                        Floor {room.floor}
                      </span>
                      
                      {roomIsAvailable ? (
                        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          ว่าง พร้อมเข้าอยู่
                        </span>
                      ) : (
                        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                          กำลังจะย้ายออก (จองล่วงหน้า)
                        </span>
                      )}
                   </div>
                   
                   <h3 className="text-4xl font-display font-black tracking-tight mb-2 leading-tight group-hover:text-primary transition-colors">
                     Room {room.room_number}
                   </h3>

                   <div className="space-y-1 mb-8">
                     <p className="text-white/80 font-black text-[10px] uppercase tracking-[0.2em] drop-shadow-sm">
                       {room.room_type} · Minimal Living Ecosystem
                     </p>
                     {!roomIsAvailable && moveOutFormatted && (
                       <p className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         พร้อมเข้าอยู่หลัง {moveOutFormatted}
                       </p>
                     )}
                   </div>
                   
                   <div className="flex items-center justify-between border-t border-white/10 pt-8">
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Monthly Rent</span>
                         <span className="text-3xl font-display font-black tracking-tight">฿{Number(room.price).toLocaleString()} <span className="text-xs font-black text-white/40">/mo</span></span>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-secondary flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-2xl group-hover:scale-110 group-hover:rotate-12">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
