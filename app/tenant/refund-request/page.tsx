'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PendingBooking {
  contract_id: number;
  deposit_amount: number;
  start_date: string;
  booking_created_at: string;
  tenant_id: number;
  tenant_name: string;
  room_id: number;
  room_number: string;
  room_type: string;
  floor: number;
  dorm_id: number;
  dorm_name: string;
  dorm_address: string;
}

interface RefundRequest {
  id: number;
  contract_id: number;
  deposit_amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  owner_note: string | null;
  refund_slip_url: string | null;
  created_at: string;
  updated_at: string;
  room_number: string;
  dorm_name: string;
}

const STATUS_CONFIG = {
  pending:  { label: 'รอดำเนินการ',  bg: 'bg-amber-500/15 border-amber-500/30',  text: 'text-amber-400',  dot: 'bg-amber-400 animate-pulse', icon: '⏳' },
  approved: { label: 'อนุมัติแล้ว',   bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400', icon: '✓' },
  rejected: { label: 'ไม่อนุมัติ',    bg: 'bg-rose-500/15 border-rose-500/30',   text: 'text-rose-400',   dot: 'bg-rose-400',   icon: '✕' },
};

export default function TenantRefundRequestPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [existingPendingRequest, setExistingPendingRequest] = useState<RefundRequest | null>(null);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/refund-request');
      const data = await res.json();
      if (data.success) {
        setPendingBooking(data.pendingBooking || null);
        setRefundRequests(data.refundRequests || []);
        setExistingPendingRequest(data.existingPendingRequest || null);
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/signin');
    } else if (authStatus === 'authenticated') {
      fetchData();
    }
  }, [authStatus]);

  const handleSubmit = async () => {
    if (!pendingBooking) return;
    if (!confirmed) {
      showToast('กรุณายืนยันว่าต้องการขอคืนเงินมัดจำ', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/tenant/refund-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: pendingBooking.contract_id,
          reason: reason || 'ต้องการยกเลิกการจองและขอคืนเงินมัดจำ',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setReason('');
        setConfirmed(false);
        await fetchData();
      } else {
        showToast(data.message || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการส่งคำร้อง', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto pb-24 space-y-8 animate-in fade-in duration-500">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-right duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-900/90 border-rose-500/50 text-rose-200'
        }`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/tenant" className="hover:text-foreground transition-colors">หน้าหลัก</Link>
          <span>/</span>
          <span className="text-foreground font-medium">คำร้องขอคืนเงินมัดจำ</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl">
            💰
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">คำร้องขอคืนเงินมัดจำ</h1>
            <p className="text-sm text-muted-foreground">ยื่นคำร้องสำหรับการจองที่ยังไม่ได้รับการอนุมัติ</p>
          </div>
        </div>
      </div>

      {/* ── SECTION A: ฟอร์มยื่นคำร้อง ── */}
      {pendingBooking ? (
        <section className="bg-card rounded-[2rem] border border-border shadow-lg overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-6 pb-4 border-b border-border bg-amber-500/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">การจองที่รออนุมัติ</p>
                <h2 className="text-xl font-black text-foreground">
                  ห้อง {pendingBooking.room_number}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({pendingBooking.room_type})</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">{pendingBooking.dorm_name} • ชั้น {pendingBooking.floor}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground mb-1">เงินมัดจำที่ชำระ</p>
                <p className="text-2xl font-black text-amber-500">
                  ฿{Number(pendingBooking.deposit_amount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Booking meta */}
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-border">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">หอพัก</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{pendingBooking.dorm_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">วันที่จอง</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {new Date(pendingBooking.booking_created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">กำหนดเริ่มสัญญา</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {new Date(pendingBooking.start_date).toLocaleDateString('th-TH')}
              </p>
            </div>
          </div>

          {/* Form or existing request */}
          <div className="px-6 py-6 space-y-5">
            {existingPendingRequest ? (
              /* Already submitted */
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-2xl mt-0.5">⏳</span>
                <div>
                  <p className="font-bold text-amber-400 text-sm">คำร้องของคุณอยู่ระหว่างการพิจารณา</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ยื่นเมื่อ {new Date(existingPendingRequest.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    เหตุผล: {existingPendingRequest.reason}
                  </p>
                  <p className="text-xs text-amber-400 font-semibold mt-2">กรุณารอเจ้าของหอพักดำเนินการ</p>
                </div>
              </div>
            ) : (
              /* Refund form */
              <>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2" htmlFor="refund-reason">
                    เหตุผลที่ขอคืนเงินมัดจำ <span className="text-muted-foreground font-normal">(ไม่บังคับ)</span>
                  </label>
                  <textarea
                    id="refund-reason"
                    rows={3}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="เช่น เปลี่ยนแผน / ไม่สะดวกย้ายเข้า / เหตุสุดวิสัย..."
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/50 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-muted-foreground transition-all"
                  />
                </div>

                {/* Warning notice */}
                <div className="flex gap-3 p-4 rounded-2xl bg-rose-500/8 border border-rose-500/20">
                  <span className="text-lg shrink-0">⚠️</span>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-bold text-rose-400">โปรดอ่านก่อนยื่นคำร้อง</p>
                    <p>• การยื่นคำร้องไม่ได้หมายความว่าได้รับเงินคืนทันที เจ้าของหอพักต้องอนุมัติก่อน</p>
                    <p>• หากได้รับการอนุมัติ สัญญาการจองจะถูกยกเลิกโดยอัตโนมัติ</p>
                    <p>• เจ้าของหอพักอาจปฏิเสธคำร้องได้ตามดุลยพินิจ</p>
                  </div>
                </div>

                {/* Confirmation checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group" htmlFor="confirm-refund">
                  <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${confirmed ? 'bg-amber-500 border-amber-500' : 'border-border group-hover:border-amber-400'}`}>
                    {confirmed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input id="confirm-refund" type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="sr-only" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                    ฉันเข้าใจเงื่อนไขและยืนยันว่าต้องการ<strong className="text-foreground"> ยกเลิกการจองและขอคืนเงินมัดจำ ฿{Number(pendingBooking.deposit_amount).toLocaleString()}</strong> จากหอพัก {pendingBooking.dorm_name}
                  </span>
                </label>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !confirmed}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:bg-secondary disabled:text-muted-foreground text-slate-900 font-bold text-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      <span>กำลังส่งคำร้อง...</span>
                    </>
                  ) : (
                    <>
                      <span>💰</span>
                      <span>ยื่นคำร้องขอคืนเงินมัดจำ</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </section>
      ) : (
        /* No pending booking */
        <section className="bg-card rounded-[2rem] border border-border p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center text-3xl mx-auto">🔍</div>
          <div>
            <h2 className="text-lg font-bold text-foreground">ไม่พบการจองที่รอการอนุมัติ</h2>
            <p className="text-sm text-muted-foreground mt-1">
              ระบบจะอนุญาตให้ขอคืนเงินมัดจำเฉพาะการจองที่ยังไม่ได้รับการอนุมัติเท่านั้น
            </p>
          </div>
          <Link
            href="/tenant"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-sm transition-all border border-border"
          >
            ← กลับหน้าหลัก
          </Link>
        </section>
      )}

      {/* ── SECTION B: ประวัติคำร้องทั้งหมด ── */}
      {refundRequests.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <span>📋</span>
            <span>ประวัติคำร้องคืนเงินมัดจำ</span>
          </h2>
          <div className="space-y-3">
            {refundRequests.map((req) => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
              return (
                <div key={req.id} className="bg-card rounded-2xl border border-border p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-foreground">ห้อง {req.room_number} — {req.dorm_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ยื่นเมื่อ {new Date(req.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">จำนวนเงินที่ขอคืน</span>
                    <span className="font-black text-amber-500">฿{Number(req.deposit_amount).toLocaleString()}</span>
                  </div>

                  {req.reason && (
                    <div className="text-xs text-muted-foreground bg-secondary/50 rounded-xl px-3 py-2">
                      <span className="font-semibold text-foreground">เหตุผล: </span>{req.reason}
                    </div>
                  )}

                  {req.owner_note && (
                    <div className={`text-xs rounded-xl px-3 py-2 ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                      <span className="font-semibold">หมายเหตุจากเจ้าของหอ: </span>{req.owner_note}
                    </div>
                  )}

                  {req.refund_slip_url && (
                    <a
                      href={req.refund_slip_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      📎 ดูหลักฐานการโอนเงิน
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
