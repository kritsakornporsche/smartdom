'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';

interface Dormitory {
  id: number;
  name: string;
  address: string;
  phone: string;
  available_rooms_count: number;
  available_rooms_summary: string | null;
}

export default function GuestExploreDormsPage() {
  const [dorms, setDorms] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDorms() {
      try {
        const res = await fetch('/api/dorms');
        const data = await res.json();
        if (data.success) {
          setDorms(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDorms();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/luxury_dorm_building_1_1775739456274.png" 
            alt="Dormitory Building" 
            fill 
            className="object-cover brightness-[0.7]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 animate-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/20 mb-8 shadow-xl">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Ecosystem of Living
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-black tracking-tight text-white mb-8 leading-[0.9] ornament-light mx-auto max-w-4xl">
            เลือกหอพักที่ <span className="italic font-medium text-primary">ใช่ที่สุด</span> แด่คุณ
          </h1>
          <p className="max-w-2xl mx-auto text-white/90 font-bold text-lg mb-8 leading-relaxed">
            เริ่มต้นการค้นหาจากทำเลและหอพักที่คุณชื่นชอบ เพื่อพบกับห้องพักที่ออกแบบมาเพื่อคุณโดยเฉพาะ
          </p>
        </div>
      </section>

      {/* Dormitory Grid */}
      <section className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 mb-20 reveal-on-scroll active">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Our Locations</h2>
          <p className="text-4xl md:text-6xl font-display font-black tracking-tighter text-foreground ornament">หอพักคุณภาพในเครือ SmartDom</p>
          <div className="h-1 w-20 bg-primary/20 rounded-full" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2].map(i => (
              <div key={i} className="aspect-video rounded-[4rem] bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {dorms.map((dorm) => (
              <Link 
                href={`/explore/${dorm.id}`} 
                key={dorm.id}
                className="group relative flex flex-col aspect-[16/11] rounded-[4rem] overflow-hidden bg-white border border-border shadow-2xl transition-all duration-700 hover:-translate-y-3 premium-shadow"
              >
                <div className="absolute inset-0 z-0">
                  <Image 
                    src="/luxury_dorm_building_1_1775739456274.png" 
                    alt={dorm.name} 
                    fill 
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-95 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="relative z-10 mt-auto p-14 text-white">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 mb-8 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {dorm.available_rooms_count > 0 ? `${dorm.available_rooms_count} Rooms Available` : 'Fully Booked'}
                   </div>
                   
                   <h3 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-6 leading-tight group-hover:text-primary transition-colors">{dorm.name}</h3>
                   <div className="flex flex-col gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
                      {dorm.available_rooms_summary && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-3 mb-2">
                           <span className="w-6 h-px bg-primary" />
                           ห้องที่ว่าง: {dorm.available_rooms_summary}
                        </p>
                      )}
                      <p className="text-sm font-bold flex items-center gap-3 drop-shadow-sm">
                        <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {dorm.address}
                      </p>
                      <p className="text-sm font-bold flex items-center gap-3 drop-shadow-sm">
                        <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {dorm.phone}
                      </p>
                   </div>
                   
                   <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-primary transition-colors">ดูรายละเอียดห้องพัก</span>
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
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
      </section>
    </div>
  );
}
