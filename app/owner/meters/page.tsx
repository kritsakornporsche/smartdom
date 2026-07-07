"use client";

import { useState, useEffect } from "react";

export default function MetersPage() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeters();
  }, []);

  const fetchMeters = async () => {
    try {
      const res = await fetch('/api/owner/meters');
      const data = await res.json();
      if (data.success) {
        setReadings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative z-10 text-white">
       <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold">ระบบจดมิเตอร์น้ำ-ไฟ</h1>
         <button onClick={fetchMeters} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium">โหลดข้อมูลใหม่</button>
       </div>
       <div className="bg-[#101A30] rounded-xl border border-white/5 p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
         {loading ? (
            <p>Loading...</p>
         ) : readings.length === 0 ? (
            <p className="text-gray-400 text-center py-10">ยังไม่มีข้อมูลการจดมิเตอร์</p>
         ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="py-3 px-4">ห้อง</th>
                  <th className="py-3 px-4">ประเภท</th>
                  <th className="py-3 px-4">รอบบิล</th>
                  <th className="py-3 px-4 text-right">เลขครั้งก่อน</th>
                  <th className="py-3 px-4 text-right">เลขครั้งนี้</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r: any) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">{r.room_number}</td>
                    <td className="py-3 px-4">{r.type === 'Water' ? 'น้ำประปา' : 'ไฟฟ้า'}</td>
                    <td className="py-3 px-4">{r.billing_cycle}</td>
                    <td className="py-3 px-4 text-right">{r.previous_reading}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">{r.current_reading}</td>
                  </tr>
                ))}
              </tbody>
            </table>
         )}
       </div>
    </div>
  )
}
