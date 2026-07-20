"use client";

import { useState, useEffect } from "react";

export default function MetersPage() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    room_id: '',
    type: 'Water',
    previous_reading: '',
    current_reading: '',
    billing_cycle: new Date().toISOString().substring(0, 7)
  });

  useEffect(() => {
    fetchMeters();
    fetchRooms();
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

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.room_id || !form.current_reading || !form.billing_cycle) {
       alert('กรุณากรอกข้อมูลให้ครบถ้วน');
       return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/meters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           ...form,
           previous_reading: parseFloat(form.previous_reading) || 0,
           current_reading: parseFloat(form.current_reading)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm(prev => ({ ...prev, previous_reading: '', current_reading: '' }));
        fetchMeters();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative z-10 text-white">
       <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold">ระบบจดมิเตอร์น้ำ-ไฟ</h1>
         <div className="flex gap-3">
           <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors font-medium">บันทึกมิเตอร์ใหม่</button>
           <button onClick={fetchMeters} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors font-medium">โหลดข้อมูลใหม่</button>
         </div>
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
                  <th className="py-3 px-4 text-right">หน่วยที่ใช้</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r: any) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-bold">{r.room_number}</td>
                    <td className="py-3 px-4">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${r.type === 'Water' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                         {r.type === 'Water' ? 'น้ำประปา' : 'ไฟฟ้า'}
                       </span>
                    </td>
                    <td className="py-3 px-4">{r.billing_cycle}</td>
                    <td className="py-3 px-4 text-right">{r.previous_reading}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">{r.current_reading}</td>
                    <td className="py-3 px-4 text-right font-bold">{Number(r.current_reading) - Number(r.previous_reading)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
         )}
       </div>

       {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <div className="bg-[#1e293b] rounded-xl p-8 max-w-md w-full shadow-2xl border border-white/10">
             <h2 className="text-2xl font-bold mb-6">บันทึกมิเตอร์ใหม่</h2>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm text-gray-400 mb-1">ห้องพัก</label>
                 <select required value={form.room_id} onChange={e => setForm({...form, room_id: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                   <option value="">-- เลือกห้อง --</option>
                   {rooms.map((room: any) => (
                     <option key={room.id} value={room.id}>{room.room_number}</option>
                   ))}
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm text-gray-400 mb-1">ประเภทมิเตอร์</label>
                 <select required value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                   <option value="Water">น้ำประปา</option>
                   <option value="Electricity">ไฟฟ้า</option>
                 </select>
               </div>

               <div>
                 <label className="block text-sm text-gray-400 mb-1">รอบบิล (YYYY-MM)</label>
                 <input type="month" required value={form.billing_cycle} onChange={e => setForm({...form, billing_cycle: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm text-gray-400 mb-1">เลขครั้งก่อน</label>
                   <input type="number" step="0.01" value={form.previous_reading} onChange={e => setForm({...form, previous_reading: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="0" />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-400 mb-1">เลขครั้งนี้</label>
                   <input type="number" step="0.01" required value={form.current_reading} onChange={e => setForm({...form, current_reading: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                 </div>
               </div>

               <div className="flex gap-3 mt-6">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">ยกเลิก</button>
                 <button type="submit" disabled={submitting} className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors font-bold">
                   {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
    </div>
  )
}
