import { Metadata } from 'next';
import { Suspense } from 'react';
import SignupContent from './SignupContent';

export const metadata: Metadata = {
  title: 'สมัครสมาชิก | SmartDom',
  description: 'เริ่มต้นใช้งาน SmartDom เพื่อจัดการหอพักและห้องพักของคุณอย่างมืออาชีพ ประสบการณ์ที่เรียบง่ายและเป็นระบบ',
};

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#8B7355]/20 border-t-[#8B7355] rounded-full animate-spin" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
