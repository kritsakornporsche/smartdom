'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelRequestButton({ requestId }: { requestId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำร้องแจ้งย้ายออกนี้?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/move-out', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการยกเลิกคำร้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="flex-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
    >
      {loading ? 'กำลังยกเลิก...' : 'ยกเลิกคำร้อง (Cancel Request)'}
    </button>
  );
}
