'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Sync theme on mount
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  return (
    <>
      <nav 
        className={cn(
          "fixed top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-50 mx-auto max-w-5xl h-18 px-6 lg:px-10 rounded-[2.5rem] flex items-center justify-between transition-all duration-700",
          scrolled 
            ? "bg-card/70 backdrop-blur-2xl shadow-xl border border-border/50 py-3" 
            : "bg-card/40 backdrop-blur-xl border border-border/25 py-4"
        )}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 lg:gap-4 group cursor-pointer">
          <div className="h-9 w-9 lg:h-10 lg:w-10 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display font-bold text-base shadow-lg transition-all duration-500 group-hover:bg-foreground group-hover:scale-110 group-hover:rotate-12">
            S
          </div>
          <span className="text-sm lg:text-base font-display font-black tracking-tight uppercase group-hover:text-primary transition-colors">SmartDom</span>
        </Link>
        
        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all hover:translate-y-[-1px]">
              สำรวจหอพัก
            </Link>
            <div className="h-4 w-px bg-border/40" />
          </div>
          
          {status === 'loading' ? (
            <div className="w-20 h-4 bg-muted/40 animate-pulse rounded-full" />
          ) : session ? (
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="hidden sm:flex flex-col items-end">
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
              <div className="hidden sm:block h-8 w-px bg-border/40" />
              
              {session && (
                <Link 
                  href={
                    (session.user as any)?.role === 'platform_admin' ? '/platform' :
                    (session.user as any)?.role === 'owner' ? '/owner' :
                    (session.user as any)?.role === 'keeper' ? '/keeper' :
                    '/tenant'
                  }
                  className={cn(
                    "rounded-xl bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-primary",
                    "hover:bg-primary hover:text-primary-foreground transition-all duration-300",
                    "shadow-sm hover:shadow-md hover:scale-[1.05] active:scale-95 flex items-center gap-2"
                  )}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                   <span className="hidden xs:inline">ไปที่แดชบอร์ด</span>
                </Link>
              )}

              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-all hover:translate-y-[-1px] cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 lg:gap-4">
              <Link 
                href="/signin" 
                className={cn(
                  "px-5 py-2.5 rounded-full border border-border text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                  "hover:bg-secondary hover:border-primary/20 hover:text-primary hover:-translate-y-0.5 active:scale-95"
                )}
              >
                เข้าสู่ระบบ
              </Link>
              <Link 
                href="/signup" 
                className={cn(
                  "rounded-full bg-foreground px-6 sm:px-8 py-2.5 sm:py-3 text-[10px] font-black uppercase tracking-[0.2em] text-background",
                  "hover:bg-primary hover:text-primary-foreground transition-all duration-500",
                  "shadow-xl shadow-foreground/5 hover:shadow-primary/20 hover:scale-[1.05] active:scale-95"
                )}
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-border/40" />

          {/* Theme Toggler Button */}
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl flex items-center justify-center bg-secondary/50 text-foreground hover:bg-secondary transition-all active:scale-95 cursor-pointer text-sm shadow-sm"
            title={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="h-10 w-10 rounded-2xl flex items-center justify-center bg-secondary/50 text-foreground hover:bg-secondary transition-all active:scale-95 cursor-pointer text-sm shadow-sm"
            title={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="h-10 w-10 flex flex-col items-center justify-center gap-1.5 bg-secondary/50 rounded-2xl hover:bg-secondary transition-all active:scale-95 cursor-pointer"
          >
           <div className="w-5 h-0.5 bg-foreground/70 rounded-full pointer-events-none" />
           <div className="w-4 h-0.5 bg-foreground/70 rounded-full self-start ml-[7px] pointer-events-none" />
           <div className="w-5 h-0.5 bg-foreground/70 rounded-full pointer-events-none" />
          </button>
        </div>
      </nav>

    {/* Mobile Navigation Drawer */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-[60] flex pointer-events-auto">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div className="relative w-full max-w-sm ml-auto h-full bg-card shadow-2xl border-l border-border flex flex-col p-6 animate-in slide-in-from-right-full duration-300">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <div className="h-9 w-9 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display font-bold text-sm shadow-lg">
                S
              </div>
              <span className="text-base font-display font-black tracking-tight uppercase">SmartDom</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="h-10 w-10 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-[0.2em] text-foreground hover:text-primary transition-all">
              สำรวจหอพัก
            </Link>
            
            <div className="h-px w-full bg-border/40" />

            {status === 'loading' ? (
              <div className="w-20 h-4 bg-muted/40 animate-pulse rounded-full" />
            ) : session ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground mb-1">
                    {session.user?.name || session.user?.email || 'ไม่มีชื่อผู้ใช้'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary/70">
                        {(session.user as any)?.role || 'User'}
                    </span>
                  </div>
                </div>
                
                <Link 
                  href={
                    (session.user as any)?.role === 'platform_admin' ? '/platform' :
                    (session.user as any)?.role === 'owner' ? '/owner' :
                    (session.user as any)?.role === 'keeper' ? '/keeper' :
                    '/tenant'
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-primary/10 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm flex items-center justify-center gap-2 w-full mt-4"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>ไปที่แดชบอร์ด</span>
                </Link>

                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="mt-4 text-xs font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 py-3 rounded-xl transition-all"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                <Link 
                  href="/signin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-4 rounded-xl border border-border text-xs font-black uppercase tracking-widest hover:bg-secondary transition-all"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-4 rounded-xl bg-foreground text-xs font-black uppercase tracking-[0.2em] text-background hover:bg-primary transition-all shadow-xl"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
