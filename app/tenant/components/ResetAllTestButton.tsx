'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetAllTestButton() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleResetAll = async () => {
    if (!confirm('!!! คำเตือน !!!\n\nคุณกำลังจะล้างข้อมูลทั้งระบบ:\n- ห้องพักทุกห้องจะกลับมาว่าง\n- สัญญาเช่าทั้งหมดจะถูกลบ\n- บิลและประวัติแจ้งซ่อมจะหายไปทั้งหมด\n\nยืนยันการดำเนินการใช่หรือไม่?')) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/test/reset-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        router.refresh();
        window.location.href = '/'; // Go home and reload fully
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
      onClick={handleResetAll}
      disabled={isProcessing}
      className={`
        px-8 py-4 rounded-full text-sm font-black uppercase tracking-wider transition-all active:scale-95 border-2
        ${isProcessing 
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
          : 'bg-white border-[#FF4D4F] text-[#FF4D4F] hover:bg-[#FFF1F0]'
        }
      `}
    >
      {isProcessing ? 'กำลังรีเซ็ตระบบ...' : 'ล้างประวัติ & ทำให้ห้องว่างทั้งหมด (GLOBAL RESET)'}
    </button>
  );
}
