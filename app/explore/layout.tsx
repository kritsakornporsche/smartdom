import { ReactNode } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2d2a26] selection:bg-primary/20">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      
      <footer className="py-20 bg-white border-t border-black/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-4">The new standard of living</p>
            <div className="flex items-center gap-2 mb-8 scale-75 opacity-50 gray-scale opacity-50">
               <div className="w-6 h-6 bg-primary rounded-md" />
               <span className="font-display font-black tracking-tighter uppercase italic">SmartDom</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium text-center max-w-sm leading-relaxed">
                เปลี่ยนประสบการณ์การพักผ่อนให้เป็นเรื่องง่ายและมีความหมาย <br/>
                © 2026 SmartDom Ecosystem • Bangkok, Thailand
            </p>
        </div>
      </footer>
    </div>
  );
}
