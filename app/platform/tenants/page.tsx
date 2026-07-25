'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TenantRecord {
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  room_number: string | null;
  floor: number | null;
  dorm_id: number | null;
  dorm_name: string;
  start_date: string | null;
  end_date: string | null;
  deposit_amount: number | null;
  contract_status: string;
  created_at: string;
}

interface DormOption {
  id: number;
  dorm_name: string;
}

export default function PlatformTenantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [dormitories, setDormitories] = useState<DormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDormId, setSelectedDormId] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    if ((session?.user as any)?.role !== 'platform_admin') {
      router.push('/signin');
      return;
    }

    fetchTenants();
  }, [session, status, router, selectedDormId]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedDormId) params.append('dormId', selectedDormId);

      const res = await fetch(`/api/platform/tenants?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTenants(data.data);
        setDormitories(data.dormitories || []);
      }
    } catch (err) {
      console.error('Error fetching platform tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTenants();
  };

  const activeDormsCount = new Set(tenants.map(t => t.dorm_name)).size;
  const activeContractsCount = tenants.filter(t => t.contract_status === 'Active').length;

  if (loading && tenants.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#080F1E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-white/50 text-sm font-semibold">กำลังโหลดข้อมูลผู้เช่า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#080F1E] text-white selection:bg-violet-500/30">
      
      {/* Top Bar Header */}
      <header className="px-6 sm:px-10 py-6 border-b border-white/10 bg-white/2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">ทะเบียนผู้เช่าในระบบ</h1>
            <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span>👁️</span> เฉพาะเรียกดู (Read-Only)
            </span>
          </div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Platform Tenant Registry Audit</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/platform"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/10 shadow-sm cursor-pointer"
          >
            <span>📊</span>
            <span>กลับ Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Read-only Alert Banner */}
          <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-start gap-3">
            <span className="text-violet-400 text-xl leading-none mt-0.5">ℹ️</span>
            <div>
              <h3 className="font-bold text-sm text-violet-200">ระบบตรวจสอบข้อมูลผู้เช่ารายหอพัก (Audit & Inspection Mode)</h3>
              <p className="text-xs text-violet-300/70 mt-0.5 leading-relaxed">
                สิทธิ์สำหรับผู้ดูแลแพลตฟอร์ม (Platform Admin) ในการตรวจสอบว่าผู้เช่าชื่ออะไร สังกัดอยู่หอพักใด และข้อมูลห้องพัก โดยสิทธิ์นี้เปิดสำหรับเรียกดูข้อมูลเท่านั้นเพื่อความเป็นส่วนตัวและความปลอดภัย
              </p>
            </div>
          </div>

          {/* Stats KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center text-xl mb-3">
                👥
              </div>
              <p className="text-3xl font-black text-white mb-1">{tenants.length.toLocaleString()} ราย</p>
              <p className="text-white/60 text-xs font-semibold">ผู้เช่าทั้งหมดในระบบ</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Total Registered Tenants</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-3">
                🏢
              </div>
              <p className="text-3xl font-black text-white mb-1">{activeDormsCount.toLocaleString()} หอพัก</p>
              <p className="text-white/60 text-xs font-semibold">หอพักที่มีผู้เช่าพักอาศัย</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Occupied Dormitories</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-3">
                📜
              </div>
              <p className="text-3xl font-black text-white mb-1">{activeContractsCount.toLocaleString()} สัญญา</p>
              <p className="text-white/60 text-xs font-semibold">สัญญาเช่าที่สมบูรณ์ (Active)</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Valid Active Contracts</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้เช่า, เบอร์โทร, อีเมล, หมายเลขห้อง..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 transition-all"
              />
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); fetchTenants(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Dormitory Dropdown Filter */}
            <div className="min-w-[220px]">
              <select
                value={selectedDormId}
                onChange={e => setSelectedDormId(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="">🏢 หอพักทั้งหมด ({dormitories.length})</option>
                {dormitories.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.dorm_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tenants Audit Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>📋</span> รายชื่อผู้เช่าในระบบทั้งหมด ({tenants.length} รายการ)
              </h3>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Read-Only Table</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-[11px] font-black uppercase tracking-wider bg-white/2">
                    <th className="px-6 py-3.5">ชื่อผู้เช่า</th>
                    <th className="px-6 py-3.5">หอพักที่สังกัด</th>
                    <th className="px-6 py-3.5">ห้องพัก / ชั้น</th>
                    <th className="px-6 py-3.5">ข้อมูลติดต่อ</th>
                    <th className="px-6 py-3.5">สถานะสัญญา</th>
                    <th className="px-6 py-3.5 text-center">สิทธิ์การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-white/40 text-sm">กำลังโหลดข้อมูล...</td>
                    </tr>
                  ) : tenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-white/40 text-sm">
                        <span className="text-3xl block mb-2 opacity-50">📭</span>
                        ไม่พบข้อมูลผู้เช่าตรงกับเงื่อนไขการค้นหา
                      </td>
                    </tr>
                  ) : (
                    tenants.map((tenant) => (
                      <tr key={tenant.tenant_id} className="hover:bg-white/5 transition-colors">
                        {/* Tenant Name */}
                        <td className="px-6 py-4 font-bold text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center justify-center font-black text-sm shrink-0">
                              {tenant.tenant_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{tenant.tenant_name}</p>
                              <p className="text-[10px] text-white/40">ID: #{tenant.tenant_id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Dormitory Name */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-bold">
                            <span>🏢</span> {tenant.dorm_name}
                          </span>
                        </td>

                        {/* Room Number & Floor */}
                        <td className="px-6 py-4 font-semibold text-white">
                          {tenant.room_number ? (
                            <span className="text-xs font-black bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                              ห้อง {tenant.room_number} {tenant.floor ? `(ชั้น ${tenant.floor})` : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-white/30 italic">ไม่ระบุห้อง</span>
                          )}
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-4 text-xs">
                          <p className="font-bold text-white/90">{tenant.tenant_email}</p>
                          <p className="text-white/50 mt-0.5">📞 {tenant.tenant_phone}</p>
                        </td>

                        {/* Contract Status */}
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            tenant.contract_status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {tenant.contract_status === 'Active' ? '✓ มีสัญญาเช่า' : 'ไม่มีสัญญา Active'}
                          </span>
                        </td>

                        {/* Action Permission Tag (Read Only) */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-white/40 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                            🔒 เรียกดูเท่านั้น
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
