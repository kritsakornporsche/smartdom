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

  const filteredRooms = filter === 'All' ? rooms : rooms.filter(r => r.room_type === filter);

  return (
    <div className="min-h-screen px-6 lg:px-12 py-12 lg:py-24 max-w-7xl mx-auto">
      <Link href="/explore" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l-7 7m7-7H3" /></svg>
        ย้อนกลับไปเลือกหอพัก
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
           <h1 className="text-4xl lg:text-5xl font-display font-black tracking-tighter italic">{dormName}</h1>
           <p className="text-muted-foreground font-medium flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-primary rounded-full" />
             สัมผัสประสบการณ์การพักผ่อนที่เหนือระดับ
           </p>
        </div>
        
        <div className="flex p-1.5 bg-black/5 rounded-[2rem] border border-black/5 backdrop-blur-sm self-start">
          {['All', 'Standard', 'Deluxe', 'Suite'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-white text-black shadow-xl shadow-black/5' : 'text-muted-foreground hover:text-black'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[3.5/5] rounded-[3rem] bg-black/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredRooms.map((room) => (
            <Link 
              href={`/explore/room/${room.id}`} 
              key={room.id}
              className="group relative flex flex-col aspect-[3.5/5] rounded-[3rem] overflow-hidden bg-white border border-black/5 shadow-2xl transition-all duration-700 hover:-translate-y-2"
            >
              <div className="absolute inset-0 z-0">
                <Image 
                  src={room.image_url || '/modern_dorm_room_2_1775739199686.png'} 
                  alt={room.room_number} 
                  fill 
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
              </div>
              
              <div className="relative z-10 mt-auto p-10 text-white">
                 <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                      Floor {room.floor}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${room.status === 'Available' ? 'bg-primary/20 text-primary border-primary/20' : 'bg-white/10 text-white/40 border-white/10'}`}>
                      {room.status === 'Available' ? 'Available' : 'Reserved'}
                    </span>
                 </div>
                 
                 <h3 className="text-3xl font-display font-black tracking-tight mb-2">Room {room.room_number}</h3>
                 <p className="text-white/60 font-medium mb-8 text-sm uppercase tracking-widest blur-0 group-hover:blur-[0.5px] transition-all">
                   {room.room_type} · Minimal Living
                 </p>
                 
                 <div className="flex items-center justify-between border-t border-white/10 pt-8">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Starting from</span>
                       <span className="text-2xl font-display font-black tracking-tight">฿{Number(room.price).toLocaleString()} <span className="text-xs font-medium text-white/40">/mo</span></span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500 shadow-xl shadow-black/20">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
