import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

async function getDashboardData() {
  const sql = neon(process.env.DATABASE_URL || '');
  
  // Hardcoded tenant ID = 1 for demo purposes
  const tenantId = 1;

  const announcements = await sql`
    SELECT * FROM announcements ORDER BY created_at DESC LIMIT 3
  `;

  const unpaidBills = await sql`
    SELECT * FROM bills WHERE tenant_id = ${tenantId} AND status = 'Unpaid' ORDER BY due_date ASC
  `;

  const recentMaintenance = await sql`
    SELECT * FROM maintenance_requests WHERE tenant_id = ${tenantId} ORDER BY created_at DESC LIMIT 2
  `;

  return { announcements, unpaidBills, recentMaintenance };
}

export default async function TenantDashboard() {
  const { announcements, unpaidBills, recentMaintenance } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Welcome / Unpaid Bills Alert */}
      {unpaidBills.length > 0 && (
        <div className="bg-[#FAF3E8] border border-[#E9C46A] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className="h-12 w-12 bg-[#E9C46A] text-white rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#8B6A2B] mb-1">มียอดค้างชำระ ({unpaidBills.length} รายการ)</h2>
              <p className="text-[#8B6A2B]/80 text-sm font-medium">คุณมียอดที่ต้องชำระจำนวน ฿{unpaidBills.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()} ภายในวันที่ {new Date(unpaidBills[0].due_date).toLocaleDateString('th-TH')}</p>
            </div>
          </div>
          <Link href="/tenant/billing" className="bg-[#8B6A2B] hover:bg-[#725724] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap">
            ชำระเงินตอนนี้
          </Link>
        </div>
      )}

      {/* Announcements */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#3E342B] flex items-center gap-2">
            <svg className="w-6 h-6 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            ประกาศจากโครงการ
          </h2>
        </div>
        
        <div className="grid gap-4">
          {announcements.length === 0 ? (
             <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 text-center text-[#8B7355]">ไม่มีประกาศใหม่</div>
          ) : announcements.map((ann) => (
            <div key={ann.id} className={`p-6 rounded-3xl border shadow-sm ${ann.is_important ? 'bg-[#FFF9F9] border-[#F2D7D7]' : 'bg-white border-[#E5DFD3]'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-lg font-bold ${ann.is_important ? 'text-[#A04545]' : 'text-[#3E342B]'}`}>
                  {ann.is_important && <span className="inline-block bg-[#A04545] text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full mr-2 mb-1 alignment-middle">สำคัญ</span>}
                  {ann.title}
                </h3>
                <span className="text-xs font-semibold text-[#A08D74]">{new Date(ann.created_at).toLocaleDateString('th-TH')}</span>
              </div>
              <p className="text-[#5A4D41] text-sm leading-relaxed">{ann.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Maintenance Status Quick View */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#3E342B] flex items-center gap-2">
            <svg className="w-6 h-6 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            สถานะการแจ้งซ่อมล่าสุด
          </h2>
          <Link href="/tenant/maintenance" className="text-sm font-bold text-[#8B7355] hover:text-[#5A4D41]">ดูทั้งหมด</Link>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {recentMaintenance.length === 0 ? (
            <div className="col-span-2 bg-white border border-[#E5DFD3] rounded-2xl p-6 text-center text-[#8B7355]">ไม่มีประวัติการแจ้งซ่อม</div>
          ) : recentMaintenance.map((maint) => (
             <div key={maint.id} className="bg-white rounded-3xl border border-[#E5DFD3] p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-[#3E342B] truncate mr-2">{maint.issue_type || maint.description.substring(0, 30)}</h4>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                    maint.status === 'Pending' ? 'bg-[#FAF3E8] text-[#D4A373] border-[#E9C46A]' :
                    maint.status === 'In Progress' ? 'bg-[#E3F2FD] text-[#2196F3] border-[#BBDEFB]' :
                    'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]'
                  }`}>
                    {maint.status === 'Pending' ? 'รอดำเนินการ' : maint.status === 'In Progress' ? 'กำลังซ่อมแซง' : 'เสร็จสิ้น'}
                  </span>
                </div>
                <p className="text-sm text-[#A08D74] mb-3 line-clamp-2">{maint.description}</p>
                <div className="text-xs text-[#C2B7A8] font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {new Date(maint.created_at).toLocaleDateString('th-TH')}
                </div>
             </div>
          ))}
        </div>
      </section>

    </div>
  );
}
