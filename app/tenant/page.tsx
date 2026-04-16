import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import AnnouncementsSection from '../components/AnnouncementsSection';

async function getDashboardData() {
  const sql = neon(process.env.DATABASE_URL || '');
  
  // Hardcoded tenant ID = 1 for demo purposes
  const tenantId = 1;

  const unpaidBills = await sql`
    SELECT * FROM bills WHERE tenant_id = ${tenantId} AND status = 'Unpaid' ORDER BY due_date ASC
  `;

  const recentMaintenance = await sql`
    SELECT * FROM maintenance_requests WHERE tenant_id = ${tenantId} ORDER BY created_at DESC LIMIT 2
  `;

  return { unpaidBills, recentMaintenance };
}

export default async function TenantDashboard() {
  const { unpaidBills, recentMaintenance } = await getDashboardData();

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Maintenance Status Quick View */}
            <section>
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#3E342B] flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    สถานะการแจ้งซ่อมล่าสุด
                </h2>
                <Link href="/tenant/maintenance" className="text-sm font-bold text-[#8B7355] hover:text-[#5A4D41]">ดูทั้งหมด</Link>
                </div>
                
                <div className="grid gap-4">
                {recentMaintenance.length === 0 ? (
                    <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 text-center text-[#8B7355]">ไม่มีประวัติการแจ้งซ่อม</div>
                ) : recentMaintenance.map((maint) => (
                    <div key={maint.id} className="bg-white rounded-3xl border border-[#E5DFD3] p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-[#3E342B] truncate mr-2">{maint.issue_type || maint.description.substring(0, 30)}</h4>
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                            maint.status === 'Pending' ? 'bg-[#FAF3E8] text-[#D4A373] border-[#E9C46A]' :
                            maint.status === 'In Progress' ? 'bg-[#E3F2FD] text-[#2196F3] border-[#BBDEFB]' :
                            'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]'
                        }`}>
                            {maint.status === 'Pending' ? 'รอดำเนินการ' : maint.status === 'In Progress' ? 'กำลังซ่อมแซม' : 'เสร็จสิ้น'}
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

        <div>
            {/* Announcements Sidebar */}
            <AnnouncementsSection />
        </div>
      </div>
    </div>
  );
}
