import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';
import Link from 'next/link';
import AnnouncementsSection from '../components/AnnouncementsSection';
import MoveOutTestButton from './components/MoveOutTestButton';
import ResetAllTestButton from './components/ResetAllTestButton';
import DormRulesCard from './components/DormRulesCard';

async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.email) return { unpaidBills: [], recentMaintenance: [], roomInfo: null };

  const sql = neon(process.env.DATABASE_URL || '');
  
  // Find tenant and room info
  const roomRes = await sql`
    SELECT 
      t.id as tenant_id,
      r.room_number,
      r.room_type,
      r.floor,
      c.start_date,
      c.deposit_amount,
      d.name as dorm_name
    FROM tenants t
    JOIN rooms r ON t.room_id = r.id
    LEFT JOIN contracts c ON t.id = c.tenant_id
    LEFT JOIN dormitory_profile d ON r.dorm_id = d.id
    WHERE t.email = ${session.user.email}
    ORDER BY c.created_at DESC
    LIMIT 1
  `;

  if (roomRes.length === 0) {
    return { unpaidBills: [], recentMaintenance: [], roomInfo: null };
  }

  const tenantId = roomRes[0].tenant_id;

  const unpaidBills = await sql`
    SELECT * FROM bills WHERE tenant_id = ${tenantId} AND status = 'Unpaid' ORDER BY due_date ASC
  `;

  const recentMaintenance = await sql`
    SELECT * FROM maintenance_requests WHERE tenant_id = ${tenantId} ORDER BY created_at DESC LIMIT 3
  `;

  return { unpaidBills, recentMaintenance, roomInfo: roomRes[0] };
}

