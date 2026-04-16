'use client';

const rules = [
  { title: 'การเข้า-ออก', content: 'ประตูทางเข้าหลักปิดเวลา 23:00 น. หลังจากนั้นต้องใช้คีย์การ์ดเท่านั้น' },
  { title: 'ความสะอาด', content: 'ห้ามนำสัตว์เลี้ยงเข้ามาเลี้ยงในห้องพัก และห้ามทิ้งขยะบริเวณระเบียง' },
  { title: 'ความปลอดภัย', content: 'ห้ามสูบบุหรี่ภายในห้องพักและพื้นที่ส่วนกลาง ยกเว้นบริเวณที่จัดไว้ให้' },
  { title: 'ผู้มาติดต่อ', content: 'ไม่อนุญาตให้บุคคลภายนอกพักค้างคืนโดยไม่ได้แจ้งเจ้าหน้าที่ล่วงหน้า' },
];

export default function DormRulesCard() {
  return (
    <div className="bg-[#FAF8F5] rounded-[2.5rem] p-10 border border-[#E5DFD3] shadow-inner">
      <h3 className="text-xl font-black text-[#3E342B] mb-8 flex items-center gap-3">
        <span className="w-8 h-8 rounded-xl bg-[#8B7355] text-white flex items-center justify-center text-sm">⚖️</span>
        ระเบียบและข้อควรปฏิบัติ
      </h3>
      <div className="space-y-6">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex gap-4 group">
            <div className="text-[#A08D74] font-black text-xs pt-1 group-hover:text-[#8B7355] transition-colors">{idx + 1}.</div>
            <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#3E342B] group-hover:text-[#8B7355] transition-colors">{rule.title}</h4>
                <p className="text-xs text-[#8B7355] leading-relaxed font-medium">{rule.content}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-10 py-3.5 border border-[#8B7355]/20 text-[#8B7355] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#8B7355] hover:text-white transition-all">
        ดูระเบียบฉบับเต็ม
      </button>
    </div>
  );
}
