'use client';

import { useState, useEffect } from 'react';
import OwnerSidebar from '../components/OwnerSidebar';

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

  const fetchTenants = async () => {
    setLoading(true);
    try {
      // Mocking tenant fetch with room details
      const res = await fetch('/api/auth/users'); // Reuse users API or create custom
      const data = await res.json();
      if (data.success) {
         // Filter only tenants
         setTenants(data.data.filter((u: any) => u.role === 'tenant').map((u: any) => ({
           id: u.id,
           name: u.full_name || u.name,
           email: u.email,
           phone: u.phone || '08x-xxx-xxxx',
           room_number: '101', // Placeholder logic
           status: u.is_active ? 'Active' : 'Inactive'
         })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return (
    <div className="flex h-screen bg-[#F0F2F5]">
      <OwnerSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-800">ทะเบียนผู้เช่า</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">รายชื่อและข้อมูลติดต่อผู้เช่าทั่งหมด</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-slate-100">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ชื่อ-นามสกุล</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ห้อง</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">เบอร์โทรศัพท์</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">อีเมล</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{tenant.name.charAt(0)}</div>
                              <span className="font-bold text-slate-700">{tenant.name}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5 font-black text-[#0984E3]">{tenant.room_number}</td>
                        <td className="px-8 py-5 font-medium text-slate-600">{tenant.phone}</td>
                        <td className="px-8 py-5 text-slate-400 text-xs">{tenant.email}</td>
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
      </main>
    </div>
  );
}
