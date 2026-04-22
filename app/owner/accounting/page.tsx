'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Transaction {
  id: number;
  transaction_type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
  transaction_date: string;
}

export default function AccountingManagement() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ownerDormId, setOwnerDormId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    transaction_type: 'Income' as 'Income' | 'Expense',
    category: 'Rent',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const categories = {
    Income: ['Rent', 'Water', 'Electricity', 'Parking', 'Internet', 'Other'],
    Expense: ['Maintenance', 'Equipment', 'Staff Salary', 'Water Bill', 'Electricity Bill', 'Tax', 'Cleaning', 'Other']
  };

  const fetchTransactions = async (dormId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/accounting?dormId=${dormId}`);
      const data = await res.json();
      if (data.success) setTransactions(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      const dormId = (session.user as any).dorm_id;
      if (dormId) {
        setOwnerDormId(dormId);
        fetchTransactions(dormId);
      }
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerDormId) return;

    try {
      const res = await fetch('/api/owner/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, dorm_id: ownerDormId, amount: parseFloat(formData.amount) }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ ...formData, amount: '', description: '' });
        fetchTransactions(ownerDormId);
      }
    } catch (err) {
      alert('Failed to record transaction');
    }
  };

  const summary = transactions.reduce((acc, t) => {
    if (t.transaction_type === 'Income') acc.income += Number(t.amount);
    else acc.expense += Number(t.amount);
    return acc;
  }, { income: 0, expense: 0 });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FDFBF7]">
      <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-[#8B7355] rounded-full" />
          <h1 className="text-2xl font-black text-[#3E342B] tracking-tight">รายรับ - รายจ่าย</h1>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3.5 bg-[#3E342B] text-white rounded-2xl font-black text-sm shadow-xl hover:-translate-y-1 transition-all"
        >
          บันทึกรายการใหม่
        </button>
      </header>

      {/* Financial Summary Cards */}
      <div className="px-10 py-8 grid grid-cols-3 gap-6 shrink-0">
        <div className="bg-white p-8 rounded-[32px] border border-[#E5DFD3] shadow-sm">
            <p className="text-sm font-black text-emerald-500 uppercase tracking-wider mb-1">รายรับรวม</p>
            <h3 className="text-3xl font-black text-[#3E342B]">฿{summary.income.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-[#E5DFD3] shadow-sm">
            <p className="text-sm font-black text-rose-500 uppercase tracking-wider mb-1">รายจ่ายรวม</p>
            <h3 className="text-3xl font-black text-[#3E342B]">฿{summary.expense.toLocaleString()}</h3>
        </div>
        <div className={`p-8 rounded-[32px] border shadow-sm ${summary.income - summary.expense >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <p className="text-sm font-black text-[#3E342B] opacity-50 uppercase tracking-wider mb-1">กำไรสุทธิ</p>
            <h3 className={`text-3xl font-black ${summary.income - summary.expense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ฿{(summary.income - summary.expense).toLocaleString()}
            </h3>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-10 pb-10 scroll-smooth custom-scrollbar">
        <div className="bg-white rounded-[32px] border border-[#E5DFD3] overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-[#F3EFE9] border-b border-[#E5DFD3]">
                    <tr>
                        <th className="px-8 py-4 text-sm font-black text-[#A08D74] uppercase tracking-wider">วันที่</th>
                        <th className="px-8 py-4 text-sm font-black text-[#A08D74] uppercase tracking-wider">ประเภท</th>
                        <th className="px-8 py-4 text-sm font-black text-[#A08D74] uppercase tracking-wider">หมวดหมู่</th>
                        <th className="px-8 py-4 text-sm font-black text-[#A08D74] uppercase tracking-wider">รายละเอียด</th>
                        <th className="px-8 py-4 text-sm font-black text-[#A08D74] uppercase tracking-wider text-right">จำนวนเงิน</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EFE9]">
                    {loading ? (
                        [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-16" /></tr>)
                    ) : transactions.length === 0 ? (
                        <tr><td colSpan={5} className="py-20 text-center font-bold text-[#A08D74] opacity-40">ไม่มีรายการธุรกรรม</td></tr>
                    ) : (
                        transactions.map(t => (
                            <tr key={t.id} className="hover:bg-[#FDFBF7] transition-colors">
                                <td className="px-8 py-4 text-xs font-bold text-[#3E342B]">{new Date(t.transaction_date).toLocaleDateString('th-TH')}</td>
                                <td className="px-8 py-4">
                                    <span className={`px-2.5 py-1 text-sm font-black rounded-lg uppercase border ${t.transaction_type === 'Income' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                        {t.transaction_type === 'Income' ? 'รายรับ' : 'รายจ่าย'}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-xs font-bold text-[#5A4D41]">{t.category}</td>
                                <td className="px-8 py-4 text-xs font-medium text-[#A08D74]">{t.description || '-'}</td>
                                <td className={`px-8 py-4 text-sm font-black text-right ${t.transaction_type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.transaction_type === 'Income' ? '+' : '-'}฿{Number(t.amount).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl border border-[#8B7355]/20">
             <div className="bg-[#3E342B] p-8 text-white">
                <h2 className="text-2xl font-black">บันทึกรายการบัญชี</h2>
                <p className="text-white/40 text-sm font-black uppercase tracking-wide">Accounting & Finance</p>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="flex gap-2 p-1 bg-[#F3EFE9] rounded-2xl border border-[#E5DFD3]">
                    {['Income', 'Expense'].map(type => (
                        <button key={type} type="button" onClick={() => setFormData({...formData, transaction_type: type as any, category: categories[type as 'Income' | 'Expense'][0]})} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${formData.transaction_type === type ? 'bg-white text-[#3E342B] shadow-sm' : 'text-[#A08D74]'}`}>
                            {type === 'Income' ? '➕ รายรับ' : '➖ รายจ่าย'}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">หมวดหมู่</label>
                        <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-3.5 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black outline-none appearance-none">
                            {categories[formData.transaction_type].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">วันที่</label>
                        <input type="date" value={formData.transaction_date} onChange={(e) => setFormData({...formData, transaction_date: e.target.value})} className="w-full px-5 py-3 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black focus:bg-white outline-none" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">จำนวนเงิน (บาท)</label>
                    <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-5 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black text-2xl focus:bg-white outline-none text-[#3E342B]" placeholder="0.00" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">คำอธิบาย/หมายเหตุ</label>
                    <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-bold focus:bg-white outline-none" placeholder="เช่น ค่าที่จอดรถห้อง 101, ซื้อหลอดไฟ" />
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black text-[#A08D74]">ยกเลิก</button>
                    <button type="submit" className="flex-[2] py-4 bg-[#3E342B] text-white text-xs font-black rounded-2xl shadow-xl hover:-translate-y-1 transition-all">บันทึกรายการ</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
