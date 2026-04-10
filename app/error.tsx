'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('[Root Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-center">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-[#8B7355]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-[#A08D74]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg animate-reveal">
        <div className="mb-10 inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#8B7355]/10 text-[#8B7355] shadow-inner">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>

        <h1 className="text-5xl font-display font-black tracking-tight text-[#3E342B] mb-6 italic">
          ขออภัย มีบางอย่างผิดพลาด
        </h1>
        
        <p className="text-lg text-[#A08D74] font-medium leading-relaxed mb-12 max-w-md mx-auto">
          ระบบพบข้อผิดพลาดที่ไม่คาดคิด ทีมงานของเรากำลังตรวจสอบเพื่อแก้ไขให้เร็วที่สุด
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="rounded-full bg-[#8B7355] px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-[#8B7355]/20 hover:-translate-y-1 transition-all active:scale-95"
          >
            ลองใหม่อีกครั้ง
          </button>
          <Link
            href="/"
            className="rounded-full border border-[#E5DFD3] bg-white/50 backdrop-blur-sm px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A08D74] hover:bg-white transition-all active:scale-95"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>

        {error.digest && (
          <p className="mt-12 text-[9px] font-black uppercase tracking-widest text-[#A08D74]/40">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
