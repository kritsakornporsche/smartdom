'use client';

import Link from 'next/link';

export default function Signup() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-8 py-24 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
      
      {/* Back Button */}
      <Link href="/" className="absolute top-12 left-12 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group">
        <span className="h-[1px] w-8 bg-border group-hover:bg-primary transition-colors" />
        กลับหน้าหลัก
      </Link>

      <div className="relative z-10 w-full max-w-md space-y-12">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-display font-bold text-primary-foreground text-xl shadow-2xl shadow-primary/20 transition-transform hover:scale-110">
            S
          </div>
          <h2 className="mt-10 text-4xl font-display tracking-tight text-foreground">
            ก้าวแรกสู่ความเรียบง่าย
          </h2>
          <p className="mt-4 text-muted-foreground font-medium">
            เข้าร่วมคอมมูนิตี้ SmartDom เพื่อชีวิตที่จัดการง่ายขึ้น
          </p>
        </div>
        
        <form className="space-y-8" action="#" method="POST">
          <div className="grid gap-6">
            <div className="space-y-2">
              <label htmlFor="full-name" className="text-xs font-bold uppercase tracking-widest text-primary">ชื่อ-นามสกุล</label>
              <input
                id="full-name"
                name="name"
                type="text"
                required
                className="w-full rounded-2xl border border-border/40 bg-background px-6 py-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
                placeholder="สมชาย ใจดี"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email-address" className="text-xs font-bold uppercase tracking-widest text-primary">อีเมล</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-border/40 bg-background px-6 py-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-primary">ฉันคือ...</label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  className="w-full rounded-2xl border border-border/40 bg-background px-6 py-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer transition-all shadow-sm"
                >
                  <option value="tenant">ผู้เช่า</option>
                  <option value="keeper">ผู้ดูแลหอพัก</option>
                  <option value="owner">เจ้าของ / แอดมิน</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center">
                  <div className="h-1.5 w-1.5 rotate-45 border-b-2 border-r-2 border-primary" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-primary py-5 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
          >
            สมัครสมาชิก
          </button>
        </form>

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/signin" className="text-primary font-bold hover:underline">
            เข้าสู่ระบบที่นี่
          </Link>
        </p>
      </div>
    </div>
  );
}