export default async function TenantDashboard() {
  const { unpaidBills, recentMaintenance, roomInfo } = await getDashboardData();

  return (
    <div className="p-10 md:p-16">
      <div className="max-w-7xl mx-auto pb-16 space-y-12">
        
        {/* Welcome Section with Room Summary */}
        <section className="relative overflow-hidden bg-white rounded-[3rem] border border-[#E5DFD3] p-12 shadow-2xl shadow-[#3E342B]/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                <div className="text-center lg:text-left">
                    <h1 className="text-4xl md:text-5xl font-black text-[#3E342B] tracking-tight mb-4">
                        ยินดีต้อนรับสู่บ้านใหม่
                    </h1>
                    <p className="text-lg text-[#8B7355] font-medium max-w-md">
                        {roomInfo?.dorm_name || 'SmartDom Dormitory'} พร้อมดูแลความสุขและการใช้ชีวิตของคุณในทุกวัน
                    </p>
                </div>
                
                {roomInfo && (
                    <div className="flex gap-4 md:gap-8 flex-wrap justify-center">
                        <div className="bg-[#FAF8F5] px-10 py-6 rounded-3xl border border-[#E5DFD3] text-center min-w-[160px] transform hover:scale-105 transition-transform">
                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A08D74] mb-2">Room</span>
                            <span className="text-3xl font-black text-[#3E342B]">{roomInfo.room_number}</span>
                        </div>
                        <div className="bg-[#FAF8F5] px-10 py-6 rounded-3xl border border-[#E5DFD3] text-center min-w-[160px] transform hover:scale-105 transition-transform">
                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A08D74] mb-2">Floor</span>
                            <span className="text-3xl font-black text-[#3E342B]">{roomInfo.floor}</span>
                        </div>
                        <div className="bg-[#FAF8F5] px-10 py-6 rounded-3xl border border-[#E5DFD3] text-center min-w-[160px] transform hover:scale-105 transition-transform">
                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A08D74] mb-2">Type</span>
                            <span className="text-xl font-black text-[#3E342B] truncate max-w-[120px]">{roomInfo.room_type}</span>
                        </div>
                    </div>
                )}
            </div>
        </section>

        {/* Unpaid Bills Alert - Full Width */}
        {unpaidBills.length > 0 && (
          <div className="bg-[#FAF3E8] border border-[#E9C46A] rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex gap-6 items-start">
              <div className="h-14 w-14 bg-[#E9C46A] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#E9C46A]/20">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h2 className="text-xl font-black text-[#8B6A2B] mb-1.5">คุณมียอดค้างชำระ ({unpaidBills.length} รายการ)</h2>
                <p className="text-[#8B6A2B]/80 font-medium max-w-xl">
                    กรุณาชำระยอดรวม ฿{unpaidBills.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()} 
                    ภายในวันที่ {new Date(unpaidBills[0].due_date).toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>
            <Link href="/tenant/billing" className="bg-[#8B6A2B] hover:bg-[#725724] text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-[#8B6A2B]/20 active:scale-95 whitespace-nowrap text-lg">
              ชำระเงินทันที
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Maintenance Status Quick View */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#3E342B] flex items-center gap-4">
                  <div className="w-3 h-8 bg-[#8B7355] rounded-full"></div>
                  สถานะการดูแลแจ้งซ่อม
                </h2>
                <Link href="/tenant/maintenance" className="text-sm font-black text-[#8B7355] hover:text-[#5A4D41] uppercase tracking-widest border-b-2 border-transparent hover:border-[#8B7355] transition-all pb-1">ดูประวัติทั้งหมด</Link>
              </div>
              
              <div className="grid gap-6">
                {recentMaintenance.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-[#E5DFD3] rounded-[2rem] p-12 text-center">
                      <div className="w-16 h-16 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#DCD3C6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <p className="text-[#A08D74] font-bold">ยังไม่มีรายการแจ้งซ่อมในขณะนี้</p>
                      <Link href="/tenant/maintenance" className="mt-4 inline-block text-primary font-bold text-sm">แจ้งซ่อมใหม่ →</Link>
                    </div>
                ) : recentMaintenance.map((maint) => (
                    <div key={maint.id} className="bg-white rounded-[2rem] border border-[#E5DFD3] p-8 shadow-sm hover:shadow-lg transition-all group">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                        <div className="flex gap-4 items-start">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                                maint.status === 'Pending' ? 'bg-[#FAF3E8]' :
                                maint.status === 'In Progress' ? 'bg-[#E3F2FD]' : 'bg-[#E8F5E9]'
                            }`}>
                                <svg className={`w-6 h-6 ${
                                    maint.status === 'Pending' ? 'text-[#D4A373]' :
                                    maint.status === 'In Progress' ? 'text-[#2196F3]' : 'text-[#4CAF50]'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-[#3E342B] text-lg">{maint.issue_type || 'รายการแจ้งซ่อม'}</h4>
                                <p className="text-xs text-[#A08D74] font-medium flex items-center gap-1.5 mt-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {new Date(maint.created_at).toLocaleDateString('th-TH')}
                                </p>
                            </div>
                        </div>
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border-2 ${
                            maint.status === 'Pending' ? 'bg-[#FAF3E8] text-[#D4A373] border-[#E9C46A]' :
                            maint.status === 'In Progress' ? 'bg-[#E3F2FD] text-[#2196F3] border-[#BBDEFB]' :
                            'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]'
                        }`}>
                            {maint.status === 'Pending' ? 'รอดำเนินการ' : maint.status === 'In Progress' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น'}
                        </span>
                      </div>
                      <p className="text-[#5A4D41] leading-relaxed italic border-l-4 border-[#F3EFE9] pl-6 mb-2">"{maint.description}"</p>
                    </div>
                ))}
              </div>
            </section>

            {/* Premium Tools Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#3E342B] flex items-center gap-4">
                  <div className="w-3 h-8 bg-primary rounded-full"></div>
                  เครื่องมือและทางลัด
                </h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Link href="/tenant/contract/simulate" className="group bg-white rounded-[2.5rem] border border-[#E5DFD3] p-10 shadow-sm hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-inner">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M11 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#3E342B] mb-2">จำลองสัญญาเช่า</h3>
                      <p className="text-sm text-[#8B7355] leading-relaxed font-medium">คำนวณเงินประกันและค่างวดล่วงหน้า เพื่อวางแผนการย้ายเข้าหรืออาศัยอยู่ต่ออย่างมั่นใจ</p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/tenant/maintenance" className="group bg-[#FAF8F5] rounded-[2.5rem] border border-[#E5DFD3] p-10 shadow-sm hover:border-accent/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="w-16 h-16 bg-accent/10 rounded-[1.25rem] flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-700">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#3E342B] mb-2">แจ้งปัญหาการใช้งาน</h3>
                      <p className="text-sm text-[#8B7355] leading-relaxed font-medium">พบกระเบื้องแตก น้ำรั่ว หรือไฟดับ? แจ้งเราได้ทันทีผ่านระบบออนไลน์ 24 ชม.</p>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-12 h-fit lg:sticky lg:top-36">
              {/* Announcements Component */}
              <AnnouncementsSection />

              {/* Dormitory Rules Card */}
              <DormRulesCard />

              {/* Developer Test Tools */}
              <div className="bg-[#FFF4E5]/50 rounded-[2.5rem] p-10 border border-[#FFD8A8]/50 shadow-inner text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD8A8] text-[#873800] text-[10px] font-black uppercase tracking-widest mb-6">
                    🧪 Dev Testing
                </div>
                <h3 className="text-xl font-black text-[#873800] mb-4">ทดสอบระบบย้ายออก</h3>
                <p className="text-[11px] font-bold text-[#873800]/60 uppercase tracking-widest mb-8 leading-relaxed">
                    คืนสถานะห้องพักและรีเซ็ตบทบาทกลับเป็น Guest เพื่อจองใหม่
                </p>
                <div className="flex flex-col gap-3">
                    <MoveOutTestButton />
                    <ResetAllTestButton />
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
