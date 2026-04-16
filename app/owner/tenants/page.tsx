'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  room_number: string;
  status: string;
}

export default function TenantsManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [ownerDormId, setOwnerDormId] = useState<number | null>(null);

  const fetchTenants = async (dormId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenants?dormId=${dormId}`);
      const data = await res.json();
      if (data.success) {
         setTenants(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const email = localStorage.getItem('userEmail') || 'owner@smartdom.com';
      try {
        const res = await fetch(`/api/owner/onboarding?email=${email}`);
        const data = await res.json();
        if (data.success && data.hasDorm) {
          setOwnerDormId(data.dorm.id);
          fetchTenants(data.dorm.id);
        } else if (data.success && !data.hasDorm) {
          router.push('/owner/onboarding');
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);


  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-20 bg-white/60 backdrop-blur-md border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-[#3E342B]">ทะเบียนผู้เช่า</h1>
            <p className="text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">รายชื่อและข้อมูลติดต่อผู้เช่าทั่งหมด</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-[#E5DFD3] shadow-[#DCD3C6]/10">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-[#FAF8F5] border-b border-[#E5DFD3]">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ชื่อ-นามสกุล</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">ห้อง</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">เบอร์โทรศัพท์</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">อีเมล</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-[#A08D74] uppercase tracking-widest">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3EFE9]">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#F3EFE9] flex items-center justify-center text-[#8B7355] font-bold border border-[#DCD3C6]">{tenant.name.charAt(0)}</div>
                              <span className="font-bold text-[#5A4D41]">{tenant.name}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5 font-black text-[#8B6A2B]">{tenant.room_number}</td>
                        <td className="px-8 py-5 font-medium text-[#A08D74]">{tenant.phone}</td>
                        <td className="px-8 py-5 text-[#A08D74] text-xs">{tenant.email}</td>
                        <td className="px-8 py-5">
                           <span className={`px-3 py-1 rounded-lg text-xs font-bold ${tenant.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              {tenant.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
          </div>
        </div>
      </div>
    </div>
  );
}
