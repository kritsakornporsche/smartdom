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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/luxury_dorm_building_1_1775739456274.png" 
            alt="Dormitory Buildling" 
            fill 
            className="object-cover brightness-[0.6]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#faf9f6]" />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white mb-6 leading-none">
            เลือกหอพักที่ <span className="italic font-medium text-primary">ใช่ที่สุด</span> แด่คุณ
          </h1>
          <p className="max-w-2xl mx-auto text-white/80 font-medium text-lg mb-8">
            เริ่มต้นการค้นหาจากทำเลและหอพักที่คุณชื่นชอบ เพื่อพบกับห้องพักที่ออกแบบมาเพื่อคุณโดยเฉพาะ
          </p>
        </div>
      </section>

      {/* Dormitory Grid */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-16">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Our Locations</h2>
          <p className="text-4xl font-display font-black tracking-tighter">หอพักคุณภาพในเครือ SmartDom</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2].map(i => (
              <div key={i} className="aspect-video rounded-[3rem] bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {dorms.map((dorm) => (
              <Link 
                href={`/explore/${dorm.id}`} 
                key={dorm.id}
                className="group relative flex flex-col aspect-[16/10] rounded-[3.5rem] overflow-hidden bg-white border border-black/5 shadow-2xl transition-all duration-700 hover:-translate-y-2"
              >
                <div className="absolute inset-0 z-0">
                  <Image 
                    src="/luxury_dorm_building_1_1775739456274.png"  // Reusing build image, or can have per dorm
                    alt={dorm.name} 
                    fill 
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                </div>
                
                <div className="relative z-10 mt-auto p-12 text-white">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 mb-6">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {dorm.available_rooms_count > 0 ? `${dorm.available_rooms_count} Rooms Available` : 'Fully Booked'}
                   </div>
                   
                   <h3 className="text-4xl font-display font-black tracking-tight mb-4">{dorm.name}</h3>
                   <div className="flex flex-col gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      {dorm.available_rooms_summary && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-2">
                           <span className="w-4 h-px bg-primary" />
                           ห้องที่ว่าง: {dorm.available_rooms_summary}
                        </p>
                      )}
                      <p className="text-xs font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {dorm.address}
                      </p>
                      <p className="text-xs font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {dorm.phone}
                      </p>
                   </div>
                   
                   <div className="mt-10 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-primary">ดูห้องพักทั้งหมด</span>
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-xl">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
