import { neon } from '@neondatabase/serverless';

async function getMaintenanceData() {
  const sql = neon(process.env.DATABASE_URL || '');
  const tenantId = 1;

  const requests = await sql`
    SELECT * FROM maintenance_requests WHERE tenant_id = ${tenantId} ORDER BY created_at DESC
  `;

  return requests;
}

export default async function TenantMaintenance() {
  const requests = await getMaintenanceData();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#3E342B] mb-2">แจ้งซ่อม (Maintenance)</h1>
          <p className="text-[#8B7355]">แจ้งปัญหาและติดตามสถานะการซ่อมแซมห้องพักของคุณ</p>
        </div>
      </div>

      <div className="bg-[#FAF8F5] border-2 border-dashed border-[#DCD3C6] rounded-3xl p-8 text-center hover:bg-[#F2EFE9] transition-colors cursor-pointer group">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8 text-[#8B6A2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </div>
        <h3 className="text-lg font-bold text-[#3E342B] mb-1">แจ้งปัญหาใหม่</h3>
        <p className="text-[#8B7355] text-sm">คลิกเพื่อกรอกแบบฟอร์มแจ้งซ่อม แอร์, น้ำรั่ว, ระบบไฟฟ้า ฯลฯ</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#3E342B] mb-4">ประวัติการแจ้งซ่อม</h2>
        
        <div className="grid gap-4">
          {requests.length === 0 ? (
            <div className="bg-white border border-[#E5DFD3] rounded-3xl p-12 text-center text-[#8B7355]">
              ไม่มีประวัติแจ้งซ่อม
            </div>
          ) : requests.map((req) => (
            <div key={req.id} className="bg-white rounded-3xl border border-[#E5DFD3] shadow-sm overflow-hidden flex items-stretch">
               <div className={`w-3 shrink-0 ${
                  req.status === 'Pending' ? 'bg-[#E9C46A]' :
                  req.status === 'In Progress' ? 'bg-[#2196F3]' :
                  'bg-[#4CAF50]'
               }`}></div>
               <div className="p-6 flex-1 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                 <div>
                   <h3 className="text-lg font-bold text-[#3E342B] mb-1">{req.issue_type || 'ไม่ระบุประเภท'}</h3>
                   <p className="text-[#A08D74] text-sm mb-2">{req.description}</p>
                   <div className="text-[11px] text-[#C2B7A8] font-bold tracking-widest uppercase flex items-center gap-2">
                     <span>แจ้งเมื่อ: {new Date(req.created_at).toLocaleDateString('th-TH')}</span>
                     <span>•</span>
                     <span>รหัสอ้างอิง: #{req.id.toString().padStart(4, '0')}</span>
                   </div>
                 </div>
                 
                 <div className="shrink-0 text-right">
                    <span className={`inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl border ${
                      req.status === 'Pending' ? 'bg-[#FAF3E8] text-[#D4A373] border-[#E9C46A]' :
                      req.status === 'In Progress' ? 'bg-[#E3F2FD] text-[#2196F3] border-[#BBDEFB]' :
                      'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]'
                    }`}>
                      {req.status === 'Pending' ? 'รอดำเนินการ' : req.status === 'In Progress' ? 'กำลังซ่อมแซง' : 'เสร็จสิ้น'}
                    </span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
