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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold uppercase tracking-wider text-white border border-white/20 mb-8 shadow-xl">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            ระบบนิเวศน์แห่งการอยู่อาศัย
          </div>
          <h1 className="text-3xl md:text-2xl font-display font-bold tracking-tight text-white mb-8 leading-[0.9] ornament-light mx-auto max-w-4xl">
            เลือกหอพักที่ <span className="italic font-medium text-primary">ใช่ที่สุด</span> สำหรับคุณ
          </h1>
          <p className="max-w-2xl mx-auto text-white/90 font-bold text-lg mb-8 leading-normal">
            เริ่มต้นการค้นหาจากทำเลและหอพักที่คุณชื่นชอบ เพื่อพบกับห้องพักที่ออกแบบมาเพื่อคุณโดยเฉพาะ
          </p>
        </div>
      </section>

      {/* Dormitory Grid */}
      <section className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 mb-20 reveal-on-scroll active">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary">ทำเลที่ตั้งของเรา</h2>
          <p className="text-2xl md:text-2xl font-display font-bold tracking-tighter text-foreground ornament">หอพักคุณภาพในเครือ SmartDom</p>
          <div className="h-1 w-20 bg-primary/20 rounded-full" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2].map(i => (
              <div key={i} className="aspect-video rounded-[4rem] bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {dorms.map((dorm) => (
              <Link 
                href={`/explore/${dorm.id}`} 
                key={dorm.id}
                className="group flex flex-col lg:flex-row gap-6 lg:gap-14 bg-white rounded-[3rem] p-4 lg:p-6 border border-border shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 premium-shadow"
              >
                {/* Image Section */}
                <div className="relative w-full lg:w-[45%] shrink-0 aspect-[4/3] lg:aspect-auto lg:h-[450px] rounded-[2.5rem] overflow-hidden bg-secondary">
                  <Image 
                    src="/luxury_dorm_building_1_1775739456274.png" 
                    alt={dorm.name} 
                    fill 
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
                  <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wide border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] whitespace-nowrap text-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      {dorm.available_rooms_count > 0 ? `ว่าง ${dorm.available_rooms_count} ห้อง` : 'ห้องพักเต็มแล้ว'}
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="flex flex-col justify-center py-4 px-2 lg:px-0 lg:pr-8 lg:w-[55%]">
                   <h3 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-8 leading-tight text-foreground group-hover:text-primary transition-colors">{dorm.name}</h3>
                   
                   <div className="flex flex-col gap-6">
                      {dorm.available_rooms_summary && (
                        <div className="flex gap-4 p-5 rounded-2xl bg-[#FDFBF7] border border-border/60">
                           <div className="w-1.5 h-auto bg-primary/40 rounded-full" />
                           <p className="text-sm font-medium tracking-wide text-muted-foreground line-clamp-2 leading-relaxed">
                             <span className="font-bold text-foreground mr-2">ห้องที่ว่าง:</span>
                             {dorm.available_rooms_summary}
                           </p>
                        </div>
                      )}
                      
                      <div className="space-y-5 mt-2">
                        <p className="text-sm font-medium flex items-center gap-5 text-muted-foreground">
                          <span className="w-12 h-12 rounded-full bg-[#FDFBF7] border border-border/40 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </span>
                          <span className="truncate">{dorm.address}</span>
                        </p>
                        <p className="text-sm font-medium flex items-center gap-5 text-muted-foreground">
                          <span className="w-12 h-12 rounded-full bg-[#FDFBF7] border border-border/40 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          </span>
                          {dorm.phone}
                        </p>
                      </div>
                   </div>
                   
                   <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#A08D74] group-hover:text-primary transition-colors">ดูรายละเอียดหอพัก</span>
                      <div className="w-14 h-14 rounded-full bg-[#FDFBF7] border border-border/80 flex items-center justify-center text-[#8B7355] group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-500 shadow-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
