'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  // Debug session in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Navbar] session:', session, 'status:', status);
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/40">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group cursor-pointer">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display font-bold shadow-soft transition-transform group-hover:scale-105">
              S
            </div>
            <span className="text-lg font-display font-bold tracking-tight uppercase">SmartDom</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-12">
            <Link href="/#features" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">คุณสมบัติ</Link>
            <Link href="/explore" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">สำรวจหอพัก</Link>
            <div className="h-4 w-px bg-border/60" />
            
            {status === 'loading' ? (
              <div className="w-20 h-4 bg-muted animate-pulse rounded" />
            ) : session ? (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-foreground">
                    {session.user?.name || session.user?.email || 'ไม่มีชื่อผู้ใช้'}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-70">
                    {(session.user as any)?.role || 'Guest'}
                  </span>
                </div>
                <div className="h-8 w-px bg-border/60" />
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <>
                <Link href="/signin" className="text-sm font-semibold hover:text-primary transition-colors text-foreground">เข้าสู่ระบบ</Link>
                <Link href="/signup" className="rounded-full bg-foreground px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-background hover:bg-primary hover:text-primary-foreground transition-all shadow-xl">
                  เริ่มต้นเลย
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
