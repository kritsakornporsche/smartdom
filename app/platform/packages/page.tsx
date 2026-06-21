'use client';

import { useEffect, useState } from 'react';

interface Package {
  id: number;
  name: string;
  price: number;
  max_rooms: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

export default function PlatformPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: 0, max_rooms: 10, duration_days: 30, features: '' });

  const loadPackages = () => {
    fetch('/api/platform/packages')
      .then(r => r.json())
      .then(d => { if (d.success) setPackages(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPackages(); }, []);

  const handleSubmit = async () => {
    const features = form.features.split('\n').filter(f => f.trim());
    const body = { ...form, features };
    if (editPkg) {
      await fetch('/api/platform/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, id: editPkg.id, is_active: true }),
      });
    } else {
      await fetch('/api/platform/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    setShowForm(false);
    setEditPkg(null);
    setForm({ name: '', price: 0, max_rooms: 10, duration_days: 30, features: '' });
    loadPackages();
  };

  const openEdit = (pkg: Package) => {
    setEditPkg(pkg);
    setForm({
      name: pkg.name,
      price: pkg.price,
      max_rooms: pkg.max_rooms,
      duration_days: pkg.duration_days,
      features: pkg.features.join('\n'),
    });
    setShowForm(true);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  const tierColors = ['from-slate-500 to-slate-700', 'from-violet-500 to-purple-700', 'from-amber-500 to-orange-600'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="px-10 py-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">จัดการแพ็กเกจ</h1>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-0.5">Package Management</p>
        </div>
        <button
          onClick={() => { setEditPkg(null); setForm({ name: '', price: 0, max_rooms: 10, duration_days: 30, features: '' }); setShowForm(true); }}
          className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/30"
        >
          + เพิ่มแพ็กเกจ
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          {/* Package Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {packages.map((pkg, i) => (
              <div key={pkg.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all group">
                <div className={`h-2 bg-gradient-to-r ${tierColors[i % tierColors.length]}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-black text-lg">{pkg.name}</h3>
                    {!pkg.is_active && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">ปิด</span>
                    )}
                  </div>
                  <p className="text-4xl font-black text-white mb-1">
                    ฿{Number(pkg.price).toLocaleString()}
                    <span className="text-sm text-white/30 font-semibold">/เดือน</span>
                  </p>
                  <p className="text-white/40 text-xs mb-6">สูงสุด {pkg.max_rooms.toLocaleString()} ห้อง • {pkg.duration_days} วัน</p>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-white/60 text-sm">
                        <span className="text-green-400 mt-0.5">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => openEdit(pkg)}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-sm font-bold transition-all"
                  >
                    แก้ไข
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-white font-black text-lg mb-6">{editPkg ? 'แก้ไขแพ็กเกจ' : 'เพิ่มแพ็กเกจใหม่'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1.5">ชื่อแพ็กเกจ</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                  placeholder="เช่น Professional"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1.5">ราคา (บาท)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1.5">จำนวนห้องสูงสุด</label>
                  <input
                    type="number"
                    value={form.max_rooms}
                    onChange={e => setForm(f => ({ ...f, max_rooms: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1.5">ฟีเจอร์ (บรรทัดละ 1 รายการ)</label>
                <textarea
                  value={form.features}
                  onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
                  placeholder="ระบบจัดการผู้เช่า&#10;ระบบแจ้งซ่อม&#10;รายงานบัญชี"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 text-white/60 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                  ยกเลิก
                </button>
                <button onClick={handleSubmit} className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-500 transition-colors shadow-lg">
                  {editPkg ? 'บันทึก' : 'สร้างแพ็กเกจ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
