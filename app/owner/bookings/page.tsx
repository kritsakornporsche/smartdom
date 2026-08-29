'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Booking {
  contract_id: number;
  tenant_id: number;
  room_id: number;
  start_date: string;
  end_date: string;
  deposit_amount: number;
  booking_status: string;
  slip_url: string | null;
  signature_data: string | null;
  owner_signature_data: string | null;
  booking_notes?: string | null;
  booking_created_at: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_number: string;
  room_type: string;
  floor: number;
  monthly_rent: number;
  room_status: string;
  dorm_id?: number;
  dorm_name?: string;
}

interface RoomOption {
  id: number;
  dorm_id: number;
  room_number: string;
  floor: number;
  room_type: string;
  price: number;
  status: string;
}

export default function OwnerBookingsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomOption[]>([]);
  const [dormsList, setDormsList] = useState<{ id: number; dorm_name: string }[]>([]);
  const [selectedDormFilter, setSelectedDormFilter] = useState<string>('ALL');
  const [dormId, setDormId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Active' | 'Cancelled' | 'All'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');

  // Modals state
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);
  const [previewSlipTitle, setPreviewSlipTitle] = useState<string>('');

  // 1. Approval Modal
  const [approvingBooking, setApprovingBooking] = useState<Booking | null>(null);
  const [approveForm, setApproveForm] = useState({
    createInitialBill: true,
    initialBillAmount: 0,
    customStartDate: '',
    customRoomId: 0
  });

  // 2. Reject Modal
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('สลิปไม่ถูกต้อง / ยอดเงินไม่ตรงตามที่กำหนด');
  const [customRejectNote, setCustomRejectNote] = useState('');

  // 3. Edit Modal
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({
    roomId: 0,
    startDate: '',
    endDate: '',
    depositAmount: 0,
    guestName: '',
    guestPhone: '',
    note: ''
  });

  // 4. Create Walk-in Booking Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    roomId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    depositAmount: 0,
    slipUrl: '',
    notes: '',
    autoApprove: true
  });

  // 5. Printable Receipt Modal
  const [printingBooking, setPrintingBooking] = useState<Booking | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async (dormParam?: string) => {
    setLoading(true);
    try {
      const email = session?.user?.email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null);
      const savedDb = typeof window !== 'undefined' ? localStorage.getItem('selectedDormDbName') : null;
      const targetDorm = dormParam !== undefined ? dormParam : (selectedDormFilter !== 'ALL' ? selectedDormFilter : (savedDb || ''));

      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (targetDorm && targetDorm !== 'ALL') params.append('dormId', targetDorm);

      const qs = params.toString();
      const res = await fetch(`/api/owner/bookings${qs ? `?${qs}` : ''}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data || []);
        setAvailableRooms(data.availableRooms || []);
        setDormsList(data.dorms || []);
        setDormId(data.selectedDormId || null);
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [authStatus, session]);

  const handleDormChange = (newDormVal: string) => {
    setSelectedDormFilter(newDormVal);
    fetchBookings(newDormVal);
  };

  // Handle Approve Submit
  const handleApproveSubmit = async () => {
    if (!approvingBooking) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          contractId: approvingBooking.contract_id,
          createInitialBill: approveForm.createInitialBill,
          initialBillAmount: approveForm.initialBillAmount || approvingBooking.monthly_rent,
          customStartDate: approveForm.customStartDate || approvingBooking.start_date,
          customRoomId: approveForm.customRoomId || approvingBooking.room_id
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('✓ อนุมัติการจองห้องพักเรียบร้อยแล้ว!');
        setApprovingBooking(null);
        fetchBookings();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reject Submit
  const handleRejectSubmit = async () => {
    if (!rejectingBooking) return;
    setSubmitting(true);
    try {
      const reasonText = customRejectNote ? `${rejectReason}: ${customRejectNote}` : rejectReason;
      const res = await fetch('/api/owner/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          contractId: rejectingBooking.contract_id,
          reason: reasonText
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('✕ ปฏิเสธการจองและคืนสถานะห้องว่างเรียบร้อยแล้ว');
        setRejectingBooking(null);
        fetchBookings();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการปฏิเสธ');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!editingBooking) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          contractId: editingBooking.contract_id,
          ...editForm
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('✓ บันทึกการแก้ไขข้อมูลเรียบร้อยแล้ว');
        setEditingBooking(null);
        fetchBookings();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการแก้ไข');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create Walk-in Booking Submit
  const handleCreateSubmit = async () => {
    if (!createForm.roomId || !createForm.guestName || !createForm.startDate) {
      alert('กรุณาเลือกห้องพัก ระบุชื่อผู้จอง และวันที่เริ่มสัญญา');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          dormId: dormId || 1,
          ...createForm
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setIsCreateModalOpen(false);
        setCreateForm({
          roomId: '',
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          depositAmount: 0,
          slipUrl: '',
          notes: '',
          autoApprove: true
        });
        fetchBookings();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการสร้างรายการจอง');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal Helper
  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setEditForm({
      roomId: booking.room_id,
      startDate: booking.start_date ? new Date(booking.start_date).toISOString().split('T')[0] : '',
      endDate: booking.end_date ? new Date(booking.end_date).toISOString().split('T')[0] : '',
      depositAmount: Number(booking.deposit_amount || 0),
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone || '',
      note: booking.booking_notes || ''
    });
  };

  // Open Approve Modal Helper
  const openApproveModal = (booking: Booking) => {
    setApprovingBooking(booking);
    setApproveForm({
      createInitialBill: true,
      initialBillAmount: Number(booking.monthly_rent || 0),
      customStartDate: booking.start_date ? new Date(booking.start_date).toISOString().split('T')[0] : '',
      customRoomId: booking.room_id
    });
  };

  // Stats Calculations
  const pendingCount = bookings.filter(b => b.booking_status === 'PendingOwnerSignature').length;
  const approvedCount = bookings.filter(b => b.booking_status === 'Active').length;
  const pendingDepositTotal = bookings
    .filter(b => b.booking_status === 'PendingOwnerSignature')
    .reduce((sum, b) => sum + Number(b.deposit_amount || 0), 0);
  const totalBookingsCount = bookings.length;

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Pending' && b.booking_status !== 'PendingOwnerSignature') return false;
    if (activeTab === 'Active' && b.booking_status !== 'Active') return false;
    if (activeTab === 'Cancelled' && b.booking_status !== 'Cancelled') return false;

    if (selectedFloor !== 'ALL' && String(b.floor) !== selectedFloor) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.guest_name.toLowerCase().includes(q);
      const matchRoom = b.room_number.toLowerCase().includes(q);
      const matchPhone = (b.guest_phone || '').includes(q);
      const matchEmail = (b.guest_email || '').toLowerCase().includes(q);
      return matchName || matchRoom || matchPhone || matchEmail;
    }

    return true;
  });

  const floors = Array.from(new Set(bookings.map(b => String(b.floor)).filter(Boolean))).sort();

  return (
    <div className="flex-1 w-full overflow-y-auto bg-background min-h-0 pb-32 sm:pb-16 -webkit-overflow-scrolling-touch">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 font-sans">
        
        {/* Header - iOS Compact layout on mobile */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2 sm:pt-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[11px] font-bold mb-2">
              <span>🛎️</span>
              <span>Guest Bookings Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">ศูนย์จัดการการจองห้องพัก</h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              ตรวจสอบสลิปเงินประกัน อนุมัติสัญญาเช่า ปรับเปลี่ยนห้องพัก และสร้างการจอง
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            
            {/* Dorm Selector Dropdown */}
            {dormsList.length > 1 && (
              <select
                value={selectedDormFilter}
                onChange={(e) => handleDormChange(e.target.value)}
                className="w-full sm:w-auto min-h-[44px] px-3.5 py-2.5 bg-slate-900 border border-white/20 text-amber-300 font-bold rounded-2xl text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="ALL">🏢 แสดงทุกหอพัก (All Dorms)</option>
                {dormsList.map(d => (
                  <option key={d.id} value={d.id}>🏢 {d.dorm_name}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-1 sm:flex-none min-h-[44px] px-4 sm:px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>➕</span>
              <span>เพิ่มจอง Walk-in</span>
            </button>
            <button
              onClick={() => fetchBookings()}
              className="min-h-[44px] px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="รีเฟรชข้อมูล"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Touch friendly Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div 
            onClick={() => setActiveTab('Pending')}
            className={cn(
              "p-4 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] border shadow-lg relative overflow-hidden cursor-pointer transition-all active:scale-98 group",
              activeTab === 'Pending' ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20" : "bg-[#0F172A] border-amber-500/30 hover:border-amber-500"
            )}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">รอดำเนินการ</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-4xl font-black text-amber-300">{pendingCount}</span>
              <span className="text-[10px] sm:text-xs text-white/50">รายการ</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-amber-400/80 mt-1 sm:mt-2 font-medium truncate">คลิกเพื่อตรวจสลิป →</p>
          </div>

          <div className="bg-[#0F172A] p-4 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] border border-emerald-500/30 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">เงินประกันรอตรวจ</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-3xl font-black text-emerald-400 truncate">฿{pendingDepositTotal.toLocaleString()}</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-white/40 mt-1 sm:mt-2 font-medium truncate">1 เดือน (PromptPay)</p>
          </div>

          <div 
            onClick={() => setActiveTab('Active')}
            className={cn(
              "p-4 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] border shadow-lg cursor-pointer transition-all active:scale-98",
              activeTab === 'Active' ? "bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20" : "bg-[#0F172A] border-white/10 hover:border-emerald-500/40"
            )}
          >
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1">อนุมัติแล้ว</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-4xl font-black text-white">{approvedCount}</span>
              <span className="text-[10px] sm:text-xs text-white/50">สัญญา</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-white/40 mt-1 sm:mt-2 font-medium truncate">สัญญาใช้งานอยู่</p>
          </div>

          <div 
            onClick={() => setActiveTab('All')}
            className={cn(
              "p-4 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] border shadow-lg cursor-pointer transition-all active:scale-98",
              activeTab === 'All' ? "bg-slate-800/80 border-white/40 ring-2 ring-white/10" : "bg-[#0F172A] border-white/10 hover:border-white/30"
            )}
          >
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1">ทั้งหมด</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-4xl font-black text-white">{totalBookingsCount}</span>
              <span className="text-[10px] sm:text-xs text-white/50">รายการ</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-white/40 mt-1 sm:mt-2 font-medium truncate">ประวัติทั้งหมด</p>
          </div>
        </div>

        {/* Segmented Control & Filter Bar (iOS Style) */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 bg-[#0F172A] p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10">
          
          {/* iOS Segmented Tabs with horizontal scrolling */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('Pending')}
              className={cn(
                "min-h-[40px] px-3.5 sm:px-5 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === 'Pending'
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              ⏳ รอดำเนินการ ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('Active')}
              className={cn(
                "min-h-[40px] px-3.5 sm:px-5 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === 'Active'
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              ✓ อนุมัติแล้ว ({approvedCount})
            </button>
            <button
              onClick={() => setActiveTab('Cancelled')}
              className={cn(
                "min-h-[40px] px-3.5 sm:px-5 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === 'Cancelled'
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              ✕ ยกเลิก
            </button>
            <button
              onClick={() => setActiveTab('All')}
              className={cn(
                "min-h-[40px] px-3.5 sm:px-5 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === 'All'
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              ทั้งหมด ({totalBookingsCount})
            </button>
          </div>

          {/* Floor Filter & Search */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {floors.length > 0 && (
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="min-h-[42px] px-3 py-2 bg-slate-900 border border-white/10 rounded-xl sm:rounded-2xl text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="ALL">ทุกชั้น</option>
                {floors.map(f => (
                  <option key={f} value={f}>ชั้น {f}</option>
                ))}
              </select>
            )}

            <div className="relative flex-1 min-w-[180px]">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, ห้อง, เบอร์โทร..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[42px] pl-8 pr-3 py-2 bg-slate-900 border border-white/10 rounded-xl sm:rounded-2xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 text-xs">🔍</span>
            </div>
          </div>

        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-[#0F172A] border-2 border-dashed border-white/10 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-2xl mx-auto text-white/40">
              🛎️
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">ไม่พบรายการจองห้องพักในหมวดนี้</h3>
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              {activeTab === 'Pending' 
                ? 'ขณะนี้ไม่มีคำขอจองห้องพักที่รอดำเนินการ (ลองเลือกแท็บ "ทั้งหมด" เพื่อดูประวัติการจอง)' 
                : 'ลองเปลี่ยนตัวกรองเพื่อตรวจสอบประวัติการจองอื่นๆ'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {filteredBookings.map((booking) => {
              const isPending = booking.booking_status === 'PendingOwnerSignature';
              const isActive = booking.booking_status === 'Active';
              const isCancelled = booking.booking_status === 'Cancelled';

              return (
                <div 
                  key={booking.contract_id}
                  className={cn(
                    "bg-[#0F172A] rounded-[2rem] border p-5 sm:p-8 transition-all space-y-5 shadow-xl",
                    isPending ? "border-amber-500/40 bg-gradient-to-br from-[#0F172A] via-slate-900 to-amber-950/20" :
                    isActive ? "border-emerald-500/20" :
                    "border-white/10 opacity-75"
                  )}
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-start sm:items-center gap-3 pb-3 sm:pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-lg sm:text-xl font-bold shrink-0">
                        🚪
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="text-xl sm:text-2xl font-black text-white">ห้อง {booking.room_number}</h3>
                          <span className="text-[11px] sm:text-xs text-white/50 font-normal">({booking.room_type || 'Standard'} • ชั้น {booking.floor || 1})</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-white/40">
                          {booking.dorm_name ? `${booking.dorm_name} • ` : ''}จองเมื่อ: {booking.booking_created_at ? new Date(booking.booking_created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn(
                        "px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border flex items-center gap-1.5",
                        isPending ? "bg-amber-500/15 border-amber-500/30 text-amber-300" :
                        isActive ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                        "bg-rose-500/15 border-rose-500/30 text-rose-400"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                          isPending ? "bg-amber-400 animate-pulse" :
                          isActive ? "bg-emerald-400" :
                          "bg-rose-400"
                        )} />
                        {isPending ? 'รอตรวจสลิป' :
                         isActive ? 'อนุมัติแล้ว' :
                         'ยกเลิก'}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    
                    {/* Guest Info */}
                    <div className="space-y-1.5 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">ข้อมูลผู้จอง</span>
                        <button
                          onClick={() => openEditModal(booking)}
                          className="text-[10px] text-white/40 hover:text-white underline cursor-pointer p-1"
                        >
                          ✏️ แก้ไข
                        </button>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-white">คุณ{booking.guest_name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-white/70 font-mono">📱 {booking.guest_phone || '-'}</p>
                        {booking.guest_phone && (
                          <a 
                            href={`tel:${booking.guest_phone}`} 
                            className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-bold"
                          >
                            📞 โทรออก
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-white/40 font-mono truncate">✉️ {booking.guest_email || '-'}</p>
                      {booking.booking_notes && (
                        <p className="text-[11px] text-amber-300/80 italic pt-1 border-t border-white/5">
                          📝 {booking.booking_notes}
                        </p>
                      )}
                    </div>

                    {/* Financial & Contract Info */}
                    <div className="space-y-1 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">ยอดเงินและสัญญา</span>
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="text-xs text-white/60">เงินประกัน (1 เดือน):</span>
                        <span className="text-lg sm:text-xl font-black text-emerald-400">฿{Number(booking.deposit_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs text-white/60">
                        <span>ค่าเช่ารายเดือน:</span>
                        <span className="text-white font-bold">฿{Number(booking.monthly_rent || 0).toLocaleString()} /ด.</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-white/40 pt-1">
                        เริ่ม: {new Date(booking.start_date).toLocaleDateString('th-TH')} — {new Date(booking.end_date).toLocaleDateString('th-TH')}
                      </p>
                    </div>

                    {/* Slip Preview Box */}
                    <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">สลิปโอนเงิน PromptPay</span>
                        {booking.slip_url ? (
                          <div>
                            <p className="text-xs font-bold text-emerald-400">✓ แนบสลิปแล้ว</p>
                            <p className="text-[10px] text-white/40">แตะรูปเพื่อขยายตรวจสอบ</p>
                          </div>
                        ) : (
                          <p className="text-xs text-white/40">ไม่มีสลิปแนบ</p>
                        )}
                      </div>

                      {booking.slip_url && (
                        <div 
                          onClick={() => {
                            setPreviewSlipUrl(booking.slip_url);
                            setPreviewSlipTitle(`สลิปห้อง ${booking.room_number} (คุณ${booking.guest_name})`);
                          }}
                          className="w-14 h-18 sm:w-16 sm:h-20 rounded-xl overflow-hidden bg-black border border-white/20 relative cursor-pointer group shadow-lg shrink-0 active:scale-95 transition-transform"
                        >
                          <img src={booking.slip_url} alt="Slip" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[9px] font-bold">
                            🔍 ขยาย
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Management Action Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-3 border-t border-white/10">
                    
                    {/* Quick Links */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/owner/contracts/${booking.contract_id}`}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 py-1"
                      >
                        <span>📄 สัญญาฉบับเต็ม</span>
                        <span>→</span>
                      </Link>

                      <button
                        onClick={() => setPrintingBooking(booking)}
                        className="text-xs font-bold text-white/70 hover:text-white flex items-center gap-1 cursor-pointer py-1"
                      >
                        <span>🖨️</span>
                        <span>พิมพ์ใบรับเงิน</span>
                      </button>

                      <Link
                        href="/owner/chat"
                        className="text-xs font-bold text-white/70 hover:text-white flex items-center gap-1 py-1"
                      >
                        <span>💬 แชท</span>
                      </Link>

                      <button
                        onClick={() => openEditModal(booking)}
                        className="text-xs font-bold text-white/50 hover:text-white flex items-center gap-1 cursor-pointer py-1"
                      >
                        <span>⚙️ จัดการ</span>
                      </button>
                    </div>

                    {/* Primary Action Buttons (Mobile Full Width Stack) */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0">
                      {isPending && (
                        <>
                          <button
                            onClick={() => {
                              setRejectingBooking(booking);
                              setRejectReason('สลิปไม่ถูกต้อง / ยอดเงินไม่ตรงตามที่กำหนด');
                              setCustomRejectNote('');
                            }}
                            className="flex-1 sm:flex-none min-h-[44px] px-3.5 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                          >
                            ✕ ปฏิเสธ
                          </button>
                          <button
                            onClick={() => openApproveModal(booking)}
                            className="flex-[2] sm:flex-none min-h-[44px] px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
                          >
                            ✓ ตรวจสอบ & อนุมัติ
                          </button>
                        </>
                      )}

                      {isActive && (
                        <span className="w-full sm:w-auto text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20">
                          ✓ สัญญาใช้งานอยู่
                        </span>
                      )}

                      {isCancelled && (
                        <span className="w-full sm:w-auto text-center text-xs font-bold text-rose-400 bg-rose-500/10 px-4 py-2.5 rounded-xl border border-rose-500/20">
                          ยกเลิกแล้ว
                        </span>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. APPROVAL MODAL (อนุมัติการจองพร้อมตัวเลือกออกบิล) */}
        {/* ========================================================================= */}
        {approvingBooking && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="max-w-xl w-full bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-emerald-500/40 space-y-5 shadow-2xl my-auto max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">อนุมัติการจองห้องพัก</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">ห้อง {approvingBooking.room_number}</h3>
                  <p className="text-xs text-white/50">ผู้จอง: คุณ{approvingBooking.guest_name}</p>
                </div>
                <button onClick={() => setApprovingBooking(null)} className="text-white/50 hover:text-white text-2xl p-2 -mr-2">✕</button>
              </div>

              {/* Slip Quick Preview in Approval */}
              {approvingBooking.slip_url && (
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-white/50 uppercase">สลิปเงินประกัน</span>
                    <p className="text-sm font-bold text-emerald-400">฿{Number(approvingBooking.deposit_amount).toLocaleString()} (1 เดือน)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewSlipUrl(approvingBooking.slip_url);
                      setPreviewSlipTitle(`สลิปห้อง ${approvingBooking.room_number}`);
                    }}
                    className="min-h-[38px] px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    🔍 ดูรูปสลิป
                  </button>
                </div>
              )}

              {/* Options */}
              <div className="space-y-4 text-xs">
                
                {/* Change Room if needed */}
                <div className="space-y-1.5">
                  <label className="text-white/70 font-bold uppercase tracking-wider block">กำหนดห้องพัก</label>
                  <select
                    value={approveForm.customRoomId}
                    onChange={(e) => setApproveForm({ ...approveForm, customRoomId: Number(e.target.value) })}
                    className="w-full min-h-[46px] px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                  >
                    <option value={approvingBooking.room_id}>ห้อง {approvingBooking.room_number} (ห้องเดิมที่จอง)</option>
                    {availableRooms
                      .filter(r => r.id !== approvingBooking.room_id && r.status === 'Available')
                      .map(r => (
                        <option key={r.id} value={r.id}>ย้ายไปห้อง {r.room_number} (ชั้น {r.floor} • ฿{Number(r.price).toLocaleString()})</option>
                      ))}
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="text-white/70 font-bold uppercase tracking-wider block">วันที่เริ่มสัญญา / วันที่เข้าพัก</label>
                  <input
                    type="date"
                    value={approveForm.customStartDate}
                    onChange={(e) => setApproveForm({ ...approveForm, customStartDate: e.target.value })}
                    className="w-full min-h-[46px] px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                  />
                </div>

                {/* Initial Invoice Option */}
                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/10 space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={approveForm.createInitialBill}
                      onChange={(e) => setApproveForm({ ...approveForm, createInitialBill: e.target.checked })}
                      className="w-5 h-5 rounded accent-primary cursor-pointer shrink-0"
                    />
                    <span className="font-bold text-white text-xs">
                      ออกใบแจ้งหนี้ค่าเช่าเดือนแรกทันที (฿{Number(approvingBooking.monthly_rent).toLocaleString()})
                    </span>
                  </label>
                  <p className="text-[11px] text-white/40 pl-8 leading-relaxed">
                    ระบบจะสร้างบิลค่าเช่าเดือนแรกให้ผู้เช่าอัตโนมัติ โดยผู้เช่าสามารถชำระเมื่อเข้าพักจริง
                  </p>
                </div>

              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovingBooking(null)}
                  className="flex-1 min-h-[46px] py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleApproveSubmit}
                  disabled={submitting}
                  className="flex-[2] min-h-[46px] py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xs font-black transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'กำลังดำเนินการ...' : '✓ ยืนยันการอนุมัติ'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. REJECTION MODAL (ปฏิเสธคำขอจอง) */}
        {/* ========================================================================= */}
        {rejectingBooking && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="max-w-md w-full bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-rose-500/40 space-y-5 shadow-2xl my-auto max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">ปฏิเสธคำขอจองห้องพัก</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">ห้อง {rejectingBooking.room_number}</h3>
                </div>
                <button onClick={() => setRejectingBooking(null)} className="text-white/50 hover:text-white text-2xl p-2 -mr-2">✕</button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-white/70 font-bold uppercase tracking-wider block">เหตุผลการปฏิเสธ</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full min-h-[46px] px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                  >
                    <option value="สลิปไม่ถูกต้อง / ยอดเงินไม่ตรงตามที่กำหนด">สลิปไม่ถูกต้อง / ยอดเงินไม่ตรงตามที่กำหนด</option>
                    <option value="ห้องพักปิดปรับปรุง / จองซ้อน">ห้องพักปิดปรับปรุง / จองซ้อน</option>
                    <option value="ข้อมูลผู้จองไม่ชัดเจนหรือไม่สามารถติดต่อได้">ข้อมูลผู้จองไม่ชัดเจนหรือไม่สามารถติดต่อได้</option>
                    <option value="ผู้จองขอยกเลิกเอง">ผู้จองขอยกเลิกเอง</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/70 font-bold uppercase tracking-wider block">หมายเหตุเพิ่มเติม / ข้อความถึงผู้จอง</label>
                  <textarea
                    rows={3}
                    value={customRejectNote}
                    onChange={(e) => setCustomRejectNote(e.target.value)}
                    placeholder="เช่น กรุณาติดต่อ 08X-XXX-XXXX เพื่อรับเงินคืน..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm resize-none"
                  />
                </div>

                <p className="text-[11px] text-amber-300/80 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  ⚠️ เมื่อกดยืนยัน ห้อง {rejectingBooking.room_number} จะกลับสู่สถานะ "ว่าง (Available)" ทันที
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingBooking(null)}
                  className="flex-1 min-h-[46px] py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  disabled={submitting}
                  className="flex-1 min-h-[46px] py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'กำลังส่ง...' : '✕ ยืนยันปฏิเสธ'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. EDIT BOOKING MODAL (แก้ไขข้อมูลการจอง) */}
        {/* ========================================================================= */}
        {editingBooking && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="max-w-lg w-full bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-white/20 space-y-5 shadow-2xl my-auto max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">แก้ไขข้อมูลการจอง</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">ห้อง {editingBooking.room_number}</h3>
                </div>
                <button onClick={() => setEditingBooking(null)} className="text-white/50 hover:text-white text-2xl p-2 -mr-2">✕</button>
              </div>

              <div className="space-y-3.5 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-white/60 font-bold block">ชื่อผู้จอง</label>
                    <input
                      type="text"
                      value={editForm.guestName}
                      onChange={(e) => setEditForm({ ...editForm, guestName: e.target.value })}
                      className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/60 font-bold block">เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      value={editForm.guestPhone}
                      onChange={(e) => setEditForm({ ...editForm, guestPhone: e.target.value })}
                      className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                    />
                  </div>
                </div>

                {/* Room Assignment */}
                <div className="space-y-1">
                  <label className="text-white/60 font-bold block">ย้ายห้องพัก</label>
                  <select
                    value={editForm.roomId}
                    onChange={(e) => setEditForm({ ...editForm, roomId: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                  >
                    <option value={editingBooking.room_id}>ห้อง {editingBooking.room_number} (ห้องเดิม)</option>
                    {availableRooms
                      .filter(r => r.id !== editingBooking.room_id && r.status === 'Available')
                      .map(r => (
                        <option key={r.id} value={r.id}>ห้อง {r.room_number} (ชั้น {r.floor} • ฿{Number(r.price).toLocaleString()})</option>
                      ))}
                  </select>
                </div>

                {/* Contract Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-white/60 font-bold block">วันเริ่มสัญญา</label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/60 font-bold block">วันสิ้นสุดสัญญา</label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>

                {/* Deposit */}
                <div className="space-y-1">
                  <label className="text-white/60 font-bold block">ยอดเงินประกัน (฿)</label>
                  <input
                    type="number"
                    value={editForm.depositAmount}
                    onChange={(e) => setEditForm({ ...editForm, depositAmount: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-white/60 font-bold block">บันทึกช่วยจำ (Owner Note)</label>
                  <textarea
                    rows={2}
                    value={editForm.note}
                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                    placeholder="บันทึกข้อความพิเศษ..."
                    className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm resize-none"
                  />
                </div>

              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="flex-1 min-h-[46px] py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  disabled={submitting}
                  className="flex-1 min-h-[46px] py-3 bg-primary text-white rounded-2xl text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'กำลังบันทึก...' : '✓ บันทึก'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CREATE WALK-IN BOOKING MODAL (เพิ่มการจองด้วยตนเอง) */}
        {/* ========================================================================= */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="max-w-lg w-full bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-primary/40 space-y-5 shadow-2xl my-auto max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">เพิ่มการจองใหม่</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">บันทึกการจอง Walk-in</h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-white/50 hover:text-white text-2xl p-2 -mr-2">✕</button>
              </div>

              <div className="space-y-3.5 text-xs">
                
                {/* Room Selection */}
                <div className="space-y-1">
                  <label className="text-white/70 font-bold block">เลือกห้องพัก <span className="text-rose-500">*</span></label>
                  <select
                    value={createForm.roomId}
                    onChange={(e) => {
                      const rId = e.target.value;
                      const found = availableRooms.find(r => String(r.id) === rId);
                      setCreateForm({
                        ...createForm,
                        roomId: rId,
                        depositAmount: found ? Number(found.price) : 0
                      });
                    }}
                    className="w-full min-h-[46px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                  >
                    <option value="">-- เลือกห้องพักที่ว่าง --</option>
                    {availableRooms
                      .filter(r => r.status === 'Available')
                      .map(r => (
                        <option key={r.id} value={r.id}>
                          ห้อง {r.room_number} (ชั้น {r.floor} • ฿{Number(r.price).toLocaleString()} /ด.)
                        </option>
                      ))}
                  </select>
                </div>

                {/* Guest Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-white/70 font-bold block">ชื่อผู้จอง <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      placeholder="เช่น สมชาย ใจดี"
                      value={createForm.guestName}
                      onChange={(e) => setCreateForm({ ...createForm, guestName: e.target.value })}
                      className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/70 font-bold block">เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      placeholder="08X-XXX-XXXX"
                      value={createForm.guestPhone}
                      onChange={(e) => setCreateForm({ ...createForm, guestPhone: e.target.value })}
                      className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-white/70 font-bold block">อีเมล (ถ้ามี)</label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={createForm.guestEmail}
                    onChange={(e) => setCreateForm({ ...createForm, guestEmail: e.target.value })}
                    className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono text-sm"
                  />
                </div>

                {/* Contract Date & Deposit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-white/70 font-bold block">วันที่เริ่มสัญญา</label>
                    <input
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                      className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/70 font-bold block">เงินประกัน 1 เดือน (฿)</label>
                    <input
                      type="number"
                      value={createForm.depositAmount}
                      onChange={(e) => setCreateForm({ ...createForm, depositAmount: Number(e.target.value) })}
                      className="w-full min-h-[44px] px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-bold text-sm"
                    />
                  </div>
                </div>

                {/* Auto Approve Option */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-white/10 space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={createForm.autoApprove}
                      onChange={(e) => setCreateForm({ ...createForm, autoApprove: e.target.checked })}
                      className="w-5 h-5 rounded accent-primary cursor-pointer shrink-0"
                    />
                    <span className="font-bold text-white text-xs">
                      อนุมัติสัญญาและเปิดให้เข้าพักทันที (Active)
                    </span>
                  </label>
                  <p className="text-[11px] text-white/40 pl-8">
                    {createForm.autoApprove 
                      ? 'ห้องพักจะเปลี่ยนเป็น "ไม่ว่าง (Occupied)" ทันที' 
                      : 'ห้องพักจะถูกล็อกเป็น "จองแล้ว (Reserved)" รอการอนุมัติ'}
                  </p>
                </div>

              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 min-h-[46px] py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  disabled={submitting}
                  className="flex-1 min-h-[46px] py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-black transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'กำลังบันทึก...' : '✓ บันทึกการจอง'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. PRINTABLE RECEIPT MODAL (พิมพ์ใบรับเงินจอง / สัญญาจอง) */}
        {/* ========================================================================= */}
        {printingBooking && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="max-w-2xl w-full bg-white text-slate-900 rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-10 space-y-5 shadow-2xl my-auto max-h-[92dvh] overflow-y-auto print:m-0 print:p-6" onClick={(e) => e.stopPropagation()}>
              
              {/* Printable Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 sm:pb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    {printingBooking.dorm_name || 'SmartDom Dormitory'}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">ใบรับเงินมัดจำการจองห้องพัก (Booking Deposit Receipt)</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">เลขที่เอกสาร</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-slate-900">BK-{String(printingBooking.contract_id).padStart(5, '0')}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    วันที่: {new Date().toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>

              {/* Receipt Content */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">ชื่อผู้จองห้องพัก</span>
                    <span className="text-sm font-bold text-slate-900">คุณ{printingBooking.guest_name}</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">เบอร์โทร: {printingBooking.guest_phone || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">ห้องพักที่จอง</span>
                    <span className="text-sm font-bold text-slate-900">ห้อง {printingBooking.room_number} (ชั้น {printingBooking.floor})</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">ประเภท: {printingBooking.room_type || 'Standard'}</p>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700">
                    <tr>
                      <th className="p-2.5 sm:p-3">รายการ</th>
                      <th className="p-2.5 sm:p-3 text-right">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 sm:p-3">
                        <p className="font-bold">เงินประกันสัญญาเช่าห้องพัก (1 เดือน)</p>
                        <p className="text-[10px] text-slate-500">
                          สำหรับห้องพัก {printingBooking.room_number} (เริ่มสัญญา: {new Date(printingBooking.start_date).toLocaleDateString('th-TH')})
                        </p>
                      </td>
                      <td className="p-2.5 sm:p-3 text-right font-bold text-sm">
                        ฿{Number(printingBooking.deposit_amount).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-xs sm:text-sm">
                      <td className="p-2.5 sm:p-3 text-right">ยอดรวมทั้งสิ้น (ชำระแล้ว):</td>
                      <td className="p-2.5 sm:p-3 text-right text-emerald-700">
                        ฿{Number(printingBooking.deposit_amount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                  💡 <strong>เงื่อนไข:</strong> ใบรับเงินนี้ใช้เป็นหลักฐานการชำระเงินประกันสัญญา 1 เดือน เพื่อยืนยันสิทธิ์การเข้าพัก สำหรับค่าเช่ารายเดือนจะคิดคำนวณและเรียกเก็บเมื่อเข้าพักจริง
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-4 sm:gap-8 pt-6 sm:pt-8 text-center text-xs">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="border-b border-slate-300 w-full sm:w-3/4 mx-auto pb-1 font-bold text-xs sm:text-sm">
                      คุณ{printingBooking.guest_name}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">ผู้จองห้องพัก</p>
                  </div>
                  <div className="space-y-6 sm:space-y-8">
                    <div className="border-b border-slate-300 w-full sm:w-3/4 mx-auto pb-1 font-bold text-emerald-700 text-xs sm:text-sm">
                      SmartDom Management
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">ผู้รับเงิน / ผู้จัดการหอพัก</p>
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="flex gap-2.5 pt-4 border-t border-slate-200 print:hidden">
                <button
                  onClick={() => setPrintingBooking(null)}
                  className="flex-1 min-h-[44px] py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  ปิด
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 min-h-[44px] py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  🖨️ พิมพ์ / บันทึก PDF
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Slip Modal Preview */}
        {previewSlipUrl && (
          <div 
            onClick={() => setPreviewSlipUrl(null)}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 cursor-pointer animate-in fade-in duration-200"
          >
            <div className="max-w-md w-full bg-slate-900 rounded-3xl p-5 sm:p-6 border border-white/20 space-y-4 my-auto max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="font-bold text-white text-sm truncate">{previewSlipTitle || 'สลิปการโอนเงิน'}</span>
                <button onClick={() => setPreviewSlipUrl(null)} className="text-white/50 hover:text-white text-xl font-bold p-1">✕</button>
              </div>
              <div className="rounded-2xl overflow-hidden max-h-[60vh] flex items-center justify-center bg-black">
                <img src={previewSlipUrl} alt="Full Slip" className="max-h-[58vh] w-auto object-contain rounded-xl" />
              </div>
              <button 
                onClick={() => setPreviewSlipUrl(null)} 
                className="w-full min-h-[44px] py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
