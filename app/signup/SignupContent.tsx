'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';

type Role = 'guest' | 'owner';

const roleConfig: Record<Role, { label: string; desc: string; icon: string }> = {
  guest: {
    label: 'แขก',
    desc: 'เลือกดูและจองห้องพัก',
    icon: '🏠',
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

  const [selectedRole, setSelectedRole] = useState<Role>('guest');
  const [formState, setFormState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fields, setFields] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pdpaConsent, setPdpaConsent] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState === 'loading') return;
    setMessage('');

    if (!fields.first_name.trim() || !fields.last_name.trim() || !fields.email.trim()) {
      setMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (emailAvailable === false) {
      setMessage('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
      return;
    }

    if (fields.password !== fields.confirm_password) {
      setMessage('รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง');
      return;
    }

    if (fields.password.length < 8) {
      setMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (!pdpaConsent) {
      setMessage('กรุณากดยินยอมเปิดเผยข้อมูลและยอมรับข้อตกลงการใช้งาน (PDPA)');
      return;
    }

    setFormState('loading');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: fields.first_name,
          last_name: fields.last_name,
          email: fields.email,
          password: fields.password,
          role: selectedRole,
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
        if (callbackUrl && selectedRole === 'guest') {
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
    <div className="relative flex min-h-screen flex-col bg-background px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <Link
        href="/"
        className="absolute top-6 left-4 sm:top-10 sm:left-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group z-20"
      >
        <span className="h-px w-8 bg-border group-hover:bg-primary transition-colors" />
        กลับหน้าหลัก
      </Link>

      <div className="relative z-10 w-full max-w-lg mx-auto my-auto animate-reveal pt-16 sm:pt-0">
        <div className="text-center mb-8 sm:mb-10">
          <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary font-display font-bold text-primary-foreground text-xl shadow-2xl shadow-primary/20 mb-6 sm:mb-8">
            S
          </div>
          <h1 className="text-3xl sm:text-4xl font-display tracking-tight text-foreground font-black italic ornament">
            สร้างบัญชีใหม่
          </h1>
          <p className="mt-3 text-muted-foreground font-black uppercase text-[10px] tracking-widest">
            เข้าร่วมคอมมูนิตี้ SmartDom เพื่อชีวิตที่จัดการง่ายขึ้น
          </p>
        </div>

        {formState === 'success' && createdUser ? (
          <div className="space-y-6 sm:space-y-8 bg-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-border shadow-xl text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-black text-foreground">ยินดีต้อนรับ!</h2>
            <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">{message}</p>
            <p className="text-xs text-muted-foreground font-bold">ระบบกำลังพาคุณไปยังหน้าหลัก...</p>
          </div>
        ) : (
          <div className="bg-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-border shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ชื่อ</label>
                  <input
                    name="first_name"
                    required
                    value={fields.first_name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-border bg-background px-6 py-4 text-sm font-bold text-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40"
                    placeholder="สมชาย"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">นามสกุล</label>
                  <input
                    name="last_name"
                    required
                    value={fields.last_name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-border bg-background px-6 py-4 text-sm font-bold text-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40"
                    placeholder="ใจดี"
                  />
                </div>
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
                      "w-full rounded-2xl border bg-background px-6 py-4 text-sm font-bold text-foreground focus:bg-card outline-none transition-all placeholder:text-muted-foreground/40 pr-12",
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

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">รหัสผ่าน</label>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={fields.password}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-background px-6 py-4 text-sm font-bold text-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
                      className="w-full rounded-2xl border border-border bg-background px-6 py-4 text-sm font-bold text-foreground focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ฉันคือ...</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(roleConfig) as Role[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all text-center h-full",
                        selectedRole === role ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:bg-secondary"
                      )}
                    >
                      <span className="text-3xl">{roleConfig[role].icon}</span>
                      <div>
                        <p className="text-xs font-black text-foreground leading-tight mb-1">{roleConfig[role].label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PDPA Consent Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-muted/40 rounded-2xl border border-border mt-4">
                <input
                  type="checkbox"
                  id="pdpa-consent"
                  checked={pdpaConsent}
                  onChange={(e) => setPdpaConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-primary border-border focus:ring-primary focus:ring-1 cursor-pointer bg-background"
                />
                <label htmlFor="pdpa-consent" className="text-xs text-muted-foreground font-semibold leading-relaxed cursor-pointer select-none">
                  ฉันยินยอมให้รวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของฉันเพื่อวัตถุประสงค์ในการให้บริการ ตาม{' '}
                  <span className="text-primary hover:underline font-bold">นโยบายความเป็นส่วนตัว (PDPA)</span>{' '}
                  และยอมรับ{' '}
                  <span className="text-primary hover:underline font-bold">ข้อตกลงและเงื่อนไขการใช้บริการ</span>
                </label>
              </div>

              {message && <p className="text-center text-xs text-destructive font-black">{message}</p>}

              <button
                type="submit"
                disabled={formState === 'loading' || emailAvailable === false}
                className="w-full rounded-full bg-primary py-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
              >
                {formState === 'loading' ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก →'}
              </button>
            </form>
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
