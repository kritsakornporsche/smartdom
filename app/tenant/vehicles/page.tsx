'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Vehicle {
  id: number;
  license_plate: string;
  province: string;
  type: string;
  brand: string;
  color: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

const MOCK_VEHICLES: Vehicle[] = [
  { id: 1, license_plate: '1กข 1234', province: 'กรุงเทพมหานคร', type: 'รถยนต์', brand: 'Honda Civic', color: 'ขาว', status: 'Approved' },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-8 lg:p-10 hidden-scrollbar">
      <div className="max-w-5xl mx-auto pb-16 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <Link href="/tenant" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A08D74] hover:text-[#3E342B] transition-colors mb-4">
              <span className="w-6 h-px bg-[#A08D74]"></span> กลับหน้าหลัก
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-[#3E342B] tracking-tight">
              ลงทะเบียนยานพาหนะ
            </h1>
            <p className="text-[#8B7355] font-medium mt-3">
              จัดการข้อมูลรถยนต์หรือรถจักรยานยนต์เพื่อรับสิทธิ์จอดรถ
            </p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-[#3E342B] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#2A231D] transition-colors shadow-xl shadow-[#3E342B]/20 whitespace-nowrap"
          >
            {showForm ? 'ยกเลิก' : '+ ลงทะเบียนรถใหม่'}
          </button>
        </div>

        {/* Registration Form */}
        {showForm && (
           <section className="bg-white rounded-[2.5rem] border border-[#E5DFD3] p-8 md:p-10 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
             <h2 className="text-2xl font-black text-[#3E342B] mb-6">กรอกข้อมูลยานพาหนะ</h2>
             <form className="grid sm:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); setShowForm(false); }}>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#A08D74]">ประเภทรถ</label>
                  <select className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-6 py-4 text-sm font-bold text-[#3E342B] focus:bg-white focus:border-primary outline-none">
                    <option value="car">รถยนต์</option>
                    <option value="motorcycle">รถจักรยานยนต์</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#A08D74]">ป้ายทะเบียน</label>
                  <input placeholder="เช่น 1กข 1234" className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-6 py-4 text-sm font-bold text-[#3E342B] focus:bg-white focus:border-primary outline-none" required />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#A08D74]">จังหวัด</label>
                  <input placeholder="กรุงเทพมหานคร" className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-6 py-4 text-sm font-bold text-[#3E342B] focus:bg-white focus:border-primary outline-none" required />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#A08D74]">ยี่ห้อ / รุ่น</label>
                  <input placeholder="Honda Civic" className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-6 py-4 text-sm font-bold text-[#3E342B] focus:bg-white focus:border-primary outline-none" required />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#A08D74]">สีรถ</label>
                  <input placeholder="ขาว" className="w-full rounded-2xl border border-[#E5DFD3] bg-[#FAF8F5] px-6 py-4 text-sm font-bold text-[#3E342B] focus:bg-white focus:border-primary outline-none" required />
               </div>
               
               <div className="sm:col-span-2 pt-4">
                 <button type="submit" className="w-full bg-primary text-white rounded-2xl py-4 font-bold text-lg hover:-translate-y-1 transition-transform shadow-xl shadow-primary/20">
                    ส่งข้อมูลลงทะเบียน
                 </button>
               </div>
             </form>
           </section>
        )}

        {/* Existing Vehicles */}
        <section>
          <div className="grid gap-6">
            {vehicles.map(v => (
               <div key={v.id} className="bg-white rounded-[2rem] border border-[#E5DFD3] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-20 h-20 bg-[#FAF8F5] rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner border border-[#E5DFD3]/50">
                       {v.type === 'รถยนต์' ? '🚗' : '🏍️'}
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                         <h3 className="text-2xl font-black text-[#3E342B]">{v.license_plate}</h3>
                         <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-2 ${
                            v.status === 'Approved' ? 'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]' :
                            v.status === 'Pending' ? 'bg-[#FAF3E8] text-[#D4A373] border-[#E9C46A]' :
                            'bg-[#FFEBEE] text-[#F44336] border-[#FFCDD2]'
                         }`}>
                            {v.status === 'Approved' ? 'อนุมัติแล้ว' : v.status === 'Pending' ? 'รอตรวจสอบ' : 'ไม่อนุมัติ'}
                         </span>
                       </div>
                       <p className="text-[#8B7355] font-medium">{v.province}</p>
                       <p className="text-[11px] text-[#A08D74] font-bold uppercase tracking-widest mt-2">
                         {v.brand} • สี{v.color}
                       </p>
                    </div>
                 </div>
                 <div className="w-full md:w-auto flex justify-end">
                    <button className="text-destructive text-sm font-bold px-6 py-3 rounded-xl hover:bg-destructive/10 transition-colors">ลบข้อมูล</button>
                 </div>
               </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
