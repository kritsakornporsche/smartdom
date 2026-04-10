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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

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

  return (
    <div className="min-h-screen bg-background px-6 lg:px-12 py-12 lg:py-24 max-w-7xl mx-auto">
      <Link href="/explore" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12 group">
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l-7 7m7-7H3" /></svg>
        ย้อนกลับไปเลือกหอพัก
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 animate-reveal">
        <div className="space-y-6">
           <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter italic text-foreground ornament">{dormName}</h1>
           <p className="text-muted-foreground font-black text-lg flex items-center gap-3">
             <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
             สัมผัสประสบการณ์การพักผ่อนที่เหนือระดับ
           </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex p-2 bg-secondary rounded-[2.5rem] border border-border shadow-sm">
            {['All', 'Standard', 'Deluxe', 'Suite'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-white text-foreground shadow-xl premium-shadow' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${showAvailableOnly ? 'bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20 scale-105' : 'bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'}`}
          >
            {showAvailableOnly ? '✓ เฉพาะห้องว่าง' : 'แสดงเฉพาะห้องว่าง'}
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-border mb-16" />

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
                  src={room.image_url || '/modern_dorm_room_2_1775739199686.png'} 
                  alt={room.room_number} 
                  fill 
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-95 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="relative z-10 mt-auto p-12 text-white">
                 <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">
                      Floor {room.floor}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${room.status === 'Available' || room.status === 'ว่าง' ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/10 text-white/60 border-white/20'}`}>
                      {room.status === 'Available' || room.status === 'ว่าง' ? 'Available' : 'Reserved'}
                    </span>
                 </div>
                 
                 <h3 className="text-4xl font-display font-black tracking-tight mb-3 leading-tight group-hover:text-primary transition-colors">Room {room.room_number}</h3>
                 <p className="text-white/80 font-black mb-10 text-[10px] uppercase tracking-[0.2em] drop-shadow-sm">
                   {room.room_type} · Minimal Living Ecosystem
                 </p>
                 
                 <div className="flex items-center justify-between border-t border-white/10 pt-10">
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Monthly Rent</span>
                       <span className="text-3xl font-display font-black tracking-tight">฿{Number(room.price).toLocaleString()} <span className="text-xs font-black text-white/40">/mo</span></span>
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
