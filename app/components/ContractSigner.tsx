'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ContractSignerProps {
  tenantName: string;
  roomNumber: string;
  monthlyRent: number;
  depositAmount: number;
  startDate: string;
  endDate: string;
  onSign: (signatureValue: string) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export default function ContractSigner({ 
  tenantName, 
  roomNumber, 
  monthlyRent, 
  depositAmount, 
  startDate, 
  endDate,
  onSign,
  onCancel,
  readOnly = false
}: ContractSignerProps) {
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (!agreed) return;
    onSign('CONFIRMED_E_CONTRACT');
  };

  const currentDateFormatted = new Date().toLocaleDateString('th-TH', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="bg-background rounded-[3.5rem] p-5 sm:p-8 lg:p-12 border border-border shadow-2xl max-w-5xl w-full mx-auto space-y-8 animate-reveal">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight italic">ข้อตกลงและเงื่อนไขสัญญาเช่า</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">SmartDom Agreement Terms</p>
      </div>

      {/* Contract Content Area */}
      <div className="bg-card border border-border rounded-[2.5rem] p-5 sm:p-8 lg:p-10 overflow-y-auto max-h-[50vh] space-y-8 text-foreground shadow-inner font-sans leading-relaxed relative custom-scrollbar">
        <div className="text-center space-y-2 pb-6 border-b border-border">
          <h3 className="text-xl font-bold">รายละเอียดสัญญาเช่าที่พักอาศัย</h3>
          <p className="text-xs text-muted-foreground">จัดทำขึ้นและมีผลบังคับใช้ ณ วันที่ {currentDateFormatted}</p>
        </div>

        <div className="space-y-6 text-sm">
          <p>
            สัญญานี้ทำขึ้นระหว่าง <strong>พอร์ช สมาร์ทโดม (ผู้ให้เช่า)</strong> และ <strong>คุณ {tenantName} (ผู้เช่า)</strong> 
            โดยมีรายละเอียดข้อตกลงในการเช่าห้องพักหมายเลข <strong>{roomNumber}</strong> ดังต่อไปนี้:
          </p>

          <div className="bg-secondary/40 rounded-3xl p-6 sm:p-8 space-y-4 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary">ระยะเวลาเช่า</p>
                 <p className="font-bold text-foreground">{new Date(startDate).toLocaleDateString('th-TH')} — {new Date(endDate).toLocaleDateString('th-TH')}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary">ค่าเช่ารายเดือน</p>
                 <p className="font-bold text-foreground">฿{monthlyRent.toLocaleString()}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary">เงินประกันความเสียหาย</p>
                 <p className="font-bold text-foreground">฿{depositAmount.toLocaleString()}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary">ผู้เช่า</p>
                 <p className="font-bold text-foreground">{tenantName}</p>
               </div>
            </div>
          </div>

          <ol className="list-decimal pl-6 space-y-3 text-foreground/90 leading-relaxed">
            <li><strong>การชำระเงิน:</strong> ผู้เช่าตกลงชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน หากล่าช้าจะมีค่าปรับตามที่หอพักกำหนด</li>
            <li><strong>ระเบียบที่พัก:</strong> ผู้เช่าต้องปฏิบัติตามกฎระเบียบของหอพักอย่างเคร่งครัดเพื่อความสงบเรียบร้อยของส่วนรวม</li>
            <li><strong>ความรับผิดชอบ:</strong> ผู้เช่าต้องดูแลรักษาความสะอาดและไม่กระทำการที่ก่อให้เกิดความเสียหายต่อทรัพย์สินของผู้อื่น</li>
            <li><strong>การสิ้นสุดสัญญา:</strong> เมื่อครบกำหนดเวลาเช่า ผู้เช่าต้องย้ายออกและคืนห้องในสภาพเดิม</li>
          </ol>
        </div>
        
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl font-display font-black text-foreground/[0.03] -rotate-12 pointer-events-none select-none">
          SMARTDOM AGREEMENT
        </div>
      </div>

      {/* Confirmation Area - rendered ONLY if NOT readOnly */}
      {!readOnly && (
        <div className="p-6 bg-primary/[0.03] border border-primary/20 rounded-3xl space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input 
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded-md border-border text-primary focus:ring-primary cursor-pointer accent-primary"
            />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                ข้าพเจ้าได้ตรวจสอบข้อมูลและตกลงยอมรับข้อกำหนดและเงื่อนไขในสัญญาเช่าฉบับนี้ทุกประการ
              </span>
              <p className="text-muted-foreground text-[11px]">
                การยืนยันนี้ถือเป็นการทำสัญญาทางอิเล็กทรอนิกส์ในนาม <strong>คุณ{tenantName}</strong> ณ วันที่ {currentDateFormatted}
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Bottom Actions */}
      {readOnly ? (
        <div className="pt-2">
          <button 
            onClick={onCancel}
            className="w-full py-4 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all duration-300 active:scale-95 shadow-xl shadow-primary/20 cursor-pointer"
          >
            ย้อนกลับ
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 bg-secondary text-foreground border border-border rounded-full text-xs font-black uppercase tracking-widest hover:bg-secondary/80 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            ย้อนกลับ
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!agreed}
            className={cn(
              "flex-[2.5] py-4 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-widest",
              "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 active:scale-95",
              "disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
            )}
          >
            ✓ ยอมรับสัญญาเช่าและไปขั้นตอนชำระเงินค่าจอง →
          </button>
        </div>
      )}
    </div>
  );
}
