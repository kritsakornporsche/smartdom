import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

export default async function DatabaseViewer(props: { searchParams: Promise<{ table?: string }> }) {
  const searchParams = await props.searchParams;
  const sql = neon(process.env.DATABASE_URL || '');
  
  // Fetch all tables in the public schema
  const tablesResult = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  
  const tables = tablesResult.map((t) => t.table_name);
  const selectedTable = searchParams.table || (tables.length > 0 ? tables[0] : '');

  let columns: string[] = [];
  let rows: any[] = [];
  let errorStr = '';

  if (selectedTable && tables.includes(selectedTable)) {
    try {
      // Safe static queries (Neon sql`` requires static strings)
      if (selectedTable === 'users') rows = await sql`SELECT * FROM users ORDER BY id DESC LIMIT 50`;
      else if (selectedTable === 'rooms') rows = await sql`SELECT * FROM rooms ORDER BY id DESC LIMIT 50`;
      else if (selectedTable === 'tenants') rows = await sql`SELECT * FROM tenants ORDER BY id DESC LIMIT 50`;
      else if (selectedTable === 'bills') rows = await sql`SELECT * FROM bills ORDER BY id DESC LIMIT 50`;
      else if (selectedTable === 'announcements') rows = await sql`SELECT * FROM announcements ORDER BY id DESC LIMIT 50`;
      else if (selectedTable === 'maintenance_requests') rows = await sql`SELECT * FROM maintenance_requests ORDER BY id DESC LIMIT 50`;
      else if (selectedTable === 'contracts') rows = await sql`SELECT * FROM contracts ORDER BY id DESC LIMIT 50`;
      else if (selectedTable === 'move_out_requests') rows = await sql`SELECT * FROM move_out_requests ORDER BY id DESC LIMIT 50`;
      
      if (rows.length > 0) {
        columns = Object.keys(rows[0]);
      } else {
        const colsResult = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${selectedTable}`;
        columns = colsResult.map(c => c.column_name);
      }
    } catch (err: any) {
      errorStr = err.message;
    }
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
        <div className="h-20 flex items-center px-8 border-b border-slate-100 shrink-0 mb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold hover:bg-indigo-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <span className="font-bold text-lg tracking-tight">Database</span>
          </div>
        </div>

        <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">ตารางในระบบ (Tables)</div>
        <nav className="flex-1 px-4 space-y-1">
          {tables.map((table) => (
            <Link 
              key={table} 
              href={`/admin/database?table=${table}`}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${
                selectedTable === table 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{table}</span>
              <svg className={`w-4 h-4 ${selectedTable === table ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* Header */}
        <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4z" /></svg>
              ตาราง: {selectedTable}
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">แสดงข้อมูลล่าสุด 50 รายการ</p>
          </div>
          <div className="flex gap-2">
             <Link href="/admin" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-bold transition-all">
                กลับหน้า Admin
             </Link>
          </div>
        </header>

        {/* Table Data Viewer */}
        <div className="flex-1 overflow-auto p-8">
          {errorStr ? (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-6 rounded-2xl">
              <h3 className="font-bold mb-2">เกิดข้อผิดพลาดในการดึงข้อมูล</h3>
              <p className="font-mono text-sm">{errorStr}</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center p-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl">
              ไม่พบตารางในฐานข้อมูล
            </div>
          ) : columns.length === 0 ? (
            <div className="text-center p-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl bg-[#F8FAFC]">
              <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              <p className="font-bold">ไม่มีข้อมูลในตารางนี้</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      {columns.map((col) => (
                        <th key={col} className="px-6 py-4 font-bold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, idx) => (
                      <tr key={row.id || idx} className="bg-white hover:bg-slate-50/50 transition-colors">
                        {columns.map((col) => {
                          const val = row[col];
                          // Convert dates/objects to string
                          const displayVal = val === null ? <span className="text-slate-300 italic">null</span> : 
                                            val instanceof Date ? new Date(val).toLocaleString() : 
                                            typeof val === 'object' ? JSON.stringify(val) : 
                                            String(val);
                          return (
                            <td key={col} className="px-6 py-4 text-slate-600 whitespace-nowrap max-w-xs truncate" title={String(val)}>
                              {displayVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      
    </div>
  );
}
