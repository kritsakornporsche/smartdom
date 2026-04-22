import Link from 'next/link';

export default function RulesPage() {
  return (
    <div className="p-8 lg:p-10 hidden-scrollbar">
      <div className="max-w-4xl mx-auto pb-16 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <Link href="/tenant" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#A08D74] hover:text-[#3E342B] transition-colors mb-4">
              <span className="w-6 h-px bg-[#A08D74]"></span> กลับหน้าหลัก
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-[#3E342B] tracking-tight">
              สมุดคู่มือผู้เช่า
            </h1>
            <p className="text-[#8B7355] font-medium mt-3">
              กฎระเบียบการอยู่อาศัย และข้อมูลติดต่อในกรณีฉุกเฉิน
            </p>
          </div>
        </div>

        {/* Emergency Contacts */}
        <section className="bg-destructive/5 border border-destructive/20 rounded-[2.5rem] p-8 md:p-10">
          <h2 className="text-2xl font-black text-destructive flex items-center gap-4 mb-6">
            🚨 เบอร์ติดต่อฉุกเฉิน
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
             {[
               { name: 'เจ้าหน้าที่ดูแล 24 ชม.', tel: '081-234-5678' },
               { name: 'ช่างซ่อมบำรุง', tel: '089-876-5432' },
               { name: 'สถานีตำรวจใกล้เคียง', tel: '191' },
               { name: 'ดับเพลิง', tel: '199' },
               { name: 'โรงพยาบาลศูนย์', tel: '1669' },
             ].map((contact, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-destructive/10 shadow-sm flex flex-col items-center text-center">
                  <span className="text-sm font-bold text-[#3E342B] mb-2">{contact.name}</span>
                  <a href={`tel:${contact.tel}`} className="text-xl font-black text-destructive hover:underline">{contact.tel}</a>
                </div>
             ))}
          </div>
        </section>

        {/* Dormitory Rules */}
        <section className="bg-white border border-[#E5DFD3] rounded-[3rem] p-10 md:p-14 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
           
           <h2 className="text-3xl font-black text-[#3E342B] flex items-center gap-4 mb-10 relative z-10">
             <div className="w-3 h-10 bg-primary rounded-full"></div> กฎระเบียบและข้อบังคับ
           </h2>

           <div className="space-y-8 relative z-10">
              <div className="flex gap-6">
                 <div className="w-12 h-12 bg-[#FAF8F5] rounded-xl flex items-center justify-center shrink-0 text-xl font-black text-[#A08D74]">1</div>
                 <div>
                    <h3 className="text-xl font-black text-[#3E342B] mb-2">ห้ามส่งเสียงดังหลังเวลา 22:00 น.</h3>
                    <p className="text-[#8B7355] leading-normal">เพื่อความสงบเรียบร้อยและไม่รบกวนผู้พักอาศัยห้องอื่น ขอความร่วมมือในการงดใช้เสียงดัง งดปาร์ตี้หรือเปิดเพลงเสียงดังในยามวิกาล</p>
                 </div>
              </div>

              <div className="flex gap-6">
                 <div className="w-12 h-12 bg-[#FAF8F5] rounded-xl flex items-center justify-center shrink-0 text-xl font-black text-[#A08D74]">2</div>
                 <div>
                    <h3 className="text-xl font-black text-[#3E342B] mb-2">ห้ามเลี้ยงสัตว์ทุกชนิด</h3>
                    <p className="text-[#8B7355] leading-normal">ไม่อนุญาตให้เลี้ยงสัตว์ทุกชนิดภายในห้องพักและบริเวณหอพัก เพื่อรักษาความสะอาดและป้องกันปัญหาด้านภูมิแพ้ของผู้พักอาศัยท่านอื่น หากฝ่าฝืนจะมีการปรับตามระเบียบ</p>
                 </div>
              </div>

              <div className="flex gap-6">
                 <div className="w-12 h-12 bg-[#FAF8F5] rounded-xl flex items-center justify-center shrink-0 text-xl font-black text-[#A08D74]">3</div>
                 <div>
                    <h3 className="text-xl font-black text-[#3E342B] mb-2">รักษาความสะอาดพื้นที่ส่วนรวม</h3>
                    <p className="text-[#8B7355] leading-normal">กรุณานำขยะมาทิ้งในจุดที่จัดเตรียมไว้ให้ งดวางถุงขยะหน้าห้องพัก และช่วยกันรักษาความสะอาดบริเวณทางเดินและห้องซักล้างส่วนกลาง</p>
                 </div>
              </div>

              <div className="flex gap-6">
                 <div className="w-12 h-12 bg-[#FAF8F5] rounded-xl flex items-center justify-center shrink-0 text-xl font-black text-[#A08D74]">4</div>
                 <div>
                    <h3 className="text-xl font-black text-[#3E342B] mb-2">การจอดรถและการใช้ยานพาหนะ</h3>
                    <p className="text-[#8B7355] leading-normal">จอดรถในช่องที่กำหนดไว้เท่านั้น ห้ามจอดขวางทางเข้า-ออก และต้องลงทะเบียนป้ายทะเบียนรถกับทางนิติบุคคลล่วงหน้าเสมอ (1 คันต่อ 1 ห้องพัก)</p>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
}
