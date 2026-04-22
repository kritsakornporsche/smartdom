import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-[#8B7355]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-[#A08D74]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg animate-reveal">
        <h1 className="text-[12rem] font-display font-black leading-none text-[#3E342B]/5 select-none ornament">
          404
        </h1>
        
        <div className="-mt-12 space-y-8">
           <h2 className="text-3xl font-display font-black tracking-tight text-[#3E342B] italic">
             ไม่พบหน้าที่คุณค้นหา
           </h2>
           
           <p className="text-lg text-[#A08D74] font-medium leading-normal max-w-sm mx-auto">
             หน้านี้อาจจะถูกลบไปแล้ว หรือคุณอาจจะเข้าถึงเส้นทางที่ไม่มีอยู่จริงในระบบ SmartDom
           </p>

           <div className="pt-6">
             <Link
               href="/"
               className="rounded-full bg-[#8B7355] px-14 py-6 text-sm font-black uppercase tracking-wide text-white shadow-2xl shadow-[#8B7355]/20 hover:-translate-y-1 transition-all active:scale-95 inline-block"
             >
               กลับสู่หน้าหลัก →
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
