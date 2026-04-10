import { neon } from '@neondatabase/serverless';

async function getBillsData() {
  const sql = neon(process.env.DATABASE_URL || '');
  const tenantId = 1;

  const bills = await sql`
    SELECT * FROM bills WHERE tenant_id = ${tenantId} ORDER BY due_date DESC
  `;

  return bills;
}

export default async function TenantBilling() {
  const bills = await getBillsData();

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto pb-12 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#3E342B] mb-2">ชำระค่าหอพัก (Billing)</h1>
          <p className="text-[#8B7355]">จัดการบิลค่าใช้จ่ายและประวัติการชำระเงินของคุณ</p>
        </div>

        <div className="grid gap-6">
          {bills.length === 0 ? (
            <div className="bg-white border border-[#E5DFD3] rounded-3xl p-12 text-center">
              <h3 className="text-xl font-bold text-[#3E342B] mb-2">ไม่มีข้อมูลบิล</h3>
              <p className="text-[#8B7355]">คุณยังไม่มียอดเรียกเก็บในขณะนี้</p>
            </div>
          ) : bills.map((bill) => (
            <div key={bill.id} className="bg-white rounded-3xl border border-[#E5DFD3] shadow-sm overflow-hidden flex flex-col md:flex-row">
               <div className="p-6 md:p-8 flex-1">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <span className="text-sm font-bold text-[#A08D74] uppercase tracking-wider mb-1 block">{bill.billing_cycle}</span>
                     <h3 className="text-xl font-bold text-[#3E342B]">{bill.title}</h3>
                   </div>
                   <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl border ${
                      bill.status === 'Unpaid' ? 'bg-[#FAF3E8] text-[#D4A373] border-[#E9C46A]' :
                      bill.status === 'Pending' ? 'bg-[#E3F2FD] text-[#2196F3] border-[#BBDEFB]' :
                      'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]'
                    }`}>
                      {bill.status === 'Unpaid' ? 'ยังไม่ชำระ' : bill.status === 'Pending' ? 'รอดำเนินการตรวจ' : 'ชำระแล้ว'}
                   </span>
                 </div>
                 
                 <div className="border-t border-dashed border-[#E5DFD3] pt-4 mt-2 grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-[11px] text-[#A08D74] font-bold uppercase tracking-widest mb-1">ยอดรวมที่ต้องชำระ</p>
                     <p className="text-3xl font-bold text-[#3E342B]">฿{Number(bill.amount).toLocaleString()}</p>
                   </div>
                   <div>
                     <p className="text-[11px] text-[#A08D74] font-bold uppercase tracking-widest mb-1">ครบกำหนดชำระ</p>
                     <p className="text-lg font-bold text-[#8B7355]">{new Date(bill.due_date).toLocaleDateString('th-TH')}</p>
                   </div>
                 </div>
               </div>
               
               {/* Action Sidebar */}
               <div className="bg-[#FAF8F5] border-t md:border-t-0 md:border-l border-[#E5DFD3] p-6 flex flex-col justify-center gap-3 md:w-64">
                  {bill.status === 'Unpaid' ? (
                    <>
                      <button className="w-full bg-[#8B6A2B] hover:bg-[#725724] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]">
                        ชำระเงิน (QR Code)
                      </button>
                      <button className="w-full bg-white hover:bg-[#F2EFE9] text-[#8B6A2B] border border-[#DCD3C6] font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98]">
                        แนบสลิปโอนเงิน
                      </button>
                    </>
                  ) : (
                    <button disabled className="w-full bg-[#E5DFD3] text-[#A08D74] font-bold py-3.5 px-4 rounded-xl cursor-not-allowed">
                      {bill.status === 'Pending' ? 'กำลังตรวจสอบ...' : 'ดาวน์โหลดใบเสร็จ'}
                    </button>
                  )}
                  
                  <button className="text-xs font-bold text-[#A04545] hover:underline mt-2 text-center">
                    ยอดเงินไม่ถูกต้อง? แจ้งปัญหา
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
