'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AcknowledgeButton({ id, isImportant }: { id: number, isImportant: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAcknowledge = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenant/announcements/${id}/read`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการรับทราบข่าวสาร');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleAcknowledge}
      disabled={loading}
      className={`px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 ${
        isImportant 
          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 active:scale-95 disabled:opacity-70' 
          : 'bg-[#8B6A2B] hover:bg-[#725724] text-white shadow-[#8B6A2B]/20 active:scale-95 disabled:opacity-70'
      }`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          กำลังบันทึก...
        </span>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          รับทราบแล้ว
        </>
      )}
    </button>
  );
}
