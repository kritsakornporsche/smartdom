import { neon } from '@neondatabase/serverless';

async function getContractData() {
  const sql = neon(process.env.DATABASE_URL || '');
  const tenantId = 1;

  const contracts = await sql`
    SELECT * FROM contracts WHERE tenant_id = ${tenantId} ORDER BY start_date DESC LIMIT 1
  `;

  return contracts.length > 0 ? contracts[0] : null;
}

export default async function TenantContract() {
  const contract = await getContractData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#3E342B] mb-2">สัญญาเช่า (Contract)</h1>
        <p className="text-[#8B7355]">รายละเอียดสัญญาเช่าปัจจุบันและการบันทึกข้อตกลง</p>
      </div>

      {!contract ? (
         <div className="bg-white border border-[#E5DFD3] rounded-3xl p-12 text-center">
            <h3 className="text-xl font-bold text-[#3E342B] mb-2">ไม่พบข้อมูลสัญญาเช่า</h3>
            <p className="text-[#8B7355]">ยังไม่มีการบันทึกสัญญาเช่าของคุณในระบบ กรุณาติดต่อผู้ดูแล</p>
         </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E5DFD3] shadow-sm overflow-hidden">
          {/* Status Header */}
          <div className={`p-4 border-b text-center font-bold tracking-widest uppercase text-sm ${
            contract.status === 'Active' ? 'bg-[#FAF8F5] text-[#8B6A2B] border-[#E5DFD3]' : 
            contract.status === 'Expired' ? 'bg-rose-50 text-rose-700 border-rose-200' :
            'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]'
          }`}>
             สถานะสัญญา: {contract.status === 'Active' ? 'มีผลบังคับใช้ (Active)' : contract.status}
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              <div>
                <h2 className="text-3xl font-serif text-[#3E342B] mb-2">สัญญาเช่าที่พักอาศัย</h2>
                <p className="text-[#A08D74] font-medium">SmartDom Apartment</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#A08D74] font-bold uppercase tracking-widest mb-1">รหัสสัญญา</p>
                <p className="text-lg font-mono text-[#3E342B]">SD-2026-{contract.id.toString().padStart(4, '0')}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#F2EFE9]">
                <p className="text-[11px] text-[#A08D74] font-bold uppercase tracking-widest mb-1">รอบสัญญา</p>
                <div className="text-[#3E342B] font-medium flex items-center justify-between">
                  <span>{new Date(contract.start_date).toLocaleDateString('th-TH')}</span>
                  <svg className="w-4 h-4 text-[#C2B7A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  <span>{new Date(contract.end_date).toLocaleDateString('th-TH')}</span>
                </div>
              </div>
              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#F2EFE9]">
                <p className="text-[11px] text-[#A08D74] font-bold uppercase tracking-widest mb-1">เงินประกัน (Deposit)</p>
                <div className="text-[#8B6A2B] text-xl font-bold">
                  ฿{Number(contract.deposit_amount || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t border-[#E5DFD3] pt-8">
              <button className="flex-1 bg-white hover:bg-[#F2EFE9] text-[#5A4D41] border border-[#DCD3C6] font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                ดาวน์โหลดเอกสาร (PDF)
              </button>
              <button className="flex-1 bg-[#8B6A2B] hover:bg-[#725724] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]">
                แจ้งต่อสัญญา (Renew Contract)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
