'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import KeeperSidebar from '../components/KeeperSidebar';

interface MaidJob {
  id: number;
  status: string;
  job_type: string;
  created_at: string;
  completed_at?: string;
  room_number: string;
  notes?: string;
  photo_url?: string;
}

interface MaidData {
  stats: {
    total: number;
    inProgress: number;
    completed: number;
  };
  jobs: MaidJob[];
}

const statusConfig: Record<string, { label: string; bg: string; icon: string }> = {
  pending: { label: 'รอทำความสะอาด', bg: 'bg-amber-100 text-amber-700', icon: '🧹' },
  in_progress: { label: 'กำลังดำเนินการ', bg: 'bg-primary/10 text-primary', icon: '✨' },
  completed: { label: 'เสร็จสิ้น', bg: 'bg-green-100 text-green-700', icon: '✅' },
};

const jobTypeConfig: Record<string, string> = {
  move_out: 'ย้ายออก',
  weekly: 'ทำความสะอาดรายสัปดาห์',
  requested: 'ร้องขอพิเศษ',
};

export default function MaidDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [data, setData] = useState<MaidData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  // Filtering & Search
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedJob, setSelectedJob] = useState<MaidJob | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishNotes, setFinishNotes] = useState('');
  const [finishPhoto, setFinishPhoto] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      const user = session?.user as any;
      if (user?.role !== 'keeper' || user?.sub_role !== 'maid') {
        router.push('/');
      } else {
        fetchData();
      }
    }
  }, [status, session, router]);

  // Polling every 30 seconds
  useEffect(() => {
    const poll = setInterval(() => {
      fetchData(false);
    }, 30000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('th-TH'));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('th-TH'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFinishPhoto(data.url);
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoadingData(true);
    try {
      const res = await fetch('/api/keeper/maid/jobs');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Error fetching maid jobs:', err);
    } finally {
      if (showLoading) setTimeout(() => setLoadingData(false), 300);
    }
  };

  const updateStatus = async (id: number, newStatus: string, notes?: string, photo?: string) => {
    try {
      const res = await fetch('/api/keeper/maid/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, notes, photo_url: photo }),
      });
      const json = await res.json();
      if (json.success) {
        setIsFinishing(false);
        setFinishNotes('');
        setFinishPhoto('');
        setSelectedJob(null);
        fetchData(); 
      } else {
        alert('เกิดข้อผิดพลาด: ' + json.message);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('ไม่สามารถอัปเดตสถานะได้ ติดต่อผู้ดูแลระบบ');
    }
  };

  const filteredJobs = useMemo(() => {
    if (!data?.jobs) return [];
    return data.jobs.filter(job => {
      const matchesFilter = filter === 'all' || job.status === filter;
      const matchesSearch = job.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (jobTypeConfig[job.job_type] || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [data, filter, searchQuery]);

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center bg-[#FDFBF7] font-display text-[#A08D74] tracking-wider">กำลังโหลดระบบ...</div>;
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7]">
      <KeeperSidebar />
      
      <main className="flex-1 flex flex-col h-screen min-w-0">
        {/* Header */}
        <header className="h-20 bg-[#FAF8F5] border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[#3E342B]">ภาพรวมงานแม่บ้าน</h1>
            <p className="text-xs text-[#A08D74] font-medium mt-0.5">ยินดีต้อนรับคุณ {session?.user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-[#A08D74] hidden sm:block">เวลาปัจจุบัน: {currentTime}</div>
            <button
              onClick={() => signOut({ callbackUrl: '/signin' })}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors px-4 py-2 rounded-xl"
            >
              ออกจากระบบ
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#E5DFD3] shadow-sm">
              <Image width={40} height={40} src={`https://ui-avatars.com/api/?name=${session?.user?.name || 'Maid'}&background=e2aba1&color=fff`} alt="แม่บ้าน" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#E5DFD3] shadow-sm p-6 rounded-3xl flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">🧹</div>
                <span className="text-sm font-semibold text-[#3E342B]">งานทั้งหมดวันนี้</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-display font-semibold text-[#8B7355]">{loadingData ? '-' : data?.stats?.total || 0}</span>
                  <span className="text-sm text-[#A08D74] font-medium">ห้อง</span>
                </div>
              </div>
              <div className="bg-white border border-[#E5DFD3] shadow-sm p-6 rounded-3xl flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">⏳</div>
                <span className="text-sm font-semibold text-[#3E342B]">กำลังทำความสะอาด</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-display font-semibold text-amber-500">{loadingData ? '-' : data?.stats?.inProgress || 0}</span>
                  <span className="text-sm text-amber-500/70 font-medium">ห้อง</span>
                </div>
              </div>
              <div className="bg-white border border-[#E5DFD3] shadow-sm p-6 rounded-3xl flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">✨</div>
                <span className="text-sm font-semibold text-[#3E342B]">เสร็จสมบูรณ์วันนี้</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-display font-semibold text-emerald-500">{loadingData ? '-' : data?.stats?.completed || 0}</span>
                  <span className="text-sm text-emerald-500/70 font-medium">ห้อง</span>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 p-1 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl w-full md:w-auto">
                {(['all', 'pending', 'in_progress', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      filter === f 
                        ? 'bg-[#8B7355] text-white shadow-sm' 
                        : 'text-[#A08D74] hover:text-[#5A4D41]'
                    }`}
                  >
                    {f === 'all' ? 'ทั้งหมด' : statusConfig[f]?.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="ค้นหาเลขห้อง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E5DFD3] rounded-2xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 text-[#3E342B]"
                />
                <svg className="absolute left-3.5 top-3 w-4 h-4 text-[#A08D74]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* List */}
            <section className="bg-white border border-[#E5DFD3] rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
              <div className="px-7 py-5 border-b border-[#E5DFD3] flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div>
                  <h2 className="font-display text-base font-bold text-[#3E342B]">คิวงาน ({filteredJobs.length})</h2>
                  <p className="text-xs text-[#A08D74] mt-0.5">รายการงานที่ตรงตามเงื่อนไข</p>
                </div>
                <button 
                  onClick={() => fetchData()} 
                  disabled={loadingData}
                  className={`text-xs font-semibold hover:text-[#5A4D41] flex items-center gap-1 transition-all ${loadingData ? 'text-[#A08D74] opacity-50 cursor-not-allowed' : 'text-[#8B7355]'}`}
                >
                  <svg className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loadingData ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
                </button>
              </div>
              
              {loadingData ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-[#8B7355]/20 border-t-[#8B7355] rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-[#A08D74]">กำลังดึงข้อมูลงานล่าสุด...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="text-2xl">📭</div>
                  <p className="text-sm font-medium text-[#A08D74]">ไม่พบรายการงานที่ต้องการ</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5DFD3]">
                  {filteredJobs.map((task) => (
                    <div 
                      key={task.id} 
                      className="px-7 py-6 flex items-center gap-6 hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                      onClick={() => setSelectedJob(task)}
                    >
                      <div className="h-14 w-14 rounded-2xl bg-[#F3EFE9] flex flex-col items-center justify-center shrink-0 border border-[#E5DFD3] group-hover:border-[#8B7355] transition-colors">
                        <span className="text-sm font-bold text-[#A08D74] uppercase leading-none mb-1">ห้อง</span>
                        <span className="text-lg font-black text-[#3E342B] leading-none">{task.room_number || '-'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                           <h3 className="text-sm font-bold text-[#3E342B] truncate">{jobTypeConfig[task.job_type] || task.job_type}</h3>
                           <span className={`px-2 py-0.5 rounded-full text-xs font-black tracking-wider uppercase ${statusConfig[task.status]?.bg || 'bg-[#E5DFD3] text-[#5A4D41]'}`}>
                            {statusConfig[task.status]?.label || task.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                          <span className="text-sm text-[#A08D74] flex items-center gap-1 font-medium">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            มอบหมายเมื่อ {new Date(task.created_at).toLocaleDateString('th-TH')}
                          </span>
                          {task.completed_at && (
                            <span className="text-sm text-emerald-600 flex items-center gap-1 font-bold italic">
                              สำเร็จเมื่อ {new Date(task.completed_at).toLocaleTimeString('th-TH')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        {task.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(task.id, 'in_progress')}
                            className="text-sm font-bold px-5 py-2.5 bg-[#8B7355] text-white rounded-xl shadow-sm hover:focus:ring-2 hover:bg-[#5A4D41] transition-all transform hover:scale-105 active:scale-95"
                          >
                            รับงาน
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button 
                            onClick={() => {
                              setSelectedJob(task);
                              setIsFinishing(true);
                            }}
                            className="text-sm font-bold px-5 py-2.5 bg-emerald-600 text-white rounded-xl shadow-sm hover:focus:ring-2 hover:bg-emerald-700 transition-all transform hover:scale-105 active:scale-95"
                          >
                            งานเสร็จสิ้น
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Modal: Job Details & Completion Form */}
        {(selectedJob) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#3E342B]/40 backdrop-blur-sm" onClick={() => { setSelectedJob(null); setIsFinishing(false); }}></div>
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-[#E5DFD3] animate-in fade-in zoom-in duration-200">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F3EFE9] rounded-2xl flex items-center justify-center text-2xl">
                            {statusConfig[selectedJob.status]?.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-[#3E342B]">
                                {isFinishing ? 'ยืนยันงานเสร็จสิ้น' : 'รายละเอียดงาน'}
                            </h3>
                            <p className="text-xs text-[#A08D74] font-medium">ห้อง {selectedJob.room_number}</p>
                        </div>
                    </div>
                    <button onClick={() => { setSelectedJob(null); setIsFinishing(false); }} className="text-[#A08D74] hover:text-[#3E342B] transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {isFinishing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#A08D74] mb-2">บันทึกเพิ่มเติม (ถ้ามี)</label>
                      <textarea 
                        value={finishNotes}
                        onChange={(e) => setFinishNotes(e.target.value)}
                        placeholder="ระบุสิ่งที่ทำลงไป หรือสิ่งที่พบล่าสุด..."
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#A08D74] mb-2">อัปโหลดรูปภาพหลักฐานทำงานเสร็จ (Proof of Work)</label>
                      <label className="w-full border-2 border-dashed border-[#E5DFD3] rounded-2xl p-6 flex flex-col items-center justify-center bg-[#FAF8F5] hover:bg-[#F3EFE9] transition-colors cursor-pointer group relative overflow-hidden h-40">
                          {finishPhoto ? (
                              <div className="relative w-full h-full">
                                  <Image src={finishPhoto} alt="Proof" fill className="object-contain" />
                                  <div className="absolute top-0 right-0 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer z-10" onClick={(e) => { e.preventDefault(); setFinishPhoto(''); }}>✕</div>
                              </div>
                          ) : isUploading ? (
                              <div className="text-[#A08D74] font-bold text-sm animate-pulse">กำลังอัปโหลดรูปภาพ...</div>
                          ) : (
                              <>
                                  <span className="text-3xl mb-2 opacity-50 group-hover:scale-110 transition-transform">📸</span>
                                  <span className="text-xs font-bold text-[#A08D74] text-center mb-3">คลิกเพื่ออัปโหลด รูปภาพหลังทำความสะอาด</span>
                                  <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={handleFileUpload}
                                      className="hidden"
                                  />
                              </>
                          )}
                      </label>
                    </div>
                    <div className="flex gap-3 pt-4">
                       <button 
                        onClick={() => setIsFinishing(false)}
                        className="flex-1 px-4 py-3.5 rounded-2xl border border-[#E5DFD3] text-[#A08D74] text-xs font-bold hover:bg-[#FAF8F5] transition-all"
                       >
                         ยกเลิก
                       </button>
                       <button 
                        onClick={() => updateStatus(selectedJob.id, 'completed', finishNotes, finishPhoto)}
                        className="flex-1 px-4 py-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                       >
                         ส่งงานเสร็จสิ้น
                       </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#E5DFD3]">
                        <dl className="grid grid-cols-2 gap-y-4 text-sm">
                            <dt className="text-[#A08D74] font-medium">ประเภทงาน:</dt>
                            <dd className="text-[#3E342B] font-bold">{jobTypeConfig[selectedJob.job_type] || selectedJob.job_type}</dd>
                            
                            <dt className="text-[#A08D74] font-medium">สถานะ:</dt>
                            <dd className="font-bold">
                                <span className={`px-2 py-0.5 rounded-full text-sm uppercase ${statusConfig[selectedJob.status]?.bg}`}>
                                    {statusConfig[selectedJob.status]?.label}
                                </span>
                            </dd>

                            <dt className="text-[#A08D74] font-medium">เวลาเริ่มงาน:</dt>
                            <dd className="text-[#3E342B] font-bold">{new Date(selectedJob.created_at).toLocaleString('th-TH')}</dd>
                            
                            {selectedJob.completed_at && (
                                <>
                                    <dt className="text-[#A08D74] font-medium">เวลาเสร็จสิ้น:</dt>
                                    <dd className="text-emerald-600 font-bold">{new Date(selectedJob.completed_at).toLocaleString('th-TH')}</dd>
                                </>
                            )}
                        </dl>
                    </div>

                    {(selectedJob.notes || selectedJob.photo_url) && (
                         <div className="space-y-4">
                            {selectedJob.notes && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A08D74] mb-2">บันทึกจากผู้ทำ:</h4>
                                    <p className="text-sm text-[#3E342B] bg-white border border-[#E5DFD3] p-4 rounded-2xl">{selectedJob.notes}</p>
                                </div>
                            )}
                            {selectedJob.photo_url && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A08D74] mb-2">หลักฐานงาน:</h4>
                                    {selectedJob.photo_url.startsWith('http') || selectedJob.photo_url.startsWith('/') ? (
                                        <div className="rounded-2xl overflow-hidden border border-[#E5DFD3] relative h-40 w-full mb-2">
                                            <Image src={selectedJob.photo_url} alt="Evidence" fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <p className="text-sm text-blue-600 underline font-medium">{selectedJob.photo_url}</p>
                                    )}
                                </div>
                            )}
                         </div>
                    )}

                    <div className="pt-4 space-y-3">
                        <Link 
                            href={`/keeper/chat?room=${selectedJob.room_number}`}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl border-2 border-[#8B7355] text-[#8B7355] text-sm font-bold shadow-sm hover:bg-[#8B7355] hover:text-white transition-all group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            ส่งข้อความถึงผู้เช่า
                        </Link>

                        {selectedJob.status === 'pending' && (
                            <button 
                                onClick={() => updateStatus(selectedJob.id, 'in_progress')}
                                className="w-full px-4 py-4 rounded-2xl bg-[#8B7355] text-white text-sm font-bold shadow-lg shadow-[#8B7355]/20 hover:bg-[#5A4D41] transition-all"
                            >
                                เริ่มดำเนินการทันที
                            </button>
                        )}
                        {selectedJob.status === 'in_progress' && (
                            <button 
                                onClick={() => setIsFinishing(true)}
                                className="w-full px-4 py-4 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                            >
                                ดำเนินการเสร็จสิ้น (แนบหลักฐาน)
                            </button>
                        )}
                        {selectedJob.status === 'completed' && (
                            <button 
                                onClick={() => setSelectedJob(null)}
                                className="w-full px-4 py-4 rounded-2xl border border-[#E5DFD3] text-[#A08D74] text-sm font-bold hover:bg-[#FAF8F5] transition-all"
                            >
                                ปิดหน้าต่าง
                            </button>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
