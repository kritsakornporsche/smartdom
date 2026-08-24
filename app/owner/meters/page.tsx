"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

interface MeterReading {
  id: number;
  room_id: number;
  room_number: string;
  type: 'Water' | 'Electricity';
  billing_cycle: string;
  previous_reading: number | string;
  current_reading: number | string;
  created_at?: string;
}

interface Room {
  id: number;
  room_number: string;
}

export default function MetersPage() {
  const router = useRouter();
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Checkbox Selection States
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);

  // Search & Filter States
  const [searchRoom, setSearchRoom] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'Water' | 'Electricity'>('all');
  
  // Pagination States
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Single Entry Form
  const [form, setForm] = useState({
    room_id: '',
    type: 'Water' as 'Water' | 'Electricity',
    previous_reading: '',
    current_reading: '',
    billing_cycle: new Date().toISOString().substring(0, 7)
  });

  // Batch Form State
  const [batchCycle, setBatchCycle] = useState<string>('');
  const [batchItems, setBatchItems] = useState<{
    room_id: number;
    room_number: string;
    water_prev: number;
    water_curr: string;
    elec_prev: number;
    elec_curr: string;
  }[]>([]);

  // Calculate Next Month string (YYYY-MM)
  const getNextMonthCycle = (currentCycleStr?: string) => {
    let baseDate = new Date();
    if (currentCycleStr && currentCycleStr.match(/^\d{4}-\d{2}$/)) {
      const [y, m] = currentCycleStr.split('-').map(Number);
      baseDate = new Date(y, m, 1);
    } else {
      baseDate.setMonth(baseDate.getMonth() + 1);
    }
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const fetchMeters = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedCycle === 'all' 
        ? '/api/owner/meters' 
        : `/api/owner/meters?billing_cycle=${selectedCycle}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReadings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCycle]);

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

  useEffect(() => {
    fetchMeters();
    fetchRooms();
  }, [fetchMeters]);

  // Unique billing cycles for filter
  const billingCycles = useMemo(() => {
    const cycles = Array.from(new Set(readings.map(r => r.billing_cycle))).filter(Boolean);
    cycles.sort().reverse();
    return cycles;
  }, [readings]);

  // Latest cycle
  const latestCycle = useMemo(() => {
    if (billingCycles.length > 0) return billingCycles[0];
    return new Date().toISOString().substring(0, 7);
  }, [billingCycles]);

  // Summary stats
  const stats = useMemo(() => {
    let waterUnits = 0;
    let elecUnits = 0;
    let totalRooms = new Set<string>();

    readings.forEach(r => {
      totalRooms.add(r.room_number);
      const units = Math.max(0, Number(r.current_reading) - Number(r.previous_reading));
      if (r.type === 'Water') waterUnits += units;
      else elecUnits += units;
    });

    return {
      waterUnits,
      elecUnits,
      recordedRooms: totalRooms.size,
      totalReadings: readings.length,
    };
  }, [readings]);

  // Filtered readings based on search and filters
  const filteredReadings = useMemo(() => {
    return readings.filter(r => {
      // Room search
      const matchesRoom = searchRoom.trim() === '' || 
        r.room_number.toLowerCase().includes(searchRoom.toLowerCase().trim());

      // Date / Cycle search
      const matchesDate = searchDate.trim() === '' || 
        r.billing_cycle.includes(searchDate.trim()) ||
        (r.created_at && r.created_at.includes(searchDate.trim()));

      // Type filter
      const matchesType = selectedType === 'all' || r.type === selectedType;

      return matchesRoom && matchesDate && matchesType;
    });
  }, [readings, searchRoom, searchDate, selectedType]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchRoom, searchDate, selectedType, selectedCycle, pageSize]);

  // Pagination calculation
  const totalPages = useMemo(() => {
    if (pageSize === 0) return 1;
    return Math.max(1, Math.ceil(filteredReadings.length / pageSize));
  }, [filteredReadings.length, pageSize]);

  const paginatedReadings = useMemo(() => {
    if (pageSize === 0) return filteredReadings;
    const start = (currentPage - 1) * pageSize;
    return filteredReadings.slice(start, start + pageSize);
  }, [filteredReadings, currentPage, pageSize]);

  // Toggle selection for a single room
  const toggleRoomSelection = (roomId: number) => {
    setSelectedRoomIds(prev => 
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  // Toggle Select All in current page
  const currentPageRoomIds = useMemo(() => {
    return Array.from(new Set(paginatedReadings.map(r => r.room_id)));
  }, [paginatedReadings]);

  const isAllCurrentPageSelected = useMemo(() => {
    if (currentPageRoomIds.length === 0) return false;
    return currentPageRoomIds.every(id => selectedRoomIds.includes(id));
  }, [currentPageRoomIds, selectedRoomIds]);

  const toggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      setSelectedRoomIds(prev => prev.filter(id => !currentPageRoomIds.includes(id)));
    } else {
      setSelectedRoomIds(prev => Array.from(new Set([...prev, ...currentPageRoomIds])));
    }
  };

  // Open single modal for new month (optionally for a specific room)
  const handleOpenNewMonthSingle = (targetRoomId?: number) => {
    const nextCycle = getNextMonthCycle(latestCycle);
    const chosenRoomId = targetRoomId ? String(targetRoomId) : (rooms[0]?.id ? String(rooms[0].id) : '');
    const lastRecord = readings.find(r => r.room_id === Number(chosenRoomId) && r.type === 'Water');
    
    setForm({
      room_id: chosenRoomId,
      type: 'Water',
      previous_reading: lastRecord ? String(lastRecord.current_reading) : '0',
      current_reading: '',
      billing_cycle: nextCycle,
    });
    setShowModal(true);
  };

  // Open Batch Modal (for all rooms or only selected rooms)
  const handleOpenBatchModal = (onlySelected = false) => {
    const nextCycle = getNextMonthCycle(latestCycle);
    setBatchCycle(nextCycle);

    const targetRooms = onlySelected && selectedRoomIds.length > 0
      ? rooms.filter(r => selectedRoomIds.includes(r.id))
      : rooms;

    // Build batch template prefilled with previous current readings
    const items = targetRooms.map(room => {
      const lastWater = readings.find(r => r.room_id === room.id && r.type === 'Water');
      const lastElec = readings.find(r => r.room_id === room.id && r.type === 'Electricity');

      return {
        room_id: room.id,
        room_number: room.room_number,
        water_prev: lastWater ? Number(lastWater.current_reading) : 0,
        water_curr: '',
        elec_prev: lastElec ? Number(lastElec.current_reading) : 0,
        elec_curr: '',
      };
    });

    setBatchItems(items);
    setShowBatchModal(true);
  };

  const handleRoomSelectChange = (roomId: string) => {
    const selectedRoomId = Number(roomId);
    const lastRecord = readings.find(r => r.room_id === selectedRoomId && r.type === form.type);
    setForm(prev => ({
      ...prev,
      room_id: roomId,
      previous_reading: lastRecord ? String(lastRecord.current_reading) : '0',
    }));
  };

  const handleTypeSelectChange = (type: 'Water' | 'Electricity') => {
    const selectedRoomId = Number(form.room_id);
    const lastRecord = readings.find(r => r.room_id === selectedRoomId && r.type === type);
    setForm(prev => ({
      ...prev,
      type,
      previous_reading: lastRecord ? String(lastRecord.current_reading) : '0',
    }));
  };

  // Submit Single Reading
  const handleSubmitSingle = async (e: React.FormEvent) => {
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

  // Submit Batch Readings
  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCycle) {
      alert('กรุณาระบุรอบบิล');
      return;
    }

    const payloadItems: any[] = [];
    batchItems.forEach(item => {
      if (item.water_curr !== '') {
        payloadItems.push({
          room_id: item.room_id,
          type: 'Water',
          previous_reading: item.water_prev,
          current_reading: parseFloat(item.water_curr),
          billing_cycle: batchCycle,
        });
      }
      if (item.elec_curr !== '') {
        payloadItems.push({
          room_id: item.room_id,
          type: 'Electricity',
          previous_reading: item.elec_prev,
          current_reading: parseFloat(item.elec_curr),
          billing_cycle: batchCycle,
        });
      }
    });

    if (payloadItems.length === 0) {
      alert('กรุณากรอกเลขมิเตอร์อย่างน้อย 1 รายการ');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/meters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems })
      });
      const data = await res.json();
      if (data.success) {
        alert(`บันทึกมิเตอร์รอบเดือน ${batchCycle} สำเร็จ ${payloadItems.length} รายการ`);
        setShowBatchModal(false);
        setSelectedRoomIds([]);
        setSelectedCycle(batchCycle);
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

  const clearAllFilters = () => {
    setSearchRoom('');
    setSearchDate('');
    setSelectedCycle('all');
    setSelectedType('all');
  };

  const isFiltering = searchRoom !== '' || searchDate !== '' || selectedCycle !== 'all' || selectedType !== 'all';

  return (
    <div className="flex-1 overflow-y-auto p-8 relative z-10 text-white min-h-screen bg-[#080F1E]">
       {/* Top Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
         <div>
           <div className="flex items-center gap-3">
             <h1 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-white">ระบบจดมิเตอร์น้ำ-ไฟ</h1>
             <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
               รอบล่าสุด: {latestCycle}
             </span>
           </div>
           <p className="text-xs text-white/50 font-medium mt-1">บันทึกและตรวจสอบหน่วยการใช้น้ำประปาและไฟฟ้าประจำเดือน</p>
         </div>
         <div className="flex flex-wrap gap-3">
           <button 
             onClick={() => handleOpenNewMonthSingle()}
             className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
           >
             <span>➕</span> จดมิเตอร์เดือนใหม่ (รายห้อง)
           </button>
           <button 
             onClick={() => handleOpenBatchModal(false)}
             className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
           >
             <span>⚡</span> จดมิเตอร์ด่วนทุกห้องรอบใหม่
           </button>
           <button 
             onClick={fetchMeters} 
             disabled={loading}
             className="bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
           >
             <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
             รีเฟรช
           </button>
         </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
         <div className="bg-[#0F172A] border border-white/10 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
           <div className="text-xs font-bold text-white/50 uppercase tracking-wider">ห้องที่บันทึกแล้ว</div>
           <div className="mt-3 flex items-baseline gap-2">
             <span className="text-3xl font-display font-black text-white">{stats.recordedRooms}</span>
             <span className="text-xs text-white/40 font-medium">/ {rooms.length} ห้อง</span>
           </div>
         </div>
         <div className="bg-[#0F172A] border border-white/10 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
           <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">หน่วยน้ำประปารวม</div>
           <div className="mt-3 flex items-baseline gap-2">
             <span className="text-3xl font-display font-black text-blue-400">{stats.waterUnits.toLocaleString()}</span>
             <span className="text-xs text-blue-400/60 font-medium">หน่วย (ยูนิต)</span>
           </div>
         </div>
         <div className="bg-[#0F172A] border border-white/10 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
           <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">หน่วยไฟฟ้ารวม</div>
           <div className="mt-3 flex items-baseline gap-2">
             <span className="text-3xl font-display font-black text-orange-400">{stats.elecUnits.toLocaleString()}</span>
             <span className="text-xs text-orange-400/60 font-medium">หน่วย (ยูนิต)</span>
           </div>
         </div>
       </div>

       {/* Advanced Search & Multi-filter Suite */}
       <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 mb-6 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
           
           {/* Room Search */}
           <div className="md:col-span-4 relative">
             <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
               🔍 ค้นหาเลขห้อง
             </label>
             <div className="relative">
               <input
                 type="text"
                 placeholder="พิมพ์เลขห้อง เช่น 101, 202..."
                 value={searchRoom}
                 onChange={e => setSearchRoom(e.target.value)}
                 className="w-full bg-[#1E293B] border border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/40 font-bold outline-none focus:ring-2 focus:ring-blue-500/30"
               />
               <svg className="w-4 h-4 text-white/40 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
               {searchRoom && (
                 <button
                   onClick={() => setSearchRoom('')}
                   className="absolute right-3 top-2.5 text-xs text-white/40 hover:text-white"
                 >
                   ✕
                 </button>
               )}
             </div>
           </div>

           {/* Date / Month Search */}
           <div className="md:col-span-3 relative">
             <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
               📅 ค้นหาตามวันที่ / รอบเดือน
             </label>
             <div className="relative">
               <input
                 type="month"
                 value={searchDate}
                 onChange={e => setSearchDate(e.target.value)}
                 className="w-full bg-[#1E293B] border border-white/10 rounded-2xl px-4 py-2 text-xs text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/30"
               />
               {searchDate && (
                 <button
                   onClick={() => setSearchDate('')}
                   className="absolute right-9 top-2 text-xs text-white/40 hover:text-white"
                   title="ล้างวันที่"
                 >
                   ✕
                 </button>
               )}
             </div>
           </div>

           {/* Billing Cycle Selector */}
           <div className="md:col-span-3">
             <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
               🔄 รอบบิล
             </label>
             <select
               value={selectedCycle}
               onChange={e => setSelectedCycle(e.target.value)}
               className="w-full bg-[#1E293B] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
             >
               <option value="all">ทุกรอบบิลทั้งหมด ({readings.length} รายการ)</option>
               {billingCycles.map(c => (
                 <option key={c} value={c}>รอบบิล {c}</option>
               ))}
             </select>
           </div>

           {/* Rows per page */}
           <div className="md:col-span-2">
             <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
               📄 แสดงต่อหน้า
             </label>
             <select
               value={pageSize}
               onChange={e => setPageSize(Number(e.target.value))}
               className="w-full bg-[#1E293B] border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
             >
               <option value={10}>10 รายการ</option>
               <option value={20}>20 รายการ</option>
               <option value={50}>50 รายการ</option>
               <option value={100}>100 รายการ</option>
               <option value={0}>ทั้งหมด</option>
             </select>
           </div>

         </div>

         {/* Second Filter Row: Meter Type Tabs & Filter Status */}
         <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
           <div className="flex items-center gap-2">
             <span className="text-[11px] font-bold text-white/50 uppercase mr-1">ประเภทมิเตอร์:</span>
             {(['all', 'Water', 'Electricity'] as const).map(t => (
               <button
                 key={t}
                 onClick={() => setSelectedType(t)}
                 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                   selectedType === t
                     ? t === 'Water'
                       ? 'bg-blue-600 text-white shadow-sm'
                       : t === 'Electricity'
                       ? 'bg-orange-600 text-white shadow-sm'
                       : 'bg-primary text-white shadow-sm'
                     : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                 }`}
               >
                 {t === 'all' ? 'ทั้งหมด' : t === 'Water' ? '💧 น้ำประปา' : '⚡ ไฟฟ้า'}
               </button>
             ))}
           </div>

           <div className="flex items-center gap-3">
             {isFiltering && (
               <button
                 onClick={clearAllFilters}
                 className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
               >
                 ✕ ล้างตัวกรองทั้งหมด
               </button>
             )}
             <span className="text-xs font-bold text-white/60">
               พบ <strong className="text-white">{filteredReadings.length}</strong> รายการ
               {pageSize > 0 && ` (หน้า ${currentPage}/${totalPages})`}
             </span>
           </div>
         </div>
       </div>

       {/* Floating / Sticky Multi-Selection Action Bar */}
       {selectedRoomIds.length > 0 && (
         <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-2 border-blue-500/50 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
           <div className="flex items-center gap-3">
             <div className="h-9 w-9 rounded-xl bg-blue-500 flex items-center justify-center font-black text-white text-sm shadow-md">
               {selectedRoomIds.length}
             </div>
             <div>
               <div className="text-sm font-black text-white">
                 เลือกอยู่ {selectedRoomIds.length} ห้อง
               </div>
               <div className="text-xs text-blue-200/70 font-medium">
                 พร้อมดำเนินการจดมิเตอร์หรือออกบิลแจ้งหนี้เฉพาะห้องที่เลือก
               </div>
             </div>
           </div>

           <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
             <button
               onClick={() => handleOpenBatchModal(true)}
               className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
             >
               <span>⚡</span> จดมิเตอร์รอบใหม่ ({selectedRoomIds.length} ห้อง)
             </button>

             <button
               onClick={() => router.push('/owner/billing')}
               className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
             >
               <span>📄</span> ออกบิลห้องที่เลือก
             </button>

             <button
               onClick={() => setSelectedRoomIds([])}
               className="px-3 py-2.5 rounded-xl border border-white/20 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
             >
               ✕ ยกเลิก
             </button>
           </div>
         </div>
       )}

       {/* Main Table Container */}
       <div className="bg-[#0F172A] rounded-3xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-xl mb-6">
         {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-white/50">กำลังโหลดข้อมูลมิเตอร์...</p>
            </div>
         ) : paginatedReadings.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="text-4xl text-white/40">⚡</div>
              <p className="text-sm font-medium text-white/50">
                {isFiltering ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา' : 'ยังไม่มีข้อมูลการจดมิเตอร์ในรอบบิลนี้'}
              </p>
              {isFiltering ? (
                <button
                  onClick={clearAllFilters}
                  className="mt-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  ล้างตัวกรองเพื่อดูข้อมูลทั้งหมด
                </button>
              ) : (
                <button 
                  onClick={() => handleOpenNewMonthSingle()}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  เริ่มจดมิเตอร์ห้องแรก
                </button>
              )}
            </div>
         ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider bg-white/5">
                    <th className="py-4 px-6">ห้อง</th>
                    <th className="py-4 px-6">ประเภท</th>
                    <th className="py-4 px-6">รอบบิล</th>
                    <th className="py-4 px-6 text-right">เลขครั้งก่อน</th>
                    <th className="py-4 px-6 text-right">เลขครั้งนี้</th>
                    <th className="py-4 px-6 text-right">หน่วยที่ใช้</th>
                    {/* Checkbox Column Header at the end */}
                    <th className="py-4 px-6 text-center w-24">
                      <div className="flex flex-col items-center gap-1">
                        <label className="text-[10px] font-bold text-white/60 cursor-pointer">เลือก</label>
                        <input
                          type="checkbox"
                          checked={isAllCurrentPageSelected}
                          onChange={toggleSelectAllCurrentPage}
                          title="เลือก/ยกเลิกทั้งหมดในหน้านี้"
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {paginatedReadings.map((r: any) => {
                    const units = Number(r.current_reading) - Number(r.previous_reading);
                    const isSelected = selectedRoomIds.includes(r.room_id);

                    return (
                      <tr 
                        key={r.id} 
                        className={`transition-colors group cursor-pointer ${
                          isSelected ? 'bg-blue-600/10 hover:bg-blue-600/20' : 'hover:bg-white/5'
                        }`}
                        onClick={() => toggleRoomSelection(r.room_id)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className={`h-8 w-10 border rounded-lg flex items-center justify-center font-black text-xs transition-colors ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-400' 
                                : 'bg-white/5 border-white/10 text-white group-hover:border-blue-400/40'
                            }`}>
                              {r.room_number}
                            </span>
                            <span className="font-bold text-white group-hover:text-blue-300 transition-colors">ห้อง {r.room_number}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                            r.type === 'Water' 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          }`}>
                            {r.type === 'Water' ? '💧 น้ำประปา' : '⚡ ไฟฟ้า'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-white/70 font-medium">{r.billing_cycle}</td>
                        <td className="py-4 px-6 text-right font-mono text-white/60">{Number(r.previous_reading).toFixed(2)}</td>
                        <td className="py-4 px-6 text-right font-mono text-emerald-400 font-black text-base">{Number(r.current_reading).toFixed(2)}</td>
                        <td className="py-4 px-6 text-right font-mono font-black text-white">
                          <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-white font-bold">
                            {units >= 0 ? units : 0}
                          </span>
                        </td>
                        
                        {/* Checkbox at the end of each row */}
                        <td className="py-4 px-6 text-center" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRoomSelection(r.room_id)}
                              className="w-5 h-5 rounded-lg accent-blue-600 cursor-pointer shadow-sm"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
         )}

         {/* Pagination Controls Section */}
         {pageSize > 0 && totalPages > 1 && (
           <div className="px-6 py-4 bg-[#0B132B] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="text-xs text-white/50 font-medium">
               แสดงรายการที่ <strong className="text-white font-bold">{(currentPage - 1) * pageSize + 1}</strong> ถึง{' '}
               <strong className="text-white font-bold">{Math.min(currentPage * pageSize, filteredReadings.length)}</strong> จากทั้งหมด{' '}
               <strong className="text-white font-bold">{filteredReadings.length}</strong> รายการ
             </div>
             
             <div className="flex items-center gap-1">
               <button
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
                 className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
               >
                 ‹ ก่อนหน้า
               </button>
               
               {Array.from({ length: totalPages }, (_, i) => i + 1)
                 .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                 .map((pageNum, idx, arr) => {
                   const prev = arr[idx - 1];
                   return (
                     <div key={pageNum} className="flex items-center">
                       {prev && pageNum - prev > 1 && (
                         <span className="px-1 text-white/30 text-xs font-bold">...</span>
                       )}
                       <button
                         onClick={() => setCurrentPage(pageNum)}
                         className={`h-8 w-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                           currentPage === pageNum
                             ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                             : 'border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                         }`}
                       >
                         {pageNum}
                       </button>
                     </div>
                   );
                 })}

               <button
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 disabled={currentPage === totalPages}
                 className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
               >
                 ถัดไป ›
               </button>
             </div>
           </div>
         )}

         {/* Prominent Bottom Action Bar Under Table */}
         <div className="p-6 bg-[#081026] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3 text-xs text-white/60">
             <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
             <span>สิ้นสุดตารางข้อมูลมิเตอร์ • พร้อมบันทึกรอบเดือนใหม่ถัดไป: <strong>{getNextMonthCycle(latestCycle)}</strong></span>
           </div>
           <div className="flex flex-wrap gap-3 w-full sm:w-auto">
             <button
               onClick={() => handleOpenNewMonthSingle()}
               className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
             >
               <span className="text-base">➕</span> จดมิเตอร์เดือนใหม่ ({getNextMonthCycle(latestCycle)})
             </button>
             <button
               onClick={() => handleOpenBatchModal(false)}
               className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30"
             >
               <span className="text-base">⚡</span> จดมิเตอร์ด่วนทุกห้อง ({getNextMonthCycle(latestCycle)})
             </button>
           </div>
         </div>
       </div>

       {/* Modal: Single Meter Entry */}
       {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
           <div className="bg-[#0F172A] rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-white/10 relative z-10 animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
               <div>
                 <h2 className="text-xl font-display font-black text-white">บันทึกมิเตอร์รอบเดือนใหม่</h2>
                 <p className="text-xs text-white/50 mt-0.5">ระบุเลขมิเตอร์ห้องพักรายบุคคล</p>
               </div>
               <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer p-1">
                 ✕
               </button>
             </div>

             <form onSubmit={handleSubmitSingle} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">เลือกรอบบิล (YYYY-MM)</label>
                 <input 
                   type="month" 
                   required 
                   value={form.billing_cycle} 
                   onChange={e => setForm({...form, billing_cycle: e.target.value})} 
                   className="w-full bg-[#1E293B] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">ห้องพัก</label>
                 <select 
                   required 
                   value={form.room_id} 
                   onChange={e => handleRoomSelectChange(e.target.value)} 
                   className="w-full bg-[#1E293B] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-bold outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="">-- เลือกห้องพัก --</option>
                   {rooms.map((room: any) => (
                     <option key={room.id} value={room.id}>ห้อง {room.room_number}</option>
                   ))}
                 </select>
               </div>
               
               <div>
                 <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">ประเภทมิเตอร์</label>
                 <div className="grid grid-cols-2 gap-2">
                   <button
                     type="button"
                     onClick={() => handleTypeSelectChange('Water')}
                     className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                       form.type === 'Water'
                         ? 'bg-blue-600 text-white shadow-md'
                         : 'bg-white/5 text-white/60 hover:bg-white/10'
                     }`}
                   >
                     💧 น้ำประปา
                   </button>
                   <button
                     type="button"
                     onClick={() => handleTypeSelectChange('Electricity')}
                     className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                       form.type === 'Electricity'
                         ? 'bg-orange-600 text-white shadow-md'
                         : 'bg-white/5 text-white/60 hover:bg-white/10'
                     }`}
                   >
                     ⚡ ไฟฟ้า
                   </button>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-2">
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">เลขครั้งก่อน</label>
                   <input 
                     type="number" 
                     step="0.01" 
                     value={form.previous_reading} 
                     onChange={e => setForm({...form, previous_reading: e.target.value})} 
                     className="w-full bg-[#1E293B] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono outline-none focus:ring-2 focus:ring-blue-500" 
                     placeholder="0" 
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">เลขครั้งนี้ (ใหม่)</label>
                   <input 
                     type="number" 
                     step="0.01" 
                     required 
                     value={form.current_reading} 
                     onChange={e => setForm({...form, current_reading: e.target.value})} 
                     className="w-full bg-[#1E293B] border-2 border-emerald-500/40 rounded-2xl px-4 py-3 text-sm text-emerald-400 font-mono font-black outline-none focus:ring-2 focus:ring-emerald-500" 
                     placeholder="0.00"
                   />
                 </div>
               </div>

               {form.current_reading && form.previous_reading && (
                 <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                   <span className="text-white/60">จำนวนหน่วยที่ใช้ในรอบนี้:</span>
                   <span className="font-mono font-black text-emerald-400 text-sm">
                     {Math.max(0, Number(form.current_reading) - Number(form.previous_reading))} ยูนิต
                   </span>
                 </div>
               )}

               <div className="flex gap-3 pt-4">
                 <button 
                   type="button" 
                   onClick={() => setShowModal(false)} 
                   className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold text-white/60"
                 >
                   ยกเลิก
                 </button>
                 <button 
                   type="submit" 
                   disabled={submitting} 
                   className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all font-bold text-xs text-white shadow-lg shadow-emerald-600/20"
                 >
                   {submitting ? 'กำลังบันทึก...' : 'บันทึกมิเตอร์'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Modal: Batch Quick Entry Sheet */}
       {showBatchModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBatchModal(false)}></div>
           <div className="bg-[#0F172A] rounded-[36px] p-8 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/10 relative z-10 animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10 shrink-0">
               <div>
                 <div className="flex items-center gap-3">
                   <h2 className="text-xl font-display font-black text-white">
                     ⚡ จดมิเตอร์ด่วนรอบเดือนใหม่ {selectedRoomIds.length > 0 ? `(เฉพาะ ${batchItems.length} ห้องที่เลือก)` : '(ทุกห้อง)'}
                   </h2>
                   <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                     รอบบิล {batchCycle}
                   </span>
                 </div>
                 <p className="text-xs text-white/50 mt-1">กรอกเลขมิเตอร์ครั้งนี้ของแต่ละห้อง ระบบจะดึงเลขครั้งก่อนให้อัตโนมัติ</p>
               </div>
               <button onClick={() => setShowBatchModal(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer p-1">
                 ✕
               </button>
             </div>

             <div className="mb-4 flex items-center gap-3 shrink-0">
               <label className="text-xs font-bold text-white/60">เลือกรอบบิล:</label>
               <input 
                 type="month" 
                 value={batchCycle} 
                 onChange={e => setBatchCycle(e.target.value)} 
                 className="bg-[#1E293B] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold outline-none"
               />
             </div>

             {/* Batch Table Sheet */}
             <div className="flex-1 overflow-y-auto border border-white/10 rounded-2xl">
               <table className="w-full text-left border-collapse text-xs">
                 <thead className="bg-[#1E293B] sticky top-0 z-10 text-white/60">
                   <tr className="border-b border-white/10">
                     <th className="py-3 px-4">ห้อง</th>
                     <th className="py-3 px-4 text-center">💧 เลขน้ำก่อนหน้า</th>
                     <th className="py-3 px-4 text-center">💧 เลขน้ำครั้งนี้ (ใหม่)</th>
                     <th className="py-3 px-4 text-center">⚡ เลขไฟก่อนหน้า</th>
                     <th className="py-3 px-4 text-center">⚡ เลขไฟครั้งนี้ (ใหม่)</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {batchItems.map((item, idx) => (
                     <tr key={item.room_id} className="hover:bg-white/5">
                       <td className="py-3 px-4 font-black text-white text-sm">
                         ห้อง {item.room_number}
                       </td>
                       <td className="py-3 px-4 text-center font-mono text-white/60">
                         {item.water_prev.toFixed(2)}
                       </td>
                       <td className="py-3 px-4 text-center">
                         <input 
                           type="number" 
                           step="0.01" 
                           placeholder={`${item.water_prev}`} 
                           value={item.water_curr}
                           onChange={e => {
                             const val = e.target.value;
                             setBatchItems(prev => {
                               const copy = [...prev];
                               copy[idx].water_curr = val;
                               return copy;
                             });
                           }}
                           className="w-28 bg-[#1E293B] border border-blue-500/40 rounded-lg px-2.5 py-1.5 text-center font-mono font-bold text-blue-300 outline-none focus:ring-2 focus:ring-blue-500"
                         />
                       </td>
                       <td className="py-3 px-4 text-center font-mono text-white/60">
                         {item.elec_prev.toFixed(2)}
                       </td>
                       <td className="py-3 px-4 text-center">
                         <input 
                           type="number" 
                           step="0.01" 
                           placeholder={`${item.elec_prev}`} 
                           value={item.elec_curr}
                           onChange={e => {
                             const val = e.target.value;
                             setBatchItems(prev => {
                               const copy = [...prev];
                               copy[idx].elec_curr = val;
                               return copy;
                             });
                           }}
                           className="w-28 bg-[#1E293B] border border-orange-500/40 rounded-lg px-2.5 py-1.5 text-center font-mono font-bold text-orange-300 outline-none focus:ring-2 focus:ring-orange-500"
                         />
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             <div className="flex gap-3 pt-6 shrink-0">
               <button 
                 type="button" 
                 onClick={() => setShowBatchModal(false)} 
                 className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold text-white/60 cursor-pointer"
               >
                 ยกเลิก
               </button>
               <button 
                 type="button"
                 onClick={handleSubmitBatch}
                 disabled={submitting} 
                 className="flex-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all font-bold text-xs text-white shadow-lg shadow-emerald-600/20 cursor-pointer"
               >
                 {submitting ? 'กำลังบันทึกข้อมูล...' : `บันทึกมิเตอร์รอบเดือน ${batchCycle} ทั้งหมด (${batchItems.length} ห้อง)`}
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
