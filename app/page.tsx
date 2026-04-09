import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic'; // บังคับให้ดึงข้อมูลใหม่ทุกครั้งที่รีเฟรชหน้าเว็บ

export default async function APICheckPage() {
  let dbStatus: 'Connected' | 'Error' | 'Pending' = 'Pending';
  let dbVersion = '';
  let errorMsg = '';
  let responseTime = 0;

  const startT = Date.now();
  try {
    const sql = neon(process.env.DATABASE_URL || '');
    const result = await sql`SELECT version()`;
    
    dbVersion = result[0].version;
    dbStatus = 'Connected';
    responseTime = Date.now() - startT;
  } catch (error: any) {
    dbStatus = 'Error';
    errorMsg = error.message || 'Unknown error occurred connecting to database';
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-800">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight">System Status</h1>
              <p className="text-blue-100 text-sm font-medium">Smartdom Infrastructure</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Database Connection</h2>
            
            <div className={`p-5 rounded-2xl border ${
              dbStatus === 'Connected' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
            } flex items-start space-x-4 transition-all duration-300`}>
              <div className={`p-2 rounded-full ${
                dbStatus === 'Connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {dbStatus === 'Connected' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-lg ${
                    dbStatus === 'Connected' ? 'text-emerald-800' : 'text-rose-800'
                  }`}>
                    {dbStatus === 'Connected' ? 'Operational' : 'Connection Failed'}
                  </h3>
                  {dbStatus === 'Connected' && (
                    <span className="text-xs font-semibold bg-white text-emerald-600 px-2 py-1 rounded-full shadow-sm">
                      {responseTime}ms
                    </span>
                  )}
                </div>
                
                <p className={`text-sm mt-1 mb-2 ${
                  dbStatus === 'Connected' ? 'text-emerald-600/80' : 'text-rose-600/80'
                }`}>
                  Neon Serverless Postgres Database (SmartdomDB)
                </p>

                {dbStatus === 'Connected' && (
                  <div className="mt-3 p-3 bg-white/60 rounded-xl border border-emerald-200/50">
                    <p className="text-xs font-mono text-emerald-800 break-words leading-relaxed">
                      {dbVersion}
                    </p>
                  </div>
                )}

                {dbStatus === 'Error' && (
                  <div className="mt-3 p-3 bg-white/60 rounded-xl border border-rose-200/50">
                    <p className="text-xs font-mono text-rose-800 break-words leading-relaxed">
                      Error: {errorMsg}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Service Details</h2>
            
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div> API Route
              </span>
              <span className="text-slate-800 font-semibold text-sm">Online</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Web Server
              </span>
              <span className="text-slate-800 font-semibold text-sm">Next.js App Router</span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Datacenter
              </span>
              <span className="text-slate-800 font-semibold text-sm">AWS us-east-1 (Neon)</span>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Last checked: {new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })} (Bangkok Time)
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Refresh the page to test again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
