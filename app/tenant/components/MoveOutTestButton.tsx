'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MoveOutTestButton() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleMoveOut = async () => {
    if (!confirm('คุณต้องการรีเซ็ตสถานะเป็น Guest และคืนห้องพักเพื่อเทสระบบใช่หรือไม่?')) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/test/move-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        router.push('/');
        router.refresh();
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message);
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleMoveOut}
      disabled={isProcessing}
      className={`
        px-12 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95
        ${isProcessing 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-[#D48806] text-white hover:bg-[#B37200] shadow-xl shadow-[#D48806]/20'
        }
      `}
    >
      {isProcessing ? 'กำลังรีเซ็ตระบบ...' : 'ยืนยันการย้ายออก (TEST RESET)'}
    </button>
  );
}
