'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './components/Navbar';

interface Dormitory {
  id: number;
  name: string;
  address: string;
  phone: string;
  cover_image: string | null;
  description: string | null;
  pet_friendly: boolean;
  has_parking: boolean;
  has_air_con: boolean;
  has_wifi: boolean;
  has_lan: boolean;
  min_price: number;
  available_rooms_count: number;
  available_rooms_summary: string | null;
}

export default function Home() {
  const [dorms, setDorms] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [petFriendly, setPetFriendly] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [hasAirCon, setHasAirCon] = useState(false);

  async function fetchDorms() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (petFriendly) params.append('petFriendly', 'true');
      if (hasParking) params.append('hasParking', 'true');
      if (hasAirCon) params.append('hasAirCon', 'true');

      const res = await fetch(`/api/dorms?${params.toString()}`);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDorms();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search, maxPrice, petFriendly, hasParking, hasAirCon]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/luxury_dorm_building_1_1775739456274.png" 
            alt="Dormitory Building" 
            fill 
            className="object-cover brightness-[0.4] dark:brightness-[0.3]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 animate-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-primary border border-white/10 mb-6 shadow-xl">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Ecosystem of Living
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight text-white mb-4 sm:mb-6 leading-tight">
            ค้นหาหอพักที่ <span className="italic font-medium text-primary">ตรงใจคุณ</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/90 dark:text-white/70 font-semibold text-base leading-relaxed">
            เริ่มต้นการค้นหาจากทำเล กฎระเบียบสัตว์เลี้ยง ค่าน้ำค่าไฟ หรือสิ่งอำนวยความสะดวกที่คุณต้องการ
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="relative z-20 max-w-6xl mx-auto px-6 -mt-16">
        <div className="bg-card border border-border rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block pl-1">ค้นหาตามชื่อหอพัก</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground/60 text-lg">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="พิมพ์ชื่อหอพัก..."
                  className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/45"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block pl-1">งบประมาณสูงสุด (ต่อเดือน)</label>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl px-4 py-3.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">ไม่จำกัดราคา</option>
                <option value="3000">ไม่เกิน ฿3,000 / เดือน</option>
                <option value="3500">ไม่เกิน ฿3,500 / เดือน</option>
                <option value="4000">ไม่เกิน ฿4,000 / เดือน</option>
                <option value="5000">ไม่เกิน ฿5,000 / เดือน</option>
                <option value="7000">ไม่เกิน ฿7,000 / เดือน</option>
              </select>
            </div>

            {/* Tags Filters */}
            <div className="space-y-2 flex flex-col justify-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block pl-1 mb-1">ความต้องการพิเศษ</label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { key: 'petFriendly', label: '🐱 เลี้ยงแมวได้', active: petFriendly, set: setPetFriendly },
                  { key: 'hasParking', label: '🚗 ที่จอดรถยนต์', active: hasParking, set: setHasParking },
                  { key: 'hasAirCon', label: '❄️ ห้องแอร์', active: hasAirCon, set: setHasAirCon }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => item.set(!item.active)}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                      item.active 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'bg-background border border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Dormitory Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Our Locations</h2>
            <p className="text-2xl sm:text-3xl md:text-5xl font-display font-black tracking-tighter text-foreground">หอพักคุณภาพที่ตอบโจทย์คุณ</p>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">พบทั้งหมด {dorms.length} แห่ง</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[1, 2].map(i => (
              <div key={i} className="aspect-[16/11] rounded-[3rem] bg-card animate-pulse border border-border" />
            ))}
          </div>
        ) : dorms.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-[3rem]">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-xl font-black text-foreground">ไม่พบหอพักตามเงื่อนไขที่ค้นหา</h3>
            <p className="text-muted-foreground text-sm mt-2 font-medium">กรุณาลองลดตัวกรอง หรือค้นหาใหม่อีกครั้ง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {dorms.map((dorm) => (
              <Link 
                href={`/explore/${dorm.id}`} 
                key={dorm.id}
                className="group relative flex flex-col aspect-[16/11] rounded-[3rem] overflow-hidden bg-card border border-border shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-primary"
              >
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={dorm.cover_image || "/luxury_dorm_building_1_1775739456274.png"} 
                    alt={dorm.name} 
                    fill 
                    className="object-cover transition-transform duration-[1500ms] group-hover:scale-105 opacity-80 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>
                
                <div className="relative z-10 mt-auto p-6 sm:p-10 text-foreground">
                   <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-border">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {dorm.available_rooms_count > 0 ? `${dorm.available_rooms_count} ห้องว่าง` : 'เต็มแล้ว'}
                     </div>
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20 text-primary">
                        เริ่มต้น ฿{Number(dorm.min_price).toLocaleString()} / เดือน
                     </div>
                   </div>
                   
                   <h3 className="text-3xl font-display font-black tracking-tight mb-3 leading-tight group-hover:text-primary transition-colors">{dorm.name}</h3>
                   {dorm.description && (
                     <p className="text-muted-foreground text-sm font-semibold line-clamp-2 mb-4 leading-relaxed">{dorm.description}</p>
                   )}

                   <div className="flex flex-col gap-2.5 opacity-85 group-hover:opacity-100 transition-opacity">
                      {dorm.available_rooms_summary && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-1">
                           <span className="w-4 h-px bg-primary" />
                           ห้องว่างแนะนำ: {dorm.available_rooms_summary}
                        </p>
                      )}
                      <p className="text-xs font-bold flex items-center gap-2">
                        <span className="text-primary text-base">📍</span>
                        {dorm.address}
                      </p>
                      <p className="text-xs font-bold flex items-center gap-2">
                        <span className="text-primary text-base">📞</span>
                        {dorm.phone}
                      </p>
                   </div>

                   {/* Features display */}
                   <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
                     {dorm.pet_friendly && <span className="text-[10px] sm:text-xs font-bold bg-background/50 border border-border px-2 sm:px-2.5 py-1 rounded-lg">🐱 สัตว์เลี้ยงได้</span>}
                     {dorm.has_parking && <span className="text-[10px] sm:text-xs font-bold bg-background/50 border border-border px-2 sm:px-2.5 py-1 rounded-lg">🚗 ที่จอดรถ</span>}
                     {dorm.has_air_con && <span className="text-[10px] sm:text-xs font-bold bg-background/50 border border-border px-2 sm:px-2.5 py-1 rounded-lg">❄️ ห้องแอร์</span>}
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">ดูรายละเอียดห้องพัก</span>
                      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl group-hover:scale-105 transition-all duration-300">
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
      </section>
    </div>
  );
}
