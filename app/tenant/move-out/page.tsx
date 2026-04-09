import { neon } from '@neondatabase/serverless';

async function getMoveOutData() {
  const sql = neon(process.env.DATABASE_URL || '');
  const tenantId = 1;

  const requests = await sql`
    SELECT * FROM move_out_requests WHERE tenant_id = ${tenantId} ORDER BY created_at DESC LIMIT 1
  `;

  return requests.length > 0 ? requests[0] : null;
}

export default async function TenantMoveOut() {
  const request = await getMoveOutData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#3E342B] mb-2">แจ้งย้ายออก (Move Out Notice)</h1>
        <p className="text-[#8B7355]">ส่งเรื่องแจ้งย้ายออกล่วงหน้า เพื่อให้ผู้ดูแลรับทราบเตรียมการคืนเงินประกัน</p>
      </div>

      {request ? (
        <div className="bg-[#FAF8F5] border border-[#E5DFD3] rounded-3xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
               request.status === 'Pending' ? 'bg-[#E9C46A] text-white' :
               request.status === 'Approved' ? 'bg-[#4CAF50] text-white' :
               'bg-[#F44336] text-white'
            }`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#3E342B]">คุณได้ส่งเรื่องแจ้งย้ายออกแล้ว</h3>
              <p className="text-[#8B7355] mt-1">
                สถานะปัจจุบัน: 
                <span className={`ml-2 font-bold ${
                  request.status === 'Pending' ? 'text-[#D4A373]' :
                  request.status === 'Approved' ? 'text-[#4CAF50]' :
                  'text-[#F44336]'
                }`}>
                  {request.status === 'Pending' ? 'รอการตรวจสอบจากนิติบุคคล' : 
                   request.status === 'Approved' ? 'อนุมัติการย้ายออก' : 'ถูกปฎิเสธ (กรุณาติดต่อผู้ดูแล)'}
                </span>
              </p>
            </div>
          </div>
          
          <div className="bg-white border text-sm border-[#E5DFD3] p-6 rounded-2xl grid sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-[#A08D74] font-bold mb-1">วันที่ต้องการย้ายออก:</span>
              <span className="text-[#3E342B] font-medium">{new Date(request.desired_date).toLocaleDateString('th-TH')}</span>
            </div>
            <div>
              <span className="block text-[#A08D74] font-bold mb-1">วันที่บันทึกคำร้อง:</span>
              <span className="text-[#3E342B] font-medium">{new Date(request.created_at).toLocaleDateString('th-TH')}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-[#A08D74] font-bold mb-1">เหตุผลที่ย้ายออก:</span>
              <span className="text-[#3E342B] font-medium">{request.reason || '-'}</span>
            </div>
          </div>
        </div>
      ) : (
        <form className="bg-white rounded-3xl border border-[#E5DFD3] p-8 sm:p-10 shadow-sm">
          <div className="mb-8">
             <div className="bg-[#FFF9F9] border border-[#F2D7D7] rounded-xl p-4 text-sm text-[#A04545]">
               <strong className="block mb-1">เงื่อนไขการคืนเงินประกัน:</strong>
               คุณต้องแจ้งย้ายออกล่วงหน้าอย่างน้อย 30 วันก่อนถึงวันสิ้นสุดสัญญา หรือวันที่จะย้ายออก เพื่อไม่ให้ถูกริบเงินประกัน ตามเงื่อนไขในสัญญาเช่า
             </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[11px] font-bold text-[#A08D74] uppercase tracking-wider mb-2">วันที่ต้องการย้ายออกอออก</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DCD3C6] focus:bg-white focus:ring-2 focus:ring-[#8B6A2B]/20 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#A08D74] uppercase tracking-wider mb-2">เบอร์โทรศัพท์ติดต่อกลับ</label>
              <input 
                type="tel" 
                className="w-full px-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DCD3C6] focus:bg-white focus:ring-2 focus:ring-[#8B6A2B]/20 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-medium"
                placeholder="08X-XXX-XXXX"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-[11px] font-bold text-[#A08D74] uppercase tracking-wider mb-2">เหตุผลที่ย้ายออก (เพื่อนำไปปรับปรุงบริการ)</label>
            <textarea 
              rows={4}
              className="w-full px-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DCD3C6] focus:bg-white focus:ring-2 focus:ring-[#8B6A2B]/20 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-medium resize-none"
              placeholder="ระบุเหตุผล..."
            ></textarea>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-[#8B6A2B] hover:bg-[#725724] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98]">
              ส่งเรื่องแจ้งย้ายออก
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
