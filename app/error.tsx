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
    console.error('[Root Error Boundary]', error);
  }, [error]);

  const isChunkError = /Loading chunk|ChunkLoadError|441/i.test(error?.message || '');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-[#A08D74]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg animate-reveal">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-foreground mb-4">
          {isChunkError ? 'มีการอัปเดตระบบเวอร์ชันใหม่' : 'ขออภัย มีบางอย่างผิดพลาด'}
        </h1>
        
        <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed mb-8 max-w-md mx-auto">
          {isChunkError 
            ? 'เซิร์ฟเวอร์ได้รับการอัปเดตเวอร์ชันใหม่เรียบร้อยแล้ว กรุณากดปุ่มด้านล่างเพื่อโหลดเวอร์ชันล่าสุด' 
            : 'ระบบพบข้อผิดพลาดที่ไม่คาดคิด ทีมงานของเรากำลังตรวจสอบเพื่อแก้ไขให้เร็วที่สุด'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer"
          >
            {isChunkError ? '🔄 โหลดเวอร์ชันล่าสุด' : 'ลองใหม่อีกครั้ง'}
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-white/20 transition-all active:scale-95"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>

      </div>
    </div>
  );
}
