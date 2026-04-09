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
      else if (selectedTable === 'dormitory_profile') rows = await sql`SELECT * FROM dormitory_profile ORDER BY id DESC LIMIT 50`;
      
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
    <div className="flex h-screen bg-[#FDFBF7] text-[#3E342B] font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-[#E5DFD3] flex flex-col shrink-0 overflow-y-auto">
        <div className="h-20 flex items-center px-8 border-b border-[#FAF8F5] shrink-0 mb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="h-8 w-8 bg-[#8B7355] rounded-lg flex items-center justify-center text-white font-bold hover:bg-[#725724] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <span className="font-bold text-lg tracking-tight text-[#3E342B]">Database</span>
          </div>
        </div>

        <div className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[#A08D74] mb-2">ตารางในระบบ (TABLES)</div>
        <nav className="flex-1 px-4 space-y-1">
          {tables.map((table) => (
            <Link 
              key={table} 
              href={`/admin/database?table=${table}`}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                selectedTable === table 
                  ? 'bg-[#8B7355] text-white shadow-lg shadow-[#8B7355]/20' 
                  : 'text-[#5A4D41] hover:bg-[#FAF8F5] hover:text-[#3E342B]'
              }`}
            >
              <span className={selectedTable === table ? 'text-[13px]' : 'text-xs uppercase tracking-wider'}>{table}</span>
              <svg className={`w-4 h-4 ${selectedTable === table ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </nav>
      </aside>


      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* Header */}
        <header className="h-20 border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="text-xl font-black flex items-center gap-2 text-[#3E342B]">
              <svg className="w-5 h-5 text-[#8B7355]" fill="currentColor" viewBox="0 0 24 24"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4z" /></svg>
              ตาราง: {selectedTable}
            </h1>
            <p className="text-[10px] text-[#A08D74] mt-1 uppercase tracking-widest font-bold">แสดงข้อมูลล่าสุด 50 รายการ</p>
          </div>
          <div className="flex gap-3">
             <Link href="/admin" className="px-6 py-2.5 bg-[#FAF8F5] border border-[#DCD3C6] text-[#5A4D41] rounded-xl hover:bg-[#F3EFE9] text-xs font-black transition-all uppercase tracking-widest">
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
            <div className="rounded-3xl border border-[#E5DFD3] overflow-hidden shadow-xl shadow-[#DCD3C6]/10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-[#A08D74] uppercase bg-[#FAF8F5] border-b border-[#E5DFD3]">
                    <tr>
                      {columns.map((col) => (
                        <th key={col} className="px-8 py-5 font-black tracking-widest whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3EFE9]">

                    {rows.map((row, idx) => (
                      <tr key={row.id || idx} className="bg-white hover:bg-[#FAF8F5] transition-colors">
                        {columns.map((col) => {
                          const val = row[col];
                          // Convert dates/objects to string
                          const displayVal = val === null ? <span className="text-[#DCD3C6] italic">null</span> : 
                                            val instanceof Date ? new Date(val).toLocaleString('th-TH') : 
                                            typeof val === 'object' ? JSON.stringify(val) : 
                                            String(val);
                          return (
                            <td key={col} className="px-8 py-5 text-[#5A4D41] font-medium whitespace-nowrap max-w-xs truncate" title={String(val)}>
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
