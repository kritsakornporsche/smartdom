'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

// ── Social provider config ─────────────────────────────────────────────────────
const socialProviders = [
  {
    id: 'google',
    label: 'ดำเนินการต่อด้วย Google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    bg: 'bg-white hover:bg-gray-50 border border-border text-foreground',
  },
  {
    id: 'facebook',
    label: 'ดำเนินการต่อด้วย Facebook',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.024 10.125 11.927v-8.437h-3.05v-3.49h3.05v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.278h3.328l-.532 3.49h-2.796V24C19.612 23.097 24 18.1 24 12.073z"/>
      </svg>
    ),
    bg: 'bg-[#1877F2] hover:bg-[#166FE5] border border-[#1877F2] text-white',
  },
  {
    id: 'github',
    label: 'ดำเนินการต่อด้วย GitHub',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    bg: 'bg-[#24292E] hover:bg-[#1a1f23] border border-[#24292E] text-white',
  },
  {
    id: 'line',
    label: 'ดำเนินการต่อด้วย LINE',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61V9.86h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
      </svg>
    ),
    bg: 'bg-[#00B900] hover:bg-[#00a500] border border-[#00B900] text-white',
  },
];

export default function SigninPage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSocialLogin = async (providerId: string) => {
    setLoadingProvider(providerId);
    setError('');
    try {
      await signIn(providerId, { callbackUrl: '/admin' });
    } catch {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
      setLoadingProvider(null);
    }
  };

  const handleEmailSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    setLoadingProvider('credentials');
    setError('');
    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/admin',
        redirect: false,
      });
      if (result?.error) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        setLoadingProvider(null);
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setLoadingProvider(null);
>>>>>>> signup
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-20 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-10 left-10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
      >
        <span className="h-px w-8 bg-border group-hover:bg-primary transition-colors" />
        กลับหน้าหลัก
      </Link>

      <div className="relative z-10 w-full max-w-md space-y-8">

        {/* Logo & Heading */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-display font-bold text-primary-foreground text-xl shadow-2xl shadow-primary/20 transition-transform hover:scale-110 mb-8">
            S
          </div>
          <h1 className="text-4xl font-display tracking-tight text-foreground">
            ยินดีต้อนรับกลับมา
          </h1>
          <p className="mt-3 text-muted-foreground font-medium">
            เข้าสู่ระบบเพื่อจัดการที่พักของคุณด้วยความเรียบง่าย
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* ── Social Login Buttons ─────────────────────────────────────────── */}
        <div className="space-y-3">
          {socialProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleSocialLogin(provider.id)}
              disabled={loadingProvider !== null}
              className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-sm hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 ${provider.bg}`}
            >
              {loadingProvider === provider.id ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : provider.icon}
              {loadingProvider === provider.id ? 'กำลังเข้าสู่ระบบ...' : provider.label}
            </button>
          ))}
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              หรือเข้าสู่ระบบด้วยอีเมล
            </span>
          </div>
        </div>

        {/* ── Email + Password Form ────────────────────────────────────────── */}
        <form onSubmit={handleEmailSignin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-primary">
              อีเมล
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-border/40 bg-background px-6 py-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-primary">
                รหัสผ่าน
              </label>
              <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-border/40 bg-background px-6 py-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loadingProvider !== null}
            className="w-full rounded-full bg-primary py-5 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loadingProvider === 'credentials' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          ยังไม่มีบัญชี?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            สร้างบัญชีใหม่
          </Link>
        </p>
      </div>
    </div>
  );
}
