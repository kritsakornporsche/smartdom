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
    } catch (e: any) {
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
            src="/up-header.jpg" 
            alt="University of Phayao Dormitory Header" 
            fill 
            className="object-cover brightness-[0.5] dark:brightness-[0.4]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 animate-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-primary border border-white/10 mb-6 shadow-xl">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            University of Phayao Student Living
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight text-white mb-4 sm:mb-6 leading-tight">
            ค้นหาหอพักหน้า มพ. <span className="italic font-medium text-primary">ที่ตรงใจคุณ</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/90 dark:text-white/70 font-semibold text-base leading-relaxed">
            ศูนย์รวมหอพักสำหรับนักศึกษามหาวิทยาลัยพะเยา ค้นหาหอพักใกล้มอ เช็กราคา ค่าน้ำค่าไฟ กฎเลี้ยงสัตว์ จองห้องและทำสัญญาออนไลน์ได้ง่ายๆ ในที่เดียว
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
            <div className="space-y-2 flex flex-col justify-end mt-2 md:mt-0">
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
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">University of Phayao</h2>
            <p className="text-2xl sm:text-3xl md:text-5xl font-display font-black tracking-tighter text-foreground">หอพักคุณภาพหน้า มพ. ที่ตอบโจทย์คุณ</p>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">พบทั้งหมด {dorms.length} แห่ง</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
            {[1, 2].map(i => (
              <div key={i} className="min-h-[440px] sm:min-h-[480px] w-full rounded-[2.5rem] sm:rounded-[3rem] bg-card animate-pulse border border-border" />
            ))}
          </div>
        ) : dorms.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-[3rem]">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-xl font-black text-foreground">ไม่พบหอพักตามเงื่อนไขที่ค้นหา</h3>
            <p className="text-muted-foreground text-sm mt-2 font-medium">กรุณาลองลดตัวกรอง หรือค้นหาใหม่อีกครั้ง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {dorms.map((dorm) => (
              <Link 
                href={`/explore/${dorm.id}`} 
                key={dorm.id}
                className="group flex flex-col w-full rounded-[2.5rem] overflow-hidden bg-card border border-border shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-primary hover:shadow-primary/10"
              >
                {/* Image Section */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-muted">
                  <Image 
                    src={dorm.cover_image || "/luxury_dorm_building_1_1775739456274.png"} 
                    alt={dorm.name} 
                    fill 
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                  
                  {/* Badges overlay */}
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20 shadow-lg">
                       <span className={`w-2 h-2 rounded-full ${dorm.available_rooms_count > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                       {dorm.available_rooms_count > 0 ? `${dorm.available_rooms_count} ห้องว่าง` : 'เต็มแล้ว'}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-full text-xs font-extrabold shadow-xl">
                       เริ่มต้น ฿{Number(dorm.min_price).toLocaleString()} / เดือน
                    </div>
                  </div>
                </div>
                
                {/* Content Section (Solid High-Contrast Background) */}
                <div className="p-6 sm:p-8 flex flex-col flex-1 bg-card text-foreground">
                   <h3 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                     {dorm.name}
                   </h3>

                   {dorm.available_rooms_summary && (
                     <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-xs sm:text-sm font-bold text-primary mb-4 w-fit">
                        <span>✨ ห้องว่างแนะนำ:</span>
                        <span className="font-extrabold">{dorm.available_rooms_summary}</span>
                     </div>
                   )}
                   
                   {dorm.description && (
                     <p className="text-muted-foreground text-sm sm:text-base font-medium line-clamp-2 mb-5 leading-relaxed">
                       {dorm.description}
                     </p>
                   )}

                   <div className="space-y-2 mb-6">
                      <p className="text-sm font-bold text-foreground flex items-center gap-2.5">
                        <span className="text-primary text-base flex-shrink-0">📍</span>
                        <span>{dorm.address}</span>
                      </p>
                      <p className="text-sm font-bold text-foreground flex items-center gap-2.5">
                        <span className="text-primary text-base flex-shrink-0">📞</span>
                        <span>{dorm.phone}</span>
                      </p>
                   </div>

                   {/* Features display */}
                   <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                     {dorm.pet_friendly === 1 && <span className="text-xs font-bold bg-secondary text-secondary-foreground border border-border px-3 py-1.5 rounded-xl">🐱 เลี้ยงสัตว์ได้</span>}
                     {dorm.has_parking === 1 && <span className="text-xs font-bold bg-secondary text-secondary-foreground border border-border px-3 py-1.5 rounded-xl">🚗 มีที่จอดรถ</span>}
                     {dorm.has_air_con === 1 && <span className="text-xs font-bold bg-secondary text-secondary-foreground border border-border px-3 py-1.5 rounded-xl">❄️ ห้องแอร์</span>}
                   </div>
                   
                   <div className="pt-5 border-t border-border flex items-center justify-between mt-auto">
                      <span className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
                        ดูรายละเอียดห้องพัก
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
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
