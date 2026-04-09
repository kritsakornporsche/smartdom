import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
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
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">SmartDom</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Menu</div>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Tenants
          </Link>
          <Link href="/admin/rooms" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Rooms
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Billing
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold">Admin Operations</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="h-10 w-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden mix-blend-multiply">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="Admin" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-sm font-medium mb-1">Total Tenants</div>
                <div className="text-3xl font-bold text-slate-800">142</div>
                <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  <span>12% from last month</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-sm font-medium mb-1">Occupancy Rate</div>
                <div className="text-3xl font-bold text-slate-800">94%</div>
                <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  <span>2% from last month</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-sm font-medium mb-1">Pending Maintenance</div>
                <div className="text-3xl font-bold text-slate-800">4</div>
                <div className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span>Requires attention</span>
                </div>
              </div>
            </div>

            {/* System Status API Connection */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                Core Systems Integration
              </h2>
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    
                    <div className="flex-1 w-full">
                      <div className={`p-5 rounded-2xl border ${
                        dbStatus === 'Connected' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                      } flex items-start space-x-4 transition-all duration-300`}>
                        <div className={`p-2 rounded-full shrink-0 ${
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
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <h3 className={`font-semibold text-lg truncate ${
                              dbStatus === 'Connected' ? 'text-emerald-800' : 'text-rose-800'
                            }`}>
                              Database Connection API
                            </h3>
                            {dbStatus === 'Connected' && (
                              <span className="text-xs font-bold bg-white text-emerald-600 px-3 py-1 rounded-full shadow-sm shrink-0">
                                {responseTime}ms
                              </span>
                            )}
                          </div>
                          
                          <p className={`text-sm mt-1 mb-3 ${
                            dbStatus === 'Connected' ? 'text-emerald-600/80' : 'text-rose-600/80'
                          }`}>
                            Neon Serverless Postgres (SmartdomDB)
                          </p>

                          {dbStatus === 'Connected' && (
                            <div className="p-3 bg-white/60 rounded-xl border border-emerald-200/50">
                              <p className="text-xs font-mono text-emerald-800 break-words leading-relaxed">
                                {dbVersion}
                              </p>
                            </div>
                          )}

                          {dbStatus === 'Error' && (
                            <div className="p-3 bg-white/60 rounded-xl border border-rose-200/50">
                              <p className="text-xs font-mono text-rose-800 break-words leading-relaxed">
                                Error: {errorMsg}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-72 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div> API Endpoint
                        </span>
                        <span className="text-slate-800 font-semibold text-sm">Online</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Region
                        </span>
                        <span className="text-slate-800 font-semibold text-sm">us-east-1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Auth Sync
                        </span>
                        <span className="text-slate-800 font-semibold text-sm">Active</span>
                      </div>
                    </div>

                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium">Last pinged precisely on page load</p>
                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                    View Full Logs
                  </button>
                </div>
              </div>
            </div>
            
            {/* Recent Activity Table (Placeholder to look like a real admin) */}
            <div>
              <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600">Event</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">User / Entity</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium">Payment Received #INV-492</td>
                      <td className="px-6 py-4 text-slate-500">Room 204 (T. Jittra)</td>
                      <td className="px-6 py-4 text-slate-500">2 mins ago</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Completed</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium">Maintenance Request #MR-108</td>
                      <td className="px-6 py-4 text-slate-500">Room 412 (P. Anucha)</td>
                      <td className="px-6 py-4 text-slate-500">45 mins ago</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pending</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium">New Lease Signed</td>
                      <td className="px-6 py-4 text-slate-500">Room 105 (S. Niran)</td>
                      <td className="px-6 py-4 text-slate-500">2 hours ago</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Completed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
