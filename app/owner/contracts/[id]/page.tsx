'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import ContractPDFButton from '@/components/ContractPDFButton';

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
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="animate-pulse text-[#A08D74] font-black uppercase tracking-wider text-xs">Loading Details...</div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-8 flex flex-col items-center justify-center">
        <div className="text-rose-500 font-bold mb-4">{error}</div>
        <button onClick={() => router.back()} className="text-[#A08D74] font-bold underline hover:text-[#3E342B]">กลับไปหน้าสัญญา</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-6 lg:p-12 scroll-smooth custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <Link href="/owner/contracts" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#A08D74] hover:text-[#3E342B] transition-colors mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l-7 7m7-7H3" /></svg>
                กลับไปหน้ารวมสัญญา
              </Link>
              <h1 className="text-2xl font-black text-[#3E342B] tracking-tight">รายละเอียดสัญญาเช่า</h1>
              <p className="text-[#8B7355] mt-2 font-bold">รหัสอ้างอิง: C-{contractId.toString().padStart(6, '0')}</p>
           </div>
           
            <div id="action-buttons" className="flex items-center gap-4">
               {contract.status === 'Active' && (
                 <ContractPDFButton 
                   contractId={contractId} 
                   targetId="contract-content" 
                   signatureData={contract.signature_data} 
                 />
               )}
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
        </div>

        {/* Content Section */}
        <div id="contract-content" className="bg-white border border-[#E5DFD3] rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-10">
           
           {/* General Details */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
             <div className="space-y-6">
               <h3 className="text-sm font-black text-[#A08D74] uppercase tracking-wider pb-4 border-b border-[#F3EFE9]">ข้อมูลผู้เช่า</h3>
               <div>
                  <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-1">ชื่อ-นามสกุล</p>
                  <p className="text-xl font-black text-[#3E342B]">{contract.tenant_name}</p>
               </div>
               <div>
                  <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-1">อีเมลติดต่อ</p>
                  <p className="text-sm font-bold text-[#3E342B]">{contract.tenant_email}</p>
               </div>
               <div>
                  <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-1">วันที่ทำรายการจอง</p>
                  <p className="text-sm font-medium text-[#3E342B]">{new Date(contract.created_at).toLocaleString('th-TH')}</p>
               </div>
             </div>

             <div className="space-y-6">
               <h3 className="text-sm font-black text-[#A08D74] uppercase tracking-wider pb-4 border-b border-[#F3EFE9]">ข้อมูลห้องพักและสัญญา</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-1">ห้องพัก</p>
                    <p className="text-xl font-black text-[#3E342B]">{contract.room_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-1">ระยะเวลา</p>
                    <p className="text-sm font-black text-[#3E342B] pb-1">12 เดือน</p>
                  </div>
               </div>
               
               <div>
                  <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-1">รอบสัญญา</p>
                  <p className="text-sm font-bold text-[#3E342B]">
                    เริ่ม: {new Date(contract.start_date).toLocaleDateString('th-TH')} <br/> 
                    สิ้นสุด: {new Date(contract.end_date).toLocaleDateString('th-TH')}
                  </p>
               </div>
             </div>
           </div>

           {/* Financials */}
           <div className="bg-[#FAF8F5] p-8 rounded-[2rem] border border-[#E5DFD3] grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                 <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-2">ค่าเช่ารายเดือน</p>
                 <p className="text-2xl font-black text-[#3E342B]">฿{Number(contract.monthly_rent || contract.room_price || 0).toLocaleString()}</p>
              </div>
              <div className="col-span-2 lg:col-span-3 text-right lg:text-left flex flex-col justify-end">
                 <p className="text-sm text-[#A08D74] font-bold uppercase tracking-wider mb-2">เงินประกัน (ชำระแล้ว)</p>
                 <p className="text-2xl font-black text-emerald-600">฿{Number(contract.deposit_amount).toLocaleString()}</p>
              </div>
           </div>

           {/* Signatures */}
           <div className="space-y-6">
             <h3 className="text-sm font-black text-[#A08D74] uppercase tracking-wider pb-4 border-b border-[#F3EFE9]">หลักฐานลายมือชื่อ</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Tenant Signature */}
               <div className="border border-[#E5DFD3] rounded-[2rem] p-6 lg:p-8 relative min-h-[200px] flex flex-col items-center justify-center bg-[#FDFBF7]">
                 <p className="absolute top-6 left-6 text-sm font-black uppercase tracking-wider text-[#A08D74]">ลายเซ็นผู้เช่า</p>
                 {contract.signature_data ? (
                   <div style={{ backgroundImage: `url(${contract.signature_data})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', width: '100%', height: '120px' }} />
                 ) : (
                   <span className="text-[#DCD3C6] font-bold text-sm">ผู้เช่ายังไม่ได้ลงนาม</span>
                 )}
                 <div className="absolute bottom-6 text-[#A08D74] text-sm font-bold italic border-t border-[#E5DFD3] pt-2 w-3/4 text-center">
                    ( {contract.tenant_name} )
                 </div>
               </div>

               {/* Owner Signature */}
               <div className="border border-[#E5DFD3] rounded-[2rem] p-6 lg:p-8 relative min-h-[200px] flex flex-col items-center justify-center bg-[#FDFBF7]">
                 <p className="absolute top-6 left-6 text-sm font-black uppercase tracking-wider text-[#A08D74]">ลายเซ็นเจ้าของหอพัก</p>
                 {contract.owner_signature_data ? (
                   <div style={{ backgroundImage: `url(${contract.owner_signature_data})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', width: '100%', height: '120px' }} />
                 ) : (
                   <div className="flex flex-col items-center gap-4">
                     <span className="text-amber-500/60 font-bold text-sm">รอการอนุมัติ</span>
                     {contract.status === 'PendingOwnerSignature' && (
                       <Link href="/owner/contracts" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-black uppercase tracking-wider hover:bg-amber-600 transition-colors">
                         ไปที่หน้าตรวจและอนุมัติ
                       </Link>
                     )}
                   </div>
                 )}
                 <div className="absolute bottom-6 text-[#A08D74] text-sm font-bold italic border-t border-[#E5DFD3] pt-2 w-3/4 text-center">
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
