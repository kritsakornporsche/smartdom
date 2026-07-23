import { ReactNode } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-background text-[#2d2a26] dark:text-foreground selection:bg-primary/20 overflow-x-hidden">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      
      <footer className="py-20 bg-white dark:bg-card border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-4">The new standard of living</p>
            <div className="flex items-center gap-3 mb-8 opacity-90">
               <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md">
                 <img src="/up-logo.png" alt="ตรามหาวิทยาลัยพะเยา" className="w-full h-full object-contain" />
               </div>
               <span className="font-display font-black tracking-tighter uppercase italic">แพลตฟอร์มหอพักหน้ามหาวิทยาลัยพะเยา</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium text-center max-w-sm leading-relaxed">
                เปลี่ยนประสบการณ์การพักผ่อนให้เป็นเรื่องง่ายและมีความหมาย <br/>
                © 2026 แพลตฟอร์มหอพักหน้ามหาวิทยาลัยพะเยา • Phayao, Thailand
            </p>
        </div>
      </footer>
    </div>
  );
}
