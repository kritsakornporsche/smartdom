'use client';

import { useSession } from 'next-auth/react';
import KeeperSidebar from '../components/KeeperSidebar';
import { useState } from 'react';

const MOCK_INVENTORY = [
  { id: 1, name: 'หลอดไฟ LED 18W', category: 'อะไหล่ช่าง', stock: 15, unit: 'หลอด' },
  { id: 2, name: 'ก๊อกน้ำอ่างล้างหน้า', category: 'อะไหล่ช่าง', stock: 4, unit: 'ชิ้น' },
  { id: 3, name: 'น้ำยาล้างห้องน้ำ', category: 'อุปกรณ์ทำความสะอาด', stock: 8, unit: 'ขวด' },
  { id: 4, name: 'ถุงขยะดำ 30x40', category: 'อุปกรณ์ทำความสะอาด', stock: 20, unit: 'แพ็ค' },
];

export default function SuppliesPage() {
  const { data: session, status } = useSession();
  const subRole = (session?.user as any)?.sub_role;
  const [showRequestModal, setShowRequestModal] = useState(false);

  if (status === 'loading') return null;

  return (
    <div className="flex h-screen bg-[#FDFBF7]">
      <KeeperSidebar />
      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        <header className="h-20 bg-[#FAF8F5] border-b border-[#E5DFD3] flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[#3E342B]">เบิกวัสดุอุปกรณ์</h1>
            <p className="text-xs text-[#A08D74] font-medium mt-0.5">จัดการคลังอะไหล่และน้ำยาทำความสะอาด</p>
          </div>
          <button 
            onClick={() => setShowRequestModal(true)}
            className="px-6 py-2.5 bg-[#8B7355] text-white text-sm font-bold rounded-2xl shadow-lg shadow-[#8B7355]/20 hover:bg-[#5A4D41] transition-all"
          >
            + สร้างคำขอเบิกสิงของ
          </button>
        </header>

        <div className="p-8 lg:p-10 max-w-5xl mx-auto w-full space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {MOCK_INVENTORY.map(item => (
                     <div key={item.id} className="bg-white border border-[#E5DFD3] rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-4xl">
                             {(item.category === 'อะไหล่ช่าง') ? '🔧' : '🧽'}
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-[#A08D74] mb-1">{item.category}</p>
                         <h3 className="text-base font-bold text-[#3E342B] mb-4">{item.name}</h3>
                         <div className="flex items-end justify-between">
                             <div>
                                 <span className="text-3xl font-display font-black text-[#8B7355]">{item.stock}</span>
                                 <span className="text-xs font-bold text-[#A08D74] ml-1.5">{item.unit}</span>
                             </div>
                             {item.stock < 5 && (
                                 <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">ใกล้หมด</span>
                             )}
                         </div>
                     </div>
                 ))}
            </div>

            <section className="bg-white rounded-[2.5rem] border border-[#E5DFD3] p-8 shadow-sm">
                <h2 className="text-lg font-bold text-[#3E342B] mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#8B7355] rounded-full"></span>
                    ประวัติการเบิก (ล่าสุด)
                </h2>
                <div className="divide-y divide-[#E5DFD3] text-sm">
                    <div className="py-4 flex justify-between items-center text-[#A08D74] font-bold">
                        <span>รายการไม่มีข้อมูลประวัติการเบิกในขณะนี้</span>
                    </div>
                </div>
            </section>
        </div>

        {/* Modal */}
        {showRequestModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[#3E342B]/40 backdrop-blur-sm" onClick={() => setShowRequestModal(false)}></div>
                <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md relative z-10 p-8 animate-in fade-in zoom-in duration-200">
                    <h3 className="text-2xl font-display font-bold text-[#3E342B] mb-6">ขอเบิกวัสดุ/อุปกรณ์</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#A08D74] mb-2">เลือกรายการ</label>
                            <select className="w-full bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl px-4 py-3 text-sm focus:outline-none font-bold text-[#3E342B]">
                                {MOCK_INVENTORY.map(item => (
                                    <option key={item.id} value={item.id}>{item.name} (คงเหลือ: {item.stock})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#A08D74] mb-2">จำนวน</label>
                            <input type="number" min="1" defaultValue="1" className="w-full bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl px-4 py-3 text-sm focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#A08D74] mb-2">หมายเหตุการใช้งาน (อ้างอิงเลขห้อง/งาน)</label>
                            <input type="text" placeholder="เช่น ใช้ซ่อมก๊อกน้ำห้อง 204" className="w-full bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl px-4 py-3 text-sm focus:outline-none" />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setShowRequestModal(false)} className="flex-1 py-3 text-xs font-bold text-[#A08D74] border border-[#E5DFD3] rounded-2xl hover:bg-[#FAF8F5]">ยกเลิก</button>
                            <button onClick={() => setShowRequestModal(false)} className="flex-2 py-3 px-6 text-xs font-bold text-white bg-[#8B7355] rounded-2xl shadow-lg hover:bg-[#5A4D41]">ส่งคำขอเบิก</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
