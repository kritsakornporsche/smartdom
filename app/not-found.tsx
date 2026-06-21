import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-[#A08D74]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg animate-reveal">
        <h1 className="text-[12rem] font-display font-black leading-none text-foreground/5 select-none ornament">
          404
        </h1>
        
        <div className="-mt-12 space-y-8">
           <h2 className="text-5xl font-display font-black tracking-tight text-foreground italic">
             ไม่พบหน้าที่คุณค้นหา
           </h2>
           
           <p className="text-lg text-[#A08D74] font-medium leading-relaxed max-w-sm mx-auto">
             หน้านี้อาจจะถูกลบไปแล้ว หรือคุณอาจจะเข้าถึงเส้นทางที่ไม่มีอยู่จริงในระบบ SmartDom
           </p>

           <div className="pt-6">
             <Link
               href="/"
               className="rounded-full bg-primary px-14 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 inline-block"
             >
               กลับสู่หน้าหลัก →
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
