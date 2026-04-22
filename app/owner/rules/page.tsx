'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Rule {
  id: number;
  title: string;
  content: string;
  order_index: number;
}

export default function RuleManagement() {
  const { data: session } = useSession();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ownerDormId, setOwnerDormId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    order_index: 0,
  });

  const fetchRules = async (dormId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/rules?dormId=${dormId}`);
      const data = await res.json();
      if (data.success) setRules(data.data);
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
        fetchRules(dormId);
      }
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerDormId) return;

    try {
      const res = await fetch('/api/owner/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, dorm_id: ownerDormId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ title: '', content: '', order_index: rules.length + 1 });
        fetchRules(ownerDormId);
      }
    } catch (err) {
      alert('Failed to save rule');
    }
  };

  const deleteRule = async (id: number) => {
    if (!confirm('ยืนยันการลบกฏ?')) return;
    try {
      await fetch(`/api/owner/rules/${id}`, { method: 'DELETE' });
      if (ownerDormId) fetchRules(ownerDormId);
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FDFBF7]">
      <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-[#8B7355] rounded-full" />
          <h1 className="text-2xl font-black text-[#3E342B] tracking-tight">จัดการกฏระเบียบหอพัก</h1>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3.5 bg-[#3E342B] text-white rounded-2xl font-black text-sm shadow-xl hover:-translate-y-1 transition-all"
        >
          เพิ่มข้อกำหนดใหม่
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-12 flex justify-center scroll-smooth custom-scrollbar">
        <div className="w-full max-w-4xl space-y-6">
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-3xl border border-[#E5DFD3]" />)}
                </div>
            ) : rules.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                    <div className="text-2xl mb-4">📜</div>
                    <p className="font-bold text-[#3E342B]">ยังไม่มีข้อกำหนดหอพัก</p>
                </div>
            ) : (
                rules.map((rule, idx) => (
                    <div key={rule.id} className="bg-white rounded-[32px] border border-[#E5DFD3] p-10 shadow-sm hover:shadow-xl transition-all relative group">
                        <div className="absolute top-0 right-10 -translate-y-1/2 w-16 h-16 bg-[#8B7355] text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-[#8B7355]/20">
                            {idx + 1}
                        </div>

                        <div className="flex justify-between items-start mb-4 pr-12">
                            <h3 className="text-2xl font-black text-[#3E342B]">{rule.title}</h3>
                            <button 
                                onClick={() => deleteRule(rule.id)}
                                className="p-3 text-[#A08D74] hover:text-rose-500 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>

                        <div className="text-[#5A4D41] font-medium leading-normal whitespace-pre-line">
                            {rule.content}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3E342B]/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl border border-[#8B7355]/20">
             <div className="bg-[#3E342B] p-8 text-white">
                <h2 className="text-2xl font-black">เพิ่มข้อกำหนดใหม่</h2>
                <p className="text-white/40 text-sm font-black uppercase tracking-wide">Dormitory Rules & Regulations</p>
             </div>
             
             <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-2">
                    <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">หัวข้อกฏระเบียบ</label>
                    <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-black focus:bg-white outline-none focus:ring-2 focus:ring-[#8B7355] transition-all" placeholder="เช่น การจอดรถ, การทำความสะอาด" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-[#A08D74] uppercase tracking-wider ml-1">เนื้อหา/รายละเอียด</label>
                    <textarea required rows={6} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full px-6 py-4 bg-[#F3EFE9] border border-[#E5DFD3] rounded-2xl font-bold focus:bg-white outline-none focus:ring-2 focus:ring-[#8B7355] transition-all resize-none" placeholder="ระบุรายละเอียดข้อกำหนดอย่างชัดเจน..." />
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black text-[#A08D74]">ยกเลิก</button>
                    <button type="submit" className="flex-[2] py-5 bg-[#3E342B] text-white text-xs font-black rounded-3xl shadow-2xl shadow-black/20 hover:-translate-y-1 active:scale-95 transition-all">บันทึกข้อกำหนด</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
