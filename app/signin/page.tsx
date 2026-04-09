'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const err = urlParams.get('error');
      if (err) {
        if (err === 'Google_OAuth_Not_Configured') {
          setError('ระบบยังไม่ได้ตั้งค่า Google OAuth (Client ID)');
        } else {
          setError(decodeURIComponent(err));
        }
        // clean up url visually
        window.history.replaceState(null, '', '/signin');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to the role-specific dashboard
        router.push(data.redirectUrl);
        router.refresh();
      } else {
        setError(data.message || 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-[#E5DFD3] overflow-hidden">
        {/* Header */}
        <div className="bg-[#FAF8F5] p-8 text-center border-b border-[#E5DFD3]">
          <div className="w-16 h-16 bg-[#8B7355] rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-inner">
            S
          </div>
          <h1 className="text-2xl font-bold text-[#3E342B]">ยินดีต้อนรับกลับมา</h1>
          <p className="text-[#A08D74] mt-2">เข้าสู่ระบบ SmartDom เพื่อจัดการที่พักของคุณ</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-[#A08D74] uppercase tracking-wider mb-2">อีเมล (Email)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DCD3C6] focus:bg-white focus:ring-2 focus:ring-[#8B6A2B]/20 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-medium"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-[#A08D74] uppercase tracking-wider">รหัสผ่าน (Password)</label>
                <Link href="#" className="text-xs font-bold text-[#8B7355] hover:text-[#5A4D41]">ลืมรหัสผ่าน?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DCD3C6] focus:bg-white focus:ring-2 focus:ring-[#8B6A2B]/20 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-all active:scale-[0.98] ${
                loading ? 'bg-[#A08D74] cursor-not-allowed' : 'bg-[#8B6A2B] hover:bg-[#725724]'
              }`}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
            
            <div className="relative flex items-center justify-center my-6 text-sm">
               <div className="absolute inset-x-0 h-px bg-[#E5DFD3]"></div>
               <span className="relative bg-white px-4 text-[#A08D74] font-medium uppercase tracking-wider">หรือ</span>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = '/api/auth/google'}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-[#5A4D41] bg-white border border-[#DCD3C6] shadow-sm hover:bg-[#FAF8F5] transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              เข้าสู่ระบบด้วย Google
            </button>
          </form>

          {/* Helper details for testing */}
          <div className="mt-8 pt-6 border-t border-[#E5DFD3]">
            <h3 className="text-xs font-bold text-[#A08D74] uppercase tracking-wider mb-3 text-center">บัญชีทดสอบ (Demo Accounts)</h3>
            <div className="space-y-2 text-sm text-[#5A4D41] bg-[#FAF8F5] p-4 rounded-xl border border-[#E5DFD3]">
              <div className="flex justify-between"><span>Admin:</span> <span className="font-mono text-xs">admin@smartdom.com / admin123</span></div>
              <div className="flex justify-between"><span>Tenant:</span> <span className="font-mono text-xs">tenant@smartdom.com / tenant123</span></div>
              <div className="flex justify-between"><span>Keeper:</span> <span className="font-mono text-xs">keeper@smartdom.com / keeper123</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
