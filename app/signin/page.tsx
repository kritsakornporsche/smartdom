'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DCD3C6] focus:bg-white focus:ring-2 focus:ring-[#8B6A2B]/20 focus:border-[#8B6A2B] outline-none transition-all text-[#3E342B] font-medium pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#A08D74] hover:text-[#8B7355] transition-colors"
                  title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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
