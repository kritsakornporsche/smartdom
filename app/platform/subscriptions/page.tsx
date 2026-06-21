'use client';

import { useEffect, useState } from 'react';

interface Sub {
  id: number;
  dorm_name: string;
  owner_name: string;
  owner_email: string;
  package_name: string;
  package_price: number;
  status: string;
  amount_paid: number;
  start_date: string;
  end_date: string;
}

export default function PlatformSubscriptions() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/platform/subscriptions')
      .then(r => r.json())
      .then(d => { if (d.success) setSubs(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? subs : subs.filter(s => s.status === filter);
  const totalRevenue = subs.filter(s => s.status === 'Active').reduce((sum, s) => sum + Number(s.amount_paid || 0), 0);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="px-10 py-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">การสมัครสมาชิก</h1>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-0.5">Subscription Management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-2.5">
            <p className="text-emerald-400 text-xs font-bold">รายรับรวม</p>
            <p className="text-emerald-300 text-lg font-black">฿{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-7xl mx-auto">
          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {['all', 'Active', 'Expired', 'Cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === f ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                {f === 'all' ? `ทั้งหมด (${subs.length})` : `${f} (${subs.filter(s => s.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">หอพัก</th>
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">แพ็กเกจ</th>
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">ราคา</th>
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">วันที่เริ่ม</th>
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">วันหมดอายุ</th>
                  <th className="text-left px-6 py-4 text-white/30 text-xs uppercase tracking-widest font-bold">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-bold">{s.dorm_name}</p>
                      <p className="text-white/40 text-xs">{s.owner_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold">
                        {s.package_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-bold">
                      ฿{Number(s.package_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {s.start_date ? new Date(s.start_date).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {s.end_date ? new Date(s.end_date).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        s.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        s.status === 'Expired' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
