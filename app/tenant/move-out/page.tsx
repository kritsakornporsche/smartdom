import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

async function getMoveOutData() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const sql = neon(process.env.DATABASE_URL || '');
  
  // Find tenant by email
  const tenantRes = await sql`SELECT id FROM tenants WHERE email = ${session.user.email} LIMIT 1`;
  if (tenantRes.length === 0) return null;
  const tenantId = tenantRes[0].id;

  const requests = await sql`
    SELECT * FROM move_out_requests WHERE tenant_id = ${tenantId} ORDER BY created_at DESC LIMIT 1
  `;

  return requests.length > 0 ? requests[0] : null;
}

export default async function TenantMoveOut() {
  const request = await getMoveOutData();

  return (
    <div className="p-10 md:p-16 max-w-7xl mx-auto">
      <div className="space-y-12 pb-16">
        <div className="relative">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#8B6A2B] rounded-full opacity-20"></div>
          <h1 className="text-3xl font-bold text-[#3E342B] tracking-tight flex items-center gap-3">
             <span className="p-2 bg-[#FAF8F5] rounded-xl border border-[#E5DFD3] text-[#8B7355]">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </span>
             แจ้งย้ายออก (Move Out)
          </h1>
          <p className="text-[#8B7355] mt-2 font-medium flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#DCD3C6]"></span>
            ส่งเรื่องแจ้งย้ายออกล่วงหน้า เพื่อให้ผู้ดูแลเตรียมการคืนเงินประกัน
          </p>
        </div>

        {request ? (
          <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-sm overflow-hidden">
            <div className={`p-4 border-b text-center font-bold tracking-widest uppercase text-[10px] ${
              request.status === 'Pending' ? 'bg-[#FAF8F5] text-[#8B6A2B] border-[#E5DFD3]' : 
              request.status === 'Approved' ? 'bg-[#F0F4F0] text-[#4CAF50] border-[#E0E0E0]' :
              'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
               สถานะคำร้อง: {request.status === 'Pending' ? 'อยู่ระหว่างการตรวจสอบ' : request.status}
            </div>

            <div className="p-8 md:p-12">
              <div className="grid sm:grid-cols-2 gap-8 mb-12">
                <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#F2EFE9]">
                  <p className="text-[11px] text-[#A08D74] font-bold uppercase tracking-widest mb-1 font-mono text-center">วันที่ต้องการย้ายออก</p>
                  <div className="text-2xl font-serif text-[#3E342B] text-center mt-2">
                    {new Date(request.desired_date).toLocaleDateString('th-TH', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#F2EFE9]">
                  <p className="text-[11px] text-[#A08D74] font-bold uppercase tracking-widest mb-1 font-mono text-center">วันที่ส่งคำร้อง</p>
                  <div className="text-2xl font-serif text-[#3E342B] text-center mt-2">
                    {new Date(request.created_at).toLocaleDateString('th-TH', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <p className="text-[11px] text-[#A08D74] font-bold uppercase tracking-widest mb-4 font-mono">เหตุผลการย้ายออก</p>
                <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-6 text-[#5A4D41] italic">
                  "{request.reason || 'ไม่ได้ระบุเหตุผล'}"
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 border-t border-[#E5DFD3] pt-8">
                <button className="flex-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                  ยกเลิกคำร้อง (Cancel Request)
                </button>
                <button className="flex-1 bg-[#F2EFE9] text-[#5A4D41] font-bold py-3.5 px-4 rounded-xl cursor-default opacity-50">
                  รอการติดต่อกลับจากผู้ดูแล
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form className="bg-white rounded-3xl border border-[#E5DFD3] p-8 md:p-12 shadow-sm">
            <div className="mb-10">
               <div className="bg-[#FFF9F9] border border-rose-100 rounded-2xl p-6 text-sm text-rose-800 flex gap-4">
                 <div className="shrink-0 bg-rose-100 h-10 w-10 rounded-full flex items-center justify-center text-rose-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <div>
                   <strong className="block text-base mb-1 font-bold">เงื่อนไขการคืนเงินประกัน</strong>
                   ทางหอพักกำหนดให้มีการแจ้งย้ายออกล่วงหน้าอย่างน้อย <span className="font-bold underline decoration-rose-200 decoration-2">30 วัน</span> ก่อนถึงกำหนดสัญญา มิเช่นนั้นอาจมีการหักเงินประกันตามที่ระบุไว้ในสัญญาเช่า
                 </div>
               </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-[11px] font-bold text-[#A08D74] uppercase tracking-wider mb-2 font-mono ml-1">วันที่ต้องการย้ายออก</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-4 bg-[#FAF8F5] rounded-2xl border border-[#DCD3C6] focus:bg-white focus:ring-4 focus:ring-[#8B6A2B]/10 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#A08D74] uppercase tracking-wider mb-2 font-mono ml-1">เบอร์โทรศัพท์ติดต่อกลับ</label>
                <input 
                  type="tel" 
                  className="w-full px-5 py-4 bg-[#FAF8F5] rounded-2xl border border-[#DCD3C6] focus:bg-white focus:ring-4 focus:ring-[#8B6A2B]/10 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-bold"
                  placeholder="08X-XXX-XXXX"
                />
              </div>
            </div>

            <div className="mb-10">
              <label className="block text-[11px] font-bold text-[#A08D74] uppercase tracking-wider mb-2 font-mono ml-1">เหตุผลที่ต้องการย้ายออก</label>
              <textarea 
                rows={4}
                className="w-full px-5 py-4 bg-[#FAF8F5] rounded-2xl border border-[#DCD3C6] focus:bg-white focus:ring-4 focus:ring-[#8B6A2B]/10 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-medium resize-none leading-relaxed"
                placeholder="ระบุเหตุผลเบื้องต้นเพื่อให้เรานำไปพัฒนาบริการ..."
              ></textarea>
            </div>

            <div className="flex gap-4 border-t border-[#E5DFD3] pt-10">
              <button type="submit" className="flex-1 bg-[#8B6A2B] hover:bg-[#725724] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-[#8B6A2B]/20 active:scale-[0.98] text-lg">
                ยืนยันการส่งเรื่องแจ้งย้ายออก
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
