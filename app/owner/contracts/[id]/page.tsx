'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ContractDetail {
  id: number;
  tenant_name: string;
  tenant_email: string;
  room_number: string;
  room_price: number;
  start_date: string;
  end_date: string;
  deposit_amount: number;
  monthly_rent: number;
  status: string;
  signature_data: string | null;
  owner_signature_data: string | null;
  created_at: string;
}

export default function OwnerContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;
  const router = useRouter();

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchContract() {
      try {
        const res = await fetch(`/api/owner/contracts/${contractId}`);
        const data = await res.json();
        
        if (data.success) {
          setContract(data.data);
        } else {
          setError(data.message || 'ไม่พบข้อมูลสัญญา');
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    }
    
    if (contractId) fetchContract();
  }, [contractId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#080F1E]">
        <div className="animate-pulse text-white/50 font-black uppercase tracking-widest text-xs">Loading Details...</div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#080F1E] p-8">
        <div className="text-rose-500 font-bold mb-4">{error}</div>
        <button onClick={() => router.back()} className="text-white/50 font-bold underline hover:text-white">กลับไปหน้าสัญญา</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#080F1E] p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <Link href="/owner/contracts" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l-7 7m7-7H3" /></svg>
                กลับไปหน้ารวมสัญญา
              </Link>
              <h1 className="text-4xl font-black text-white tracking-tight">รายละเอียดสัญญาเช่า</h1>
              <p className="text-muted-foreground mt-2 font-bold">รหัสอ้างอิง: C-{contractId.toString().padStart(6, '0')}</p>
           </div>
           
           <div className={cn(
             "px-6 py-3 rounded-2xl flex items-center gap-3 border shadow-sm",
             contract.status === 'Active' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
             contract.status === 'PendingOwnerSignature' ? "bg-amber-50 border-amber-200 text-amber-700" :
             "bg-blue-50 border-blue-200 text-blue-700"
           )}>
             <span className="font-black text-sm uppercase tracking-wider">
               {contract.status === 'Active' ? 'สัญญาอนุมัติเรียบร้อย' : 
                contract.status === 'PendingOwnerSignature' ? 'รอเจ้าของหอเซ็นอนุมัติ' : 
                contract.status}
             </span>
             <div className={cn(
               "w-3 h-3 rounded-full animate-pulse",
               contract.status === 'Active' ? "bg-emerald-500" :
               contract.status === 'PendingOwnerSignature' ? "bg-amber-500" :
               "bg-blue-500"
             )} />
           </div>
        </div>

        {/* Content Section */}
        <div className="bg-[#0F172A] border border-white/20/10 rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-10">
           
           {/* General Details */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
             <div className="space-y-6">
               <h3 className="text-sm font-black text-white/50 uppercase tracking-widest pb-4 border-b border-[#F3EFE9]">ข้อมูลผู้เช่า</h3>
               <div>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">ชื่อ-นามสกุล</p>
                  <p className="text-xl font-black text-white">{contract.tenant_name}</p>
               </div>
               <div>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">อีเมลติดต่อ</p>
                  <p className="text-sm font-bold text-white">{contract.tenant_email}</p>
               </div>
               <div>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">วันที่ทำรายการจอง</p>
                  <p className="text-sm font-medium text-white">{new Date(contract.created_at).toLocaleString('th-TH')}</p>
               </div>
             </div>

             <div className="space-y-6">
               <h3 className="text-sm font-black text-white/50 uppercase tracking-widest pb-4 border-b border-[#F3EFE9]">ข้อมูลห้องพักและสัญญา</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">ห้องพัก</p>
                    <p className="text-xl font-black text-white">{contract.room_number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">ระยะเวลา</p>
                    <p className="text-sm font-black text-white pb-1">12 เดือน</p>
                  </div>
               </div>
               
               <div>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">รอบสัญญา</p>
                  <p className="text-sm font-bold text-white">
                    เริ่ม: {new Date(contract.start_date).toLocaleDateString('th-TH')} <br/> 
                    สิ้นสุด: {new Date(contract.end_date).toLocaleDateString('th-TH')}
                  </p>
               </div>
             </div>
           </div>

           {/* Financials */}
           <div className="bg-[#0F172A] p-8 rounded-[2rem] border border-white/20/10 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                 <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-2">ค่าเช่ารายเดือน</p>
                 <p className="text-2xl font-black text-white">฿{Number(contract.monthly_rent || contract.room_price || 0).toLocaleString()}</p>
              </div>
              <div className="col-span-2 lg:col-span-3 text-right lg:text-left flex flex-col justify-end">
                 <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-2">เงินประกัน (ชำระแล้ว)</p>
                 <p className="text-2xl font-black text-emerald-600">฿{Number(contract.deposit_amount).toLocaleString()}</p>
              </div>
           </div>

           {/* Signatures */}
           <div className="space-y-6">
             <h3 className="text-sm font-black text-white/50 uppercase tracking-widest pb-4 border-b border-[#F3EFE9]">หลักฐานลายมือชื่อ</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Tenant Signature */}
               <div className="border border-white/20/10 rounded-[2rem] p-6 lg:p-8 relative min-h-[200px] flex flex-col items-center justify-center bg-[#080F1E]">
                 <p className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-widest text-white/50">ลายเซ็นผู้เช่า</p>
                 {contract.signature_data ? (
                   <div style={{ backgroundImage: `url(${contract.signature_data})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', width: '100%', height: '120px' }} />
                 ) : (
                   <span className="text-muted-foreground/60 font-bold text-sm">ผู้เช่ายังไม่ได้ลงนาม</span>
                 )}
                 <div className="absolute bottom-6 text-white/50 text-[10px] font-bold italic border-t border-white/20/10 pt-2 w-3/4 text-center">
                    ( {contract.tenant_name} )
                 </div>
               </div>

               {/* Owner Signature */}
               <div className="border border-white/20/10 rounded-[2rem] p-6 lg:p-8 relative min-h-[200px] flex flex-col items-center justify-center bg-[#080F1E]">
                 <p className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-widest text-white/50">ลายเซ็นเจ้าของหอพัก</p>
                 {contract.owner_signature_data ? (
                   <div style={{ backgroundImage: `url(${contract.owner_signature_data})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', width: '100%', height: '120px' }} />
                 ) : (
                   <div className="flex flex-col items-center gap-4">
                     <span className="text-amber-500/60 font-bold text-sm">รอการอนุมัติ</span>
                     {contract.status === 'PendingOwnerSignature' && (
                       <Link href="/owner/contracts" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors">
                         ไปที่หน้าตรวจและอนุมัติ
                       </Link>
                     )}
                   </div>
                 )}
                 <div className="absolute bottom-6 text-white/50 text-[10px] font-bold italic border-t border-white/20/10 pt-2 w-3/4 text-center">
                    ( เจ้าของหอพัก / ผู้จัดการ )
                 </div>
               </div>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
