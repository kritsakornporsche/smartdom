'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';

interface CleaningJob {
  id: number;
  room_number: string;
  keeper_name: string;
  status: string;
  job_type: string;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  completed_at: string | null;
}

interface MaintenanceJob {
  id: number;
  room_number: string;
  keeper_name: string;
  issue: string;
  urgency: string;
  status: string;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  completed_at: string | null;
}

export default function AdminJobsPage() {
  const [cleaningJobs, setCleaningJobs] = useState<CleaningJob[]>([]);
  const [maintenanceJobs, setMaintenanceJobs] = useState<MaintenanceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cleaning' | 'maintenance'>('maintenance');

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/admin/jobs');
      const data = await res.json();
      if (data.success) {
        setCleaningJobs(data.data.cleaning);
        setMaintenanceJobs(data.data.maintenance);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const updateJobStatus = async (id: number, type: 'cleaning' | 'maintenance', newStatus: string) => {
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchJobs(); // Refresh
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'เสร็จสิ้น') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'pending' || s === 'รอการดำเนินการ') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s === 'in progress' || s === 'กำลังดำเนินการ') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-background border-b border-border flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">ระบบตรวจสอบงาน</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">ติดตามการทำงานของพนักงานทำความสะอาดและช่างซ่อมบำรุง</p>
          </div>
          <div className="flex bg-accent/30 p-1 rounded-2xl border border-border">
            <button 
              onClick={() => setActiveTab('maintenance')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'maintenance' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'}`}
            >
              งานซ่อมบำรุง
            </button>
            <button 
              onClick={() => setActiveTab('cleaning')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'cleaning' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'}`}
            >
              งานทำความสะอาด
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-accent/5">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin h-8 w-8 text-primary mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"></div>
                <p className="text-sm font-bold text-muted-foreground">กำลังโหลดข้อมูลงาน...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {(activeTab === 'maintenance' ? maintenanceJobs : cleaningJobs).length === 0 ? (
                  <div className="bg-white border border-border rounded-3xl p-20 text-center shadow-sm">
                    <span className="text-2xl mb-6 block">✨</span>
                    <h3 className="font-display text-xl font-semibold">ไม่มีงานค้างในระบบ</h3>
                    <p className="text-muted-foreground mt-2">พนักงานจัดการงานทั้งหมดเสร็จเรียบร้อยแล้ว</p>
                  </div>
                ) : (
                  (activeTab === 'maintenance' ? maintenanceJobs : cleaningJobs).map((job) => (
                    <div key={job.id} className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col lg:flex-row group">
                      {/* Job Photo */}
                      <div className="lg:w-72 h-56 lg:h-auto bg-accent/20 relative shrink-0">
                        {job.photo_url ? (
                          <img src={job.photo_url} alt="Job evidence" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-sm uppercase tracking-wider bg-accent shadow-inner">
                            ไม่มีหลักฐานภาพถ่าย
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider border backdrop-blur-md ${getStatusBadge(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 p-8">
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
                          <div>
                            <div className="text-sm font-black uppercase tracking-wider text-primary mb-1">
                              {activeTab === 'maintenance' ? (job as any).urgency : (job as any).job_type} · ห้อง {job.room_number}
                            </div>
                            <h3 className="text-xl font-display font-bold text-foreground">
                              {activeTab === 'maintenance' ? (job as MaintenanceJob).issue : `ทำความสะอาดห้อง ${job.room_number}`}
                            </h3>
                          </div>
                          <div className="text-right">
                             <div className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-1">พนักงานที่รับผิดชอบ</div>
                             <div className="text-sm font-bold text-foreground">{job.keeper_name || 'รอดำเนินการ'}</div>
                          </div>
                        </div>

                        <div className="bg-accent/30 p-5 rounded-2xl mb-8 border border-border/40">
                          <div className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-2">บันทึกเพิ่มเติมจากพนักงาน</div>
                          <p className="text-sm font-medium text-foreground italic leading-normal">
                            "{job.notes || 'ไม่มีบันทึกเพิ่มเติม'}"
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-border">
                          <div className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
                             แจ้งเมื่อ: {new Date(job.created_at).toLocaleString('th-TH')}
                          </div>
                          <div className="flex gap-3">
                            {job.status !== 'เสร็จสิ้น' && job.status !== 'Completed' && (
                              <button 
                                onClick={() => updateJobStatus(job.id, activeTab, 'เสร็จสิ้น')}
                                className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-black uppercase tracking-wider rounded-full hover:scale-105 transition-transform"
                              >
                                อนุมัติการส่งงาน
                              </button>
                            )}
                            <button className="p-2.5 rounded-full border border-border hover:bg-accent transition-colors">
                              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
