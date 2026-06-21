'use client';

import { useEffect, useState } from 'react';

interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: number;
  description: string;
  dorm_name: string | null;
  transaction_date: string;
}

interface MonthlySummary {
  year: number;
  month: number;
  income: number;
  expense: number;
}

const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export default function PlatformAccounting() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthly, setMonthly] = useState<MonthlySummary[]>([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'Income', category: 'Subscription', amount: 0, description: '', transaction_date: new Date().toISOString().split('T')[0] });

  const load = () => {
    fetch('/api/platform/accounting')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setTransactions(d.transactions);
          setMonthly(d.monthlySummary);
          setTotals(d.totals);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    await fetch('/api/platform/accounting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ type: 'Income', category: 'Subscription', amount: 0, description: '', transaction_date: new Date().toISOString().split('T')[0] });
    load();
  };

  const fmt = (n: number) => Number(n).toLocaleString('th-TH');

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="px-10 py-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">บัญชีแพลตฟอร์ม</h1>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-0.5">Platform Accounting</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/30"
        >
          + บันทึกรายการ
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* KPI Row */}
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <p className="text-emerald-400/60 text-xs font-bold uppercase tracking-wider mb-1">รายรับรวม</p>
              <p className="text-3xl font-black text-emerald-400">฿{fmt(totals.income)}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <p className="text-red-400/60 text-xs font-bold uppercase tracking-wider mb-1">รายจ่าย/คืนเงิน</p>
              <p className="text-3xl font-black text-red-400">฿{fmt(totals.expense)}</p>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-6">
              <p className="text-violet-400/60 text-xs font-bold uppercase tracking-wider mb-1">กำไรสุทธิ</p>
              <p className={`text-3xl font-black ${totals.profit >= 0 ? 'text-violet-400' : 'text-red-400'}`}>
                ฿{fmt(totals.profit)}
              </p>
            </div>
          </div>

          {/* Monthly Chart (simplified bar) */}
          {monthly.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5 flex items-center gap-2"><span>📊</span> สรุปรายเดือน</h3>
              <div className="flex items-end gap-3 h-40">
                {monthly.slice().reverse().map((m, i) => {
                  const maxVal = Math.max(...monthly.map(x => Math.max(Number(x.income), Number(x.expense))), 1);
                  const incH = Math.max((Number(m.income) / maxVal) * 100, 4);
                  const expH = Math.max((Number(m.expense) / maxVal) * 100, 4);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex gap-1 items-end h-32 w-full justify-center">
                        <div className="w-4 bg-emerald-500 rounded-t" style={{ height: `${incH}%` }} title={`รายรับ: ฿${fmt(Number(m.income))}`} />
                        <div className="w-4 bg-red-500/60 rounded-t" style={{ height: `${expH}%` }} title={`รายจ่าย: ฿${fmt(Number(m.expense))}`} />
                      </div>
                      <p className="text-white/40 text-[10px] font-bold">{monthNames[m.month - 1]}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-6 mt-4 justify-center">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded" /><span className="text-white/50 text-xs">รายรับ</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500/60 rounded" /><span className="text-white/50 text-xs">รายจ่าย</span></div>
              </div>
            </div>
          )}

          {/* Transaction Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-bold">รายการทั้งหมด</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-widest font-bold">วันที่</th>
                  <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-widest font-bold">ประเภท</th>
                  <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-widest font-bold">หมวด</th>
                  <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-widest font-bold">รายละเอียด</th>
                  <th className="text-left px-6 py-3 text-white/30 text-xs uppercase tracking-widest font-bold">หอพัก</th>
                  <th className="text-right px-6 py-3 text-white/30 text-xs uppercase tracking-widest font-bold">จำนวน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">ยังไม่มีรายการ</td></tr>
                ) : transactions.map(t => (
                  <tr key={t.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-3 text-white/60">{t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('th-TH') : '-'}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        t.type === 'Income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>{t.type}</span>
                    </td>
                    <td className="px-6 py-3 text-white/60">{t.category}</td>
                    <td className="px-6 py-3 text-white/80">{t.description || '-'}</td>
                    <td className="px-6 py-3 text-white/60">{t.dorm_name || '-'}</td>
                    <td className={`px-6 py-3 text-right font-bold ${t.type === 'Income' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'Income' ? '+' : '-'}฿{fmt(Number(t.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-white font-black text-lg mb-6">บันทึกรายการใหม่</h2>
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1.5">ประเภท</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                >
                  <option value="Income">รายรับ (Income)</option>
                  <option value="Expense">รายจ่าย (Expense)</option>
                  <option value="Refund">คืนเงิน (Refund)</option>
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1.5">หมวดหมู่</label>
                <input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                  placeholder="Subscription"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1.5">จำนวน (บาท)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1.5">วันที่</label>
                  <input
                    type="date"
                    value={form.transaction_date}
                    onChange={e => setForm(f => ({ ...f, transaction_date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1.5">รายละเอียด</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500"
                  placeholder="ค่า subscription หอพัก XYZ"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 text-white/60 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">ยกเลิก</button>
                <button onClick={handleSubmit} className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-500 transition-colors shadow-lg">บันทึก</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
