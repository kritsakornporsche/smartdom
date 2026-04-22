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
}

export default function GuestDormRoomsPage({ params }: { params: Promise<{ dormId: string }> }) {
  const resolvedParams = use(params);
  const dormId = resolvedParams.dormId;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormName, setDormName] = useState('...');
  const [dormInfo, setDormInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const dRes = await fetch('/api/dorms');
        const dData = await dRes.json();
        if (dData.success) {
           const d = dData.data.find((item: any) => item.id.toString() === dormId);
           if (d) {
             setDormName(d.name);
             setDormInfo(d);
           }
        }

        // Fetch rooms for this dorm
        const res = await fetch(`/api/rooms?dormId=${dormId}`);
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

  const filteredRooms = rooms.filter(r => {
    const typeMatch = filter === 'All' || r.room_type === filter;
    const statusMatch = !showAvailableOnly || (r.status === 'Available' || r.status === 'ว่าง');
    return typeMatch && statusMatch;
  });

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

  return (
    <div className="min-h-screen bg-background px-6 lg:px-12 py-12 lg:py-24 max-w-7xl mx-auto">
      <Link href="/explore" className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-12 group">
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l-7 7m7-7H3" /></svg>
        ย้อนกลับไปเลือกหอพัก
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 animate-reveal">
        <div className="space-y-6">
           <h1 className="text-3xl lg:text-3xl font-display font-bold tracking-tighter italic text-foreground ornament">{dormName}</h1>
           <p className="text-muted-foreground font-bold text-lg flex items-center gap-3">
             <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
             สัมผัสประสบการณ์การพักผ่อนที่เหนือระดับ
           </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex p-2 bg-secondary rounded-[2.5rem] border border-border shadow-sm">
            {['ทั้งหมด', 'Standard', 'Deluxe', 'Suite'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t === 'ทั้งหมด' ? 'All' : t)}
                className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${((filter === 'All' && t === 'ทั้งหมด') || filter === t) ? 'bg-white text-foreground shadow-xl premium-shadow' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            className={`px-10 py-4 rounded-full text-sm font-bold uppercase tracking-wider transition-all border ${showAvailableOnly ? 'bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20 scale-105' : 'bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'}`}
          >
            {showAvailableOnly ? '✓ เฉพาะห้องว่าง' : 'ดูเฉพาะห้องว่าง'}
          </button>
        </div>
      </div>

      {dormInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20 animate-reveal" style={{ animationDelay: '0.1s' }}>
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase text-primary mb-6">รายละเอียด & สิ่งอำนวยความสะดวก</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-white border border-border shadow-sm hover:-translate-y-1 transition-transform">
                  <div className="text-primary mb-3">
                    <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">ค่าไฟ</p>
                  <p className="text-lg font-bold text-foreground">{dormInfo.electricity_rate} <span className="text-sm font-medium">บาท/หน่วย</span></p>
                </div>
                <div className="p-6 rounded-[2rem] bg-white border border-border shadow-sm hover:-translate-y-1 transition-transform">
                  <div className="text-primary mb-3">
                    <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">ค่าน้ำ</p>
                  <p className="text-lg font-bold text-foreground">{dormInfo.water_rate} <span className="text-sm font-medium">บาท/หน่วย</span></p>
                </div>
                {dormInfo.has_wifi && (
                <div className="p-6 rounded-[2rem] bg-white border border-border shadow-sm hover:-translate-y-1 transition-transform">
                  <div className="text-primary mb-3">
                    <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.906 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">อินเทอร์เน็ต</p>
                  <p className="text-lg font-bold text-foreground">มี Wi-Fi บริการ</p>
                </div>
                )}
                {dormInfo.has_parking && (
                <div className="p-6 rounded-[2rem] bg-white border border-border shadow-sm hover:-translate-y-1 transition-transform">
                  <div className="text-primary mb-3">
                    <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">ที่จอดรถ</p>
                  <p className="text-lg font-bold text-foreground">ลานจอดรถฟรี</p>
                </div>
                )}
                <div className="p-6 rounded-[2rem] bg-white border border-border shadow-sm hover:-translate-y-1 transition-transform">
                  <div className="text-primary mb-3">
                    <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">สัตว์เลี้ยง</p>
                  <p className="text-lg font-bold text-foreground">{dormInfo.pet_friendly ? 'อนุญาต (หมา/แมว)' : 'ไม่อนุญาต'}</p>
                </div>
              </div>
            </div>

            {dormInfo.facilities && (
            <div className="animate-reveal" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-sm font-bold tracking-wider uppercase text-primary mb-4">พื้นที่ส่วนกลางและสวัสดิการอื่นๆ</h3>
              <p className="text-[17px] text-foreground/80 leading-[1.8] bg-white p-8 rounded-[2rem] border border-border shadow-sm font-medium">
                {dormInfo.facilities}
              </p>
            </div>
            )}
          </div>

          <div className="lg:col-span-1 animate-reveal" style={{ animationDelay: '0.3s' }}>
             <h2 className="text-sm font-bold tracking-wider uppercase text-primary mb-6">แผนที่และการเดินทาง</h2>
             <div className="w-full aspect-square rounded-[3rem] overflow-hidden bg-white border border-border shadow-lg relative premium-shadow">
               {dormInfo.map_url && dormInfo.map_url.includes('http') ? (
                 <iframe 
                   src={dormInfo.map_url} 
                   width="100%" 
                   height="100%" 
                   style={{ border: 0 }} 
                   allowFullScreen 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade"
                   className="absolute inset-0 w-full h-full"
                 />
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3 bg-secondary/30">
                   <svg className="w-8 h-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   <span className="font-bold text-sm tracking-widest uppercase">ไม่พบข้อมูลแผนที่</span>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-6 mb-12">
         <h2 className="text-sm font-bold tracking-wider uppercase text-primary">รายการห้องพัก</h2>
         <div className="h-px flex-1 bg-border" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[3.5/5.5] rounded-[4rem] bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredRooms.map((room) => (
            <Link 
              href={`/explore/room/${room.id}`} 
              key={room.id}
              className="group relative flex flex-col aspect-[3.5/5.5] rounded-[4rem] overflow-hidden bg-white border border-border shadow-2xl transition-all duration-700 hover:-translate-y-4 premium-shadow"
            >
              <div className="absolute inset-0 z-0">
                <Image 
                  src={getFirstImage(room.image_url)} 
                  alt={room.room_number} 
                  fill 
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-95 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="relative z-10 mt-auto p-12 text-white">
                 <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                      ชั้นที่ {room.floor}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${room.status === 'Available' || room.status === 'ว่าง' ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/10 text-white/60 border-white/20'}`}>
                      {room.status === 'Available' || room.status === 'ว่าง' ? 'ว่าง' : 'จองแล้ว'}
                    </span>
                 </div>
                 
                 <h3 className="text-2xl font-display font-bold tracking-tight mb-3 leading-tight group-hover:text-primary transition-colors">ห้อง {room.room_number}</h3>
                 <p className="text-white/80 font-bold mb-6 text-sm uppercase tracking-wide drop-shadow-sm">
                   {room.room_type} · ระบบนิเวศน์เพื่อการผ่อนคลาย
                 </p>
                 
                 {(room as any).amenities && Array.isArray((room as any).amenities) && (room as any).amenities.length > 0 && (
                   <div className="mb-8 flex flex-wrap gap-2">
                     {(room as any).amenities.slice(0, 3).map((amn: string, idx: number) => (
                       <span key={idx} className="px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/10 text-white/90">
                         {amn}
                       </span>
                     ))}
                     {(room as any).amenities.length > 3 && (
                       <span className="px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/10 text-white/90">
                         +{(room as any).amenities.length - 3}
                       </span>
                     )}
                   </div>
                 )}
                 
                 <div className="flex items-center justify-between border-t border-white/10 pt-10 mt-auto">
                    <div className="flex flex-col gap-1">
                       <span className="text-sm font-bold uppercase tracking-wider text-white/50">ค่าเช่ารายเดือน</span>
                       <span className="text-3xl font-display font-bold tracking-tight">฿{Number(room.price).toLocaleString()} <span className="text-xs font-bold text-white/40">/เดือน</span></span>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-2xl group-hover:scale-110 group-hover:rotate-12">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
