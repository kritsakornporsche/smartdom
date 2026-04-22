import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';
import Link from 'next/link';
import ContractPDFButton from '@/components/ContractPDFButton';

async function getContractData(selectedId?: string) {
  const session = await auth();
  if (!session?.user?.email) return { current: null, all: [] };

  const sql = neon(process.env.DATABASE_URL || '');
  
  // Find tenant by email
  const tenantRes = await sql`SELECT id FROM tenants WHERE email = ${session.user.email}`;
  if (tenantRes.length === 0) return { current: null, all: [] };
  const tenantId = tenantRes[0].id;

  const allContracts = await sql`
    SELECT * FROM contracts WHERE tenant_id = ${tenantId} ORDER BY id DESC
  `;

  let currentContract = allContracts.length > 0 ? allContracts[0] : null;

  if (selectedId) {
    const found = allContracts.find(c => c.id.toString() === selectedId);
    if (found) currentContract = found;
  }

  return { current: currentContract, all: allContracts };
}

export default async function TenantContract({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  const { current: contract, all: contracts } = await getContractData(params.id);

  return (
    <div className="p-8 lg:p-10 max-w-6xl mx-auto">
      <div className="space-y-12 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="relative">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#8B6A2B] rounded-full opacity-20"></div>
          <h1 className="text-3xl font-bold text-[#3E342B] tracking-tight flex items-center gap-3">
             <span className="p-2 bg-[#FAF8F5] rounded-xl border border-[#E5DFD3] text-[#8B7355]">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </span>
             สัญญาเช่า (Contract)
          </h1>
          <p className="text-[#8B7355] mt-2 font-medium flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#DCD3C6]"></span>
            รายละเอียดสัญญาเช่าปัจจุบันและการบันทึกข้อตกลง
          </p>
        </div>
      </div>

      {!contract ? (
         <div className="bg-white border border-[#E5DFD3] rounded-3xl p-12 text-center shadow-sm">
            <h3 className="text-xl font-bold text-[#3E342B] mb-2">ไม่พบข้อมูลสัญญาเช่า</h3>
            <p className="text-[#8B7355]">ยังไม่มีการบันทึกสัญญาเช่าของคุณในระบบ กรุณาติดต่อผู้ดูแล</p>
         </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Contract Viewer */}
          <div className="flex-1">
            <div id="contract-document" className="bg-white rounded-3xl border border-[#E5DFD3] shadow-sm overflow-hidden flex flex-col h-full">
              {/* Status Header */}
              <div className={`p-4 border-b text-center font-bold tracking-wider uppercase text-sm ${
                contract.status === 'Active' ? 'bg-[#FAF8F5] text-[#8B6A2B] border-[#E5DFD3]' : 
                contract.status === 'Expired' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-[#F0F4F0] text-[#4CAF50] border-[#E0E0E0]'
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
                    <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-1 text-right">รหัสสัญญา</p>
                    <p className="text-lg font-mono text-[#3E342B]">SD-2026-{contract.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-12">
                  <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#F2EFE9]">
                    <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-1 font-mono">ระยะเวลาเช่า</p>
                    <div className="text-[#3E342B] font-medium flex items-center justify-between">
                      <span className="text-sm">{new Date(contract.start_date).toLocaleDateString('th-TH')}</span>
                      <svg className="w-4 h-4 text-[#C2B7A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      <span className="text-sm">{new Date(contract.end_date).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                  <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#F2EFE9]">
                    <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-1 font-mono">เงินประกัน (Deposit)</p>
                    <div className="text-[#8B6A2B] text-xl font-bold">
                      ฿{Number(contract.deposit_amount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Agreement Details */}
                <div className="mb-12">
                  <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-4 font-mono">ข้อกำหนดและข้อตกลง (Terms & Conditions)</p>
                  <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-6 text-sm text-[#5A4D41] space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                    <p><strong>ข้อ 1. วัตถุประสงค์การเช่า:</strong> ผู้เช่าตกลงเช่าห้องพักเพื่อการอยู่อาศัยเท่านั้น และจะไม่นำห้องพักไปใช้ในการประกอบกิจการพาณิชย์ หรือสิ่งผิดกฎหมายใดๆ</p>
                    <p><strong>ข้อ 2. ค่าเช่าและค่าบริการ:</strong> ผู้เช่าตกลงชำระค่าเช่าทุกเดือน ภายในวันที่ 5 ของเดือน หากชำระล่าช้า ผู้เช่าตกลงชำระค่าปรับตามที่ทางโครงการกำหนด</p>
                    <p><strong>ข้อ 3. การรักษาความสะอาด:</strong> ผู้เช่าต้องรักษาความสะอาดภายในห้องพักและพื้นที่ส่วนกลาง และไม่ส่งเสียงดังรบกวนผู้อาศัยท่านอื่น</p>
                    <p><strong>ข้อ 4. เงินประกัน:</strong> เงินประกันการเช่าจะได้รับคืนเมื่อสิ้นสุดสัญญา ภายใน 30 วัน หลังจากหักค่าความเสียหาย (หากมี)</p>
                    <p><strong>ข้อ 5. การยกเลิกสัญญา:</strong> หากผู้เช่าต้องการย้ายออกก่อนครบกำหนดสัญญา ผู้เช่ายินยอมให้โครงการยึดเงินประกันเต็มจำนวน</p>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="mb-12 border-t border-dashed border-[#E5DFD3] pt-8">
                  <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-4 font-mono">ลายมือชื่ออิเล็กทรอนิกส์</p>
                  <div className="inline-block p-4 border border-[#E5DFD3] rounded-2xl bg-[#FAF8F5]">
                    {contract.signature_data ? (
                      <div 
                        style={{ 
                          backgroundImage: `url(${contract.signature_data})`, 
                          backgroundSize: 'contain', 
                          backgroundRepeat: 'no-repeat', 
                          backgroundPosition: 'center',
                          height: '96px', 
                          width: '192px' 
                        }} 
                        className="opacity-100"
                        title="Signature"
                      />
                    ) : (
                      <div className="h-24 w-48 flex items-center justify-center italic text-[#C2B7A8]">No Signature</div>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-[#A08D74]">
                    ลงชื่อเมื่อ: {new Date(contract.created_at).toLocaleString('th-TH')}
                  </div>
                </div>

                <div id="action-buttons" className="flex flex-col sm:flex-row gap-4 border-t border-[#E5DFD3] pt-8">
                  <ContractPDFButton 
                    contractId={contract.id.toString()} 
                    targetId="contract-document" 
                    signatureData={contract.signature_data}
                  />
                  {contract.status === 'Active' && (
                    <button className="flex-1 bg-[#8B6A2B] hover:bg-[#725724] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]">
                      แจ้งต่อสัญญา (Renew)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Contract History */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-[#F2EFE9]/50 border border-[#E5DFD3] rounded-3xl p-6">
              <h3 className="text-sm font-bold text-[#5A4D41] uppercase tracking-wider mb-6 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ประวัติสัญญา
              </h3>
              
              <div className="space-y-3">
                {contracts.map((c) => (
                  <Link 
                    key={c.id} 
                    href={`/tenant/contract?id=${c.id}`}
                    className={`block p-4 rounded-2xl border transition-all ${
                      contract.id === c.id 
                        ? 'bg-white border-[#8B6A2B] shadow-sm ring-1 ring-[#8B6A2B]/10' 
                        : 'bg-white/50 border-transparent hover:border-[#DCD3C6] hover:bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-mono font-bold text-[#A08D74]">#{c.id.toString().padStart(4, '0')}</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        c.status === 'Active' ? 'bg-[#FAF8F5] text-[#8B6A2B]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#3E342B] truncate mb-1">
                      {new Date(c.start_date).getFullYear() + 543} - {new Date(c.end_date).getFullYear() + 543}
                    </div>
                    <div className="text-sm text-[#8B7355]">
                       ลงนาม: {new Date(c.created_at).toLocaleDateString('th-TH')}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
