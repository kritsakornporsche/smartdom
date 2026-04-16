'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';

type Role = 'guest' | 'keeper' | 'owner';

const roleConfig: Record<Role, { label: string; desc: string; icon: string }> = {
  guest: {
    label: 'แขก',
    desc: 'เลือกดูและจองห้องพัก',
    icon: '🏠',
  },
  keeper: {
    label: 'ผู้ดูแล',
    desc: 'สำหรับพนักงาน ช่างซ่อม และแม่บ้าน',
    icon: '👷',
  },
  owner: {
    label: 'เจ้าของหอพัก',
    desc: 'ควบคุมระบบทั้งหมด วิเคราะห์ข้อมูล และจัดการหอพัก',
    icon: '👑',
  }
};

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface CreatedUser {
  id: number;
  full_name: string;
  email: string;
  role: Role;
}

export default function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<Role>('guest');
  const [selectedSubRole, setSelectedSubRole] = useState<'maid' | 'technician'>('maid');
  const [formState, setFormState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fields, setFields] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));

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
    if (formState === 'loading') return;
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
          sub_role: selectedRole === 'keeper' ? selectedSubRole : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await signIn('credentials', {
           email: fields.email,
           password: fields.password,
           redirect: false
        });

        setFormState('success');
        setMessage(data.message);
        setCreatedUser(data.data);
        
        let redirectPath = selectedRole === 'owner' ? '/owner' : '/explore';
        if (selectedRole === 'keeper') {
          if (selectedSubRole === 'maid') redirectPath = '/keeper/maid';
          else if (selectedSubRole === 'technician') redirectPath = '/keeper/technician';
          else redirectPath = '/keeper';
        } else if (callbackUrl && selectedRole === 'guest') {
          redirectPath = callbackUrl;
        }

        setTimeout(() => router.push(redirectPath), 2000);
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
    <div className="relative flex min-h-screen items-center justify-center bg-[#FAF8F5] px-6 py-20 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <Link
        href="/"
        className="absolute top-10 left-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
      >
        <span className="h-px w-8 bg-border group-hover:bg-primary transition-colors" />
        กลับหน้าหลัก
      </Link>

      <div className="relative z-10 w-full max-w-md animate-reveal">
        <div className="text-center mb-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-display font-bold text-primary-foreground text-xl shadow-2xl shadow-primary/20 mb-8">
            S
          </div>
          <h1 className="text-4xl font-display tracking-tight text-foreground font-black italic ornament">
            สร้างบัญชีใหม่
          </h1>
          <p className="mt-3 text-muted-foreground font-black uppercase text-[10px] tracking-widest">
            เข้าร่วมคอมมูนิตี้ SmartDom เพื่อชีวิตที่จัดการง่ายขึ้น
          </p>
        </div>

        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {formState === 'success' && createdUser ? (
          <div className="space-y-8 bg-card rounded-[2.5rem] p-10 border border-border shadow-xl text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-black text-foreground">ยินดีต้อนรับ!</h2>
            <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">{message}</p>
            <p className="text-xs text-muted-foreground font-bold">ระบบกำลังพาคุณไปยังหน้าหลัก...</p>
          </div>
        ) : (
          <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-xl">
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ชื่อ-นามสกุล</label>
                  <input
                    name="full_name"
                    required
                    value={fields.full_name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-border bg-background px-6 py-4 text-sm font-bold text-foreground focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40"
                    placeholder="สมชาย ใจดี"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">อีเมล</label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      required
                      value={fields.email}
                      onChange={handleChange}
                      className={cn(
                        "w-full rounded-2xl border bg-background px-6 py-4 text-sm font-bold text-foreground focus:bg-white outline-none transition-all placeholder:text-muted-foreground/40 pr-12",
                        emailAvailable === false ? 'border-destructive' : emailAvailable === true ? 'border-emerald-400 font-black' : 'border-border focus:border-primary'
                      )}
                      placeholder="you@example.com"
                    />
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                      {checkingEmail && <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                      {!checkingEmail && emailAvailable === true && <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                      {!checkingEmail && emailAvailable === false && <svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={emailAvailable === false}
                  className="w-full rounded-full bg-primary py-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                >
                  ถัดไป →
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ฉันคือ...</label>
                  <div className="grid grid-cols-1 gap-3">
                    {(Object.keys(roleConfig) as Role[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
                          selectedRole === role ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:bg-secondary"
                        )}
                      >
                        <span className="text-2xl">{roleConfig[role].icon}</span>
                        <div>
                          <p className="text-sm font-black text-foreground">{roleConfig[role].label}</p>
                          <p className="text-[10px] text-muted-foreground font-black leading-tight uppercase tracking-tighter">{roleConfig[role].desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Sub-role selector for Keeper */}
                  {selectedRole === 'keeper' && (
                    <div className="mt-4 p-4 rounded-3xl bg-secondary/30 border border-border space-y-3 animate-in fade-in zoom-in-95 duration-500">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground w-full block pl-2">
                        ระบุประเภทพนักงาน
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedSubRole('maid')}
                          className={cn(
                            "flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300",
                            selectedSubRole === 'maid'
                              ? "border-primary bg-white shadow-sm scale-[1.02] text-primary"
                              : "border-border bg-background/50 hover:bg-white text-muted-foreground"
                          )}
                        >
                          <span className="text-2xl mb-1">🧹</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">แม่บ้าน</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSubRole('technician')}
                          className={cn(
                            "flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300",
                            selectedSubRole === 'technician'
                              ? "border-primary bg-white shadow-sm scale-[1.02] text-primary"
                              : "border-border bg-background/50 hover:bg-white text-muted-foreground"
                          )}
                        >
                          <span className="text-2xl mb-1">🔧</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">ช่างซ่อม</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">รหัสผ่าน</label>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={fields.password}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-background px-6 py-4 text-sm font-bold text-foreground focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ยืนยันรหัสผ่าน</label>
                    <input
                      name="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={fields.confirm_password}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-background px-6 py-4 text-sm font-bold text-foreground focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {message && <p className="text-center text-xs text-destructive font-black">{message}</p>}

                <div className="flex gap-4">
                   <button 
                     type="button" 
                     onClick={() => setStep(1)}
                     className="flex-1 rounded-full border border-border py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted"
                   >
                     ย้อนกลับ
                   </button>
                   <button
                    type="submit"
                    disabled={formState === 'loading'}
                    className="flex-[2] rounded-full bg-primary py-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
                  >
                    {formState === 'loading' ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-10">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/signin" className="text-primary border-b border-primary/20">เข้าสู่ระบบที่นี่</Link>
        </p>
      </div>
    </div>
  );
}
