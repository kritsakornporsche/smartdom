'use client';

import { useEffect, useState } from 'react';

interface Dorm {
  id: number;
  dorm_name: string;
  owner_name: string;
  owner_email: string;
  db_name: string;
  phone: string;
  status: string;
  package_name: string | null;
  max_rooms: number | null;
  created_at: string;
}

export default function PlatformDormitories() {
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/platform/dormitories')
      .then(r => r.json())
      .then(d => { if (d.success) setDorms(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (id: number, current: string) => {
    const newStatus = current === 'Active' ? 'Suspended' : 'Active';
    const res = await fetch('/api/platform/dormitories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if ((await res.json()).success) {
      setDorms(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    }
  };

  const filtered = filter === 'all' ? dorms : dorms.filter(d => d.status === filter);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="px-10 py-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">จัดการหอพัก</h1>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-0.5">Dormitory Management</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
          {['all', 'Active', 'Suspended', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {f === 'all' ? 'ทั้งหมด' : f}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-7xl mx-auto">
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Active', count: dorms.filter(d => d.status === 'Active').length, color: 'text-green-400' },
              { label: 'Suspended', count: dorms.filter(d => d.status === 'Suspended').length, color: 'text-yellow-400' },
              { label: 'Cancelled', count: dorms.filter(d => d.status === 'Cancelled').length, color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
                <span className="text-white/50 text-sm font-semibold">{s.label}</span>
                <span className={`text-2xl font-black ${s.color}`}>{s.count}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">หอพัก</th>
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">เจ้าของ</th>
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">แพ็กเกจ</th>
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">Database</th>
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">สถานะ</th>
                  <th className="text-right px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-bold">{d.dorm_name}</p>
                      <p className="text-white/40 text-xs">{d.phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white/80 font-semibold">{d.owner_name}</p>
                      <p className="text-white/40 text-xs">{d.owner_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold">
                        {d.package_name || 'ไม่มี'}
                      </span>
                      {d.max_rooms && <span className="text-white/30 text-xs ml-2">({d.max_rooms} ห้อง)</span>}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-white/40 text-xs bg-white/5 px-2 py-1 rounded">{d.db_name}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        d.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        d.status === 'Suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{d.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleStatus(d.id, d.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          d.status === 'Active'
                            ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {d.status === 'Active' ? 'ระงับ' : 'เปิดใช้งาน'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">ไม่พบข้อมูลหอพัก</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
