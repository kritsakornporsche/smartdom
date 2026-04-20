'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';

interface Bill {
  id: number;
  tenant_name: string;
  room_number: string;
  title: string;
  amount: number;
  status: string;
  due_date: string;
  billing_cycle: string;
  slip_url: string | null;
}

interface Tenant {
  id: number;
  name: string;
  room_number: string;
}

export default function AdminBillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // New Bill Form
  const [selectedTenant, setSelectedTenant] = useState('');
  const [billTitle, setBillTitle] = useState('ค่าเช่าห้องพักรายเดือน');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [cycle, setCycle] = useState('April 2026');

  const fetchData = async () => {
    try {
      const [billsRes, tenantsRes] = await Promise.all([
        fetch('/api/admin/billing'),
        fetch('/api/admin/tenants')
      ]);
      const billsData = await billsRes.json();
      const tenantsData = await tenantsRes.json();
      
      if (billsData.success) setBills(billsData.data);
      if (tenantsData.success) setTenants(tenantsData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: parseInt(selectedTenant),
          title: billTitle,
          amount: parseFloat(amount),
          due_date: dueDate,
          billing_cycle: cycle
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
        setSelectedTenant('');
        setAmount('');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert('ล้มเหลว');
    }
  };

  const filteredBills = bills.filter(b => 
    statusFilter === 'all' || b.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'paid' || s === 'ชำระแล้ว') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'pending' || s === 'รอผลตรวจสอบ') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-background border-b border-border flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">ข้อมูลการเงิน</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">จัดการบิลและตรวจสอบการชำระเงินของลูกบ้าน</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            ออกบิลใหม่
          </button>
        </header>

        <section className="px-10 py-5 bg-background border-b border-border flex gap-4">
          {['all', 'Unpaid', 'Pending', 'Paid'].map(s => (
            <button 
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${statusFilter === s ? 'bg-primary/10 border-primary text-primary' : 'bg-accent/30 border-transparent text-muted-foreground'}`}
            >
              {s === 'all' ? 'ทั้งหมด' : s === 'Unpaid' ? 'ยังไม่ชำระ' : s === 'Pending' ? 'รอตรวจสอบ' : 'ชำระแล้ว'}
            </button>
          ))}
        </section>

        <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-accent/5">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-accent/30 border-b border-border">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">รายการ / รอบบิล</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ผู้เช่า / ห้อง</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">ยอดเงิน (บาท)</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">สถานะ</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center text-muted-foreground font-bold">กำลังโหลดข้อมูลการเงิน...</td></tr>
                  ) : filteredBills.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-muted-foreground font-bold">ไม่พบข้อมูลบิลในระบบ</td></tr>
                  ) : filteredBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-accent/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-foreground mb-0.5">{bill.title}</div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase">{bill.billing_cycle}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-foreground mb-0.5">{bill.tenant_name}</div>
                        <div className="text-[10px] font-black text-primary uppercase tracking-tighter">ห้อง {bill.room_number || 'N/A'}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="text-base font-display font-bold text-foreground">฿{Number(bill.amount).toLocaleString()}</div>
                        <div className="text-[10px] font-black text-rose-500 uppercase">ครบกำหนด {new Date(bill.due_date).toLocaleDateString('th-TH')}</div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(bill.status)}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-2">
                          {bill.status === 'Pending' && bill.slip_url && (
                             <a href={bill.slip_url} target="_blank" className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                             </a>
                          )}
                          {bill.status !== 'Paid' && (
                            <button 
                              onClick={() => updateStatus(bill.id, 'Paid')}
                              className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Issuance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl w-full max-w-md shadow-2xl border border-border overflow-hidden">
            <div className="px-8 py-6 border-b border-border flex justify-between items-center">
              <h2 className="font-display text-xl font-bold">ออกบิลใหม่</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-accent/50 p-2 rounded-full">✕</button>
            </div>
            <form onSubmit={handleIssueBill} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-primary mb-2">เลือกผู้เช่า</label>
                <select 
                  required
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-border text-sm font-bold bg-background focus:ring-2 ring-primary/20 outline-none"
                >
                  <option value="">-- เลือกผู้เช่า --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (ห้อง {t.room_number})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-primary mb-2">หัวข้อบิล</label>
                <input 
                  type="text"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-border text-sm font-bold bg-background focus:ring-2 ring-primary/20 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-primary mb-2">ยอดเงิน (บาท)</label>
                  <input 
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border border-border text-sm font-bold bg-background outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-primary mb-2">รอบบิล</label>
                  <input 
                    type="text"
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border border-border text-sm font-bold bg-background outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-primary mb-2">วันครบกำหนด</label>
                <input 
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-border text-sm font-bold bg-background outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 rounded-full bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest shadow-xl hover:-translate-y-1 transition-transform"
              >
                ยืนยันการออกบิล
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
