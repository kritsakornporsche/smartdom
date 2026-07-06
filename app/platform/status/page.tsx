'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface SystemStatus {
  status: 'checking' | 'connected' | 'error';
  latency: number | null;
  lastChecked: Date | null;
  details: string | null;
}

export default function PlatformStatusPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [dbStatus, setDbStatus] = useState<SystemStatus>({
    status: 'checking',
    latency: null,
    lastChecked: null,
    details: null,
  });

  const checkConnection = async () => {
    setDbStatus(prev => ({ ...prev, status: 'checking', details: null }));
    const startTime = performance.now();
    
    try {
      const res = await fetch('/api/db-test');
      const data = await res.json();
      const endTime = performance.now();
      
      if (data.success) {
        setDbStatus({
          status: 'connected',
          latency: Math.round(endTime - startTime),
          lastChecked: new Date(),
          details: null,
        });
      } else {
        setDbStatus({
          status: 'error',
          latency: null,
          lastChecked: new Date(),
          details: data.error,
        });
      }
    } catch (err: any) {
      setDbStatus({
        status: 'error',
        latency: null,
        lastChecked: new Date(),
        details: err.message || 'Network error occurred',
      });
    }
  };

  useEffect(() => {
    if (authStatus === 'loading') return;
    if ((session?.user as any)?.role !== 'platform_admin') {
      router.push('/signin');
      return;
    }
    
    checkConnection();
    
    // Setup interval to check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [session, authStatus, router]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-10 py-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Status</h1>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-0.5">ตรวจสอบสถานะระบบและการเชื่อมต่อ</p>
        </div>
        <button 
          onClick={checkConnection}
          disabled={dbStatus.status === 'checking'}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
        >
          <span className={`text-sm ${dbStatus.status === 'checking' ? 'animate-spin' : ''}`}>🔄</span>
          <span className="text-white text-xs font-bold">ตรวจสอบใหม่</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Main Status Card */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 blur-3xl opacity-20 pointer-events-none ${
              dbStatus.status === 'connected' ? 'bg-green-500' :
              dbStatus.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            
            <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
              <span>🔌</span> การเชื่อมต่อฐานข้อมูลหลัก (Platform Database)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Indicator */}
              <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">สถานะปัจจุบัน</p>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-4 w-4">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      dbStatus.status === 'connected' ? 'bg-green-400' : 
                      dbStatus.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-4 w-4 ${
                      dbStatus.status === 'connected' ? 'bg-green-500' : 
                      dbStatus.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                  <span className={`text-xl font-black uppercase tracking-wider ${
                    dbStatus.status === 'connected' ? 'text-green-400' : 
                    dbStatus.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {dbStatus.status === 'connected' ? 'Online' : 
                     dbStatus.status === 'error' ? 'Offline' : 'Checking...'}
                  </span>
                </div>
              </div>

              {/* Latency */}
              <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">ความหน่วง (Latency)</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-white">
                    {dbStatus.latency !== null ? dbStatus.latency : '--'}
                  </span>
                  <span className="text-white/40 font-bold mb-1">ms</span>
                </div>
              </div>

              {/* Last Checked */}
              <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">อัปเดตล่าสุด</p>
                <div className="text-white font-bold">
                  {dbStatus.lastChecked ? dbStatus.lastChecked.toLocaleTimeString('th-TH') : '--:--:--'}
                </div>
                <div className="text-white/40 text-xs mt-1">
                  เช็คอัตโนมัติทุก 30 วินาที
                </div>
              </div>
            </div>

            {/* Error Details */}
            {dbStatus.status === 'error' && dbStatus.details && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <h3 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <span>⚠️</span> รายละเอียดข้อผิดพลาด
                </h3>
                <div className="bg-black/40 rounded-xl p-4 overflow-x-auto">
                  <code className="text-red-400/80 text-xs font-mono break-all whitespace-pre-wrap">
                    {dbStatus.details}
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* System Info */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
              <span>💻</span> ข้อมูลระบบ (System Information)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { label: 'Environment', value: 'Production' },
                 { label: 'Database Service', value: 'MySQL Server' },
                 { label: 'Region', value: 'AWS us-east-1' },
                 { label: 'API Framework', value: 'Next.js App Router' },
               ].map((info, i) => (
                 <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                    <span className="text-white/40 text-sm font-semibold">{info.label}</span>
                    <span className="text-white text-sm font-bold">{info.value}</span>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
