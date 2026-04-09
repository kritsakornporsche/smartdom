'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Role = 'tenant' | 'keeper' | 'owner';

const roleConfig: Record<Role, { label: string; desc: string; icon: string }> = {
  tenant: {
    label: 'ผู้เช่า',
    desc: 'จัดการห้องพัก ชำระค่าเช่า และแจ้งซ่อมแซม',
    icon: '🏠',
  },
  keeper: {
    label: 'ผู้ดูแล',
    desc: 'จัดการงานประจำวัน รับแจ้งซ่อม และดูแลผู้เช่า',
    icon: '🔧',
  },
  owner: {
    label: 'แอดมิน / เจ้าของ',
    desc: 'ควบคุมระบบทั้งหมด วิเคราะห์ข้อมูล และจัดการทีม',
    icon: '👑',
  },
};

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<Role>('tenant');
  const [formState, setFormState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fields, setFields] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));

    // Live email availability check (debounced)
    if (name === 'email') {
      setEmailAvailable(null);
      if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current);
      if (value.includes('@') && value.includes('.')) {
        setCheckingEmail(true);
        emailCheckTimer.current = setTimeout(async () => {
          try {
            const res = await fetch(`/api/auth/signup?email=${encodeURIComponent(value)}`);
            const data = await res.json();
            setEmailAvailable(data.available);
          } catch {
            setEmailAvailable(null);
          } finally {
            setCheckingEmail(false);
          }
        }, 600);
      } else {
        setCheckingEmail(false);
      }
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.full_name.trim() || !fields.email.trim()) return;
    if (emailAvailable === false) {
      setMessage('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
      return;
    }
    setMessage('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (fields.password !== fields.confirm_password) {
      setMessage('รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง');
      return;
    }

    if (fields.password.length < 8) {
      setMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setFormState('loading');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fields.full_name,
          email: fields.email,
          password: fields.password,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFormState('success');
        setMessage(data.message);
        // Redirect to signin after 2.5s
        setTimeout(() => router.push('/signin'), 2500);
      } else {
        setFormState('error');
        setMessage(data.message);
      }
    } catch {
      setFormState('error');
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-20 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back */}
      <Link
        href="/"
        className="absolute top-10 left-10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
      >
        <span className="h-px w-8 bg-border group-hover:bg-primary transition-colors" />
        กลับหน้าหลัก
      </Link>

      <div className="relative z-10 w-full max-w-md">

        {/* ── Logo & Heading ─────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-display font-bold text-primary-foreground text-xl shadow-2xl shadow-primary/20 transition-transform hover:scale-110 mb-8">
            S
          </div>
          <h1 className="text-4xl font-display tracking-tight text-foreground">
            ก้าวแรกสู่ความเรียบง่าย
          </h1>
          <p className="mt-3 text-muted-foreground font-medium">
            เข้าร่วมคอมมูนิตี้ SmartDom เพื่อชีวิตที่จัดการง่ายขึ้น
          </p>
        </div>

        {/* ── Step Indicator ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">
          ขั้นตอนที่ {step} จาก 2 — {step === 1 ? 'ข้อมูลส่วนตัว' : 'เลือกบทบาท & รหัสผ่าน'}
        </p>

        {/* ── SUCCESS STATE ─────────────────────────────────────────────── */}
        {formState === 'success' ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-foreground">สมัครสมาชิกสำเร็จ!</h2>
            <p className="text-muted-foreground font-medium">{message}</p>
            <p className="text-xs text-muted-foreground/70">กำลังนำคุณไปหน้าเข้าสู่ระบบ...</p>
          </div>
        ) : (
          <>
            {/* ── STEP 1: Personal Info ──────────────────────────────────── */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-xs font-bold uppercase tracking-widest text-primary">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    value={fields.full_name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-border/40 bg-background px-6 py-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
                    placeholder="สมชาย ใจดี"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-primary">
                    อีเมล
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={fields.email}
                      onChange={handleChange}
                      className={`w-full rounded-2xl border bg-background px-6 py-4 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm pr-12 ${
                        emailAvailable === false
                          ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
                          : emailAvailable === true
                          ? 'border-green-400 focus:ring-1 focus:ring-green-400'
                          : 'border-border/40 focus:border-primary focus:ring-1 focus:ring-primary'
                      }`}
                      placeholder="you@example.com"
                    />
                    {/* Status icon */}
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                      {checkingEmail && (
                        <svg className="animate-spin w-4 h-4 text-primary/50" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      )}
                      {!checkingEmail && emailAvailable === true && (
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                      {!checkingEmail && emailAvailable === false && (
                        <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Email hint */}
                  {emailAvailable === false && (
                    <p className="text-xs text-rose-500 font-semibold pl-1">อีเมลนี้ถูกใช้งานแล้ว</p>
                  )}
                  {emailAvailable === true && (
                    <p className="text-xs text-green-600 font-semibold pl-1">อีเมลนี้พร้อมใช้งาน</p>
                  )}
                </div>

                {message && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={emailAvailable === false}
                  className="w-full rounded-full bg-primary py-5 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  ถัดไป →
                </button>
              </form>
            )}

            {/* ── STEP 2: Role + Password ────────────────────────────────── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary">
                    ฉันคือ...
                  </label>
                  <div className="space-y-3">
                    {(Object.keys(roleConfig) as Role[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all ${
                          selectedRole === role
                            ? 'border-primary bg-primary/8 shadow-sm'
                            : 'border-border/40 hover:border-border hover:bg-accent/30'
                        }`}
                      >
                        <span className="text-2xl">{roleConfig[role].icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${selectedRole === role ? 'text-primary' : 'text-foreground'}`}>
                            {roleConfig[role].label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{roleConfig[role].desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
                          selectedRole === role ? 'border-primary bg-primary' : 'border-border'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-primary">
                    รหัสผ่าน
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    value={fields.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-border/40 bg-background px-6 py-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                  />
                  {/* Strength meter */}
                  {fields.password.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {[4, 8, 12].map((threshold, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            fields.password.length >= threshold
                              ? i === 0 ? 'bg-rose-400' : i === 1 ? 'bg-amber-400' : 'bg-green-500'
                              : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirm_password" className="text-xs font-bold uppercase tracking-widest text-primary">
                    ยืนยันรหัสผ่าน
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    value={fields.confirm_password}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border bg-background px-6 py-4 text-sm font-medium focus:ring-1 outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm ${
                      fields.confirm_password.length > 0
                        ? fields.password === fields.confirm_password
                          ? 'border-green-400 focus:ring-green-400'
                          : 'border-rose-400 focus:ring-rose-400'
                        : 'border-border/40 focus:border-primary focus:ring-primary'
                    }`}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                  />
                </div>

                {/* Error message */}
                {message && formState === 'error' && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium">
                    {message}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setMessage(''); setFormState('idle'); }}
                    className="flex-1 rounded-full border border-border/60 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-accent/40 transition-all"
                  >
                    ← ย้อนกลับ
                  </button>
                  <button
                    type="submit"
                    disabled={formState === 'loading'}
                    className="flex-[2] rounded-full bg-primary py-4 text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
                  >
                    {formState === 'loading' ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
                  </button>
                </div>
              </form>
            )}

            {/* ── Link to signin ─────────────────────────────────────────── */}
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-8">
              มีบัญชีอยู่แล้ว?{' '}
              <Link href="/signin" className="text-primary font-bold hover:underline">
                เข้าสู่ระบบที่นี่
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
