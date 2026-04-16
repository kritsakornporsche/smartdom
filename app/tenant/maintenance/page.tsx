'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MaintenanceRequest {
  id: number;
  issue_type: string;
  description: string;
  status: string;
  created_at: string;
}

export default function TenantMaintenancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [issueType, setIssueType] = useState('ทั่วไป');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      fetchRequests();
    }
  }, [status]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/tenant/maintenance/history'); // I'll create this helper next or use a better route
      // Wait, I can just use a server component style if I want, but let's go with client for the interactive form
      const res2 = await fetch('/api/keeper/technician/jobs'); // Actually, let's create a dedicated tenant one
      const apiRes = await fetch('/api/tenant/maintenance/list'); // I'll create this
      const json = await apiRes.json();
      if (json.success) setRequests(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/tenant/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_type: issueType, description }),
      });
      const json = await res.json();
      if (json.success) {
        setShowForm(false);
        setDescription('');
        setIssueType('ทั่วไป');
        fetchRequests();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') return null;

  return (
    <div className="p-10 md:p-16">
      <div className="max-w-4xl mx-auto pb-16 space-y-12">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[#3E342B] mb-2">การดูแลรักษา (Maintenance)</h1>
            <p className="text-[#8B7355] font-medium">แจ้งปัญหาและติดตามกระบวนการซ่อมแซมภายในห้องพัก</p>
          </div>
          {!showForm && (
            <button 
                onClick={() => setShowForm(true)}
                className="bg-[#8B7355] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-[#8B7355]/20 hover:scale-105 active:scale-95 transition-all"
            >
                + แจ้งซ่อมใหม่
            </button>
          )}
        </header>

        {showForm && (
          <div className="bg-white rounded-[2.5rem] border border-[#E5DFD3] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-black text-[#3E342B] mb-8">แบบฟอร์มแจ้งซ่อม</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#A08D74] px-1">ประเภทปัญหา</label>
                <select 
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20"
                >
                    <option>ทั่วไป</option>
                    <option>ระบบไฟฟ้า</option>
                    <option>ระบบประปา</option>
                    <option>เครื่องปรับอากาศ</option>
                    <option>เฟอร์นิเจอร์</option>
                    <option>อื่นๆ</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#A08D74] px-1">รายละเอียดปัญหา</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="กรุณาระบุปัญหาที่พบ เช่น ไฟเพดานดวงกลางดับ, น้ำหยดใต้ซิงค์..."
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl px-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 min-h-[150px]"
                    required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 border border-[#E5DFD3] text-[#A08D74] rounded-2xl font-bold text-sm hover:bg-[#FAF8F5]"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-4 bg-[#8B7355] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#8B7355]/20 disabled:opacity-50"
                >
                  {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งเรื่องแจ้งซ่อม'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-black text-[#3E342B] flex items-center gap-3">
             ประวัติการแจ้งซ่อมล่วงหน้า
             <span className="text-xs bg-[#F2EFE9] text-[#8B7355] px-2 py-0.5 rounded-lg">{requests.length}</span>
          </h2>
          
          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-20 animate-pulse text-[#A08D74]">กำลังโหลดข้อมูล...</div>
            ) : requests.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-[#E5DFD3] rounded-[2.5rem] p-20 text-center">
                <p className="text-[#A08D74] font-bold">ยังไม่มีประวัติการแจ้งซ่อม</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white rounded-[2.5rem] border border-[#E5DFD3] shadow-sm overflow-hidden flex items-stretch hover:shadow-xl transition-all group">
                   <div className={`w-4 shrink-0 ${
                      req.status === 'Pending' ? 'bg-[#E9C46A]' :
                      req.status === 'In Progress' ? 'bg-[#2196F3]' :
                      'bg-[#4CAF50]'
                   }`}></div>
                   <div className="p-8 flex-1 flex flex-col md:flex-row justify-between gap-6 md:items-center">
                     <div>
                       <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-black text-[#3E342B]">{req.issue_type}</h3>
                            <span className="text-[10px] font-bold text-[#C2B7A8] uppercase tracking-widest">#{req.id.toString().padStart(4, '0')}</span>
                       </div>
                       <p className="text-[#8B7355] text-sm mb-4 leading-relaxed font-medium">"{req.description}"</p>
                       <div className="text-[10px] text-[#A08D74] font-bold tracking-widest uppercase flex items-center gap-2">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         {new Date(req.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       </div>
                     </div>
                     
                     <div className="shrink-0">
                        <span className={`inline-block px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border-2 ${
                          req.status === 'Pending' ? 'bg-[#FAF3E8] text-[#D4A373] border-[#E9C46A]' :
                          req.status === 'In Progress' ? 'bg-[#E3F2FD] text-[#2196F3] border-[#BBDEFB]' :
                          'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]'
                        }`}>
                          {req.status === 'Pending' ? 'รอดำเนินการ' : req.status === 'In Progress' ? 'กำลังซ่อมแซม' : 'เสร็จสิ้น'}
                        </span>
                     </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
