'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 w-full z-50 px-6 py-8 pointer-events-none">
      <nav 
        className={cn(
          "mx-auto max-w-5xl w-full h-18 px-6 lg:px-10 rounded-[2.5rem] flex items-center justify-between pointer-events-auto transition-all duration-700",
          scrolled 
            ? "bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-white/50 py-3" 
            : "bg-white/40 backdrop-blur-xl border border-white/20 py-4"
        )}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 lg:gap-4 group cursor-pointer">
          <div className="h-9 w-9 lg:h-10 lg:w-10 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display font-bold text-base shadow-lg transition-all duration-500 group-hover:bg-foreground group-hover:scale-110 group-hover:rotate-12">
            S
          </div>
          <span className="text-sm lg:text-base font-display font-black tracking-tight uppercase group-hover:text-primary transition-colors">SmartDom</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          <Link href="/explore" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all hover:translate-y-[-1px]">
            สำรวจหอพัก
          </Link>
          <div className="h-4 w-px bg-border/40" />
          
          {status === 'loading' ? (
            <div className="w-20 h-4 bg-muted/40 animate-pulse rounded-full" />
          ) : session ? (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-foreground leading-none mb-1">
                  {session.user?.name || session.user?.email || 'ไม่มีชื่อผู้ใช้'}
                </span>
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-[0.1em] text-primary/70">
                      {(session.user as any)?.role || 'User'}
                   </span>
                </div>
              </div>
              <div className="h-8 w-px bg-border/40" />
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-all hover:translate-y-[-1px]"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6 lg:gap-8">
              <Link href="/signin" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all text-foreground hover:translate-y-[-1px]">
                เข้าสู่ระบบ
              </Link>
              <Link 
                href="/signup" 
                className={cn(
                  "rounded-full bg-foreground px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-background",
                  "hover:bg-primary hover:text-primary-foreground transition-all duration-500",
                  "shadow-xl shadow-foreground/5 hover:shadow-primary/20 hover:scale-[1.05] active:scale-95"
                )}
              >
                เริ่มต้นเลย
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger (Visual Only for now) */}
        <button className="md:hidden h-10 w-10 flex flex-col items-center justify-center gap-1.5 bg-secondary/50 rounded-2xl hover:bg-secondary transition-all active:scale-95">
           <div className="w-5 h-0.5 bg-foreground/70 rounded-full" />
           <div className="w-4 h-0.5 bg-foreground/70 rounded-full self-start ml-[7px]" />
           <div className="w-5 h-0.5 bg-foreground/70 rounded-full" />
        </button>
      </nav>
    </div>
  );
}
