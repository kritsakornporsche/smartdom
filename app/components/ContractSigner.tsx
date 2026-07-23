'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ContractSignerProps {
  tenantName: string;
  roomNumber: string;
  monthlyRent: number;
  depositAmount: number;
  startDate: string;
  endDate: string;
  onSign: (signatureBase64: string) => void;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  }, [readOnly]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasSigned(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setHasSigned(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    onSign(dataUrl);
  };

  return (
    <div className="bg-background rounded-[4rem] p-5 sm:p-8 lg:p-14 border border-border/40 shadow-2xl max-w-5xl w-full mx-auto space-y-10 animate-reveal">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight italic">ข้อตกลงและเงื่อนไขสัญญาเช่า</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">SmartDom Agreement Terms</p>
      </div>

      {/* Contract Content Area */}
      <div className="bg-card border border-border/60 rounded-[3rem] p-5 sm:p-8 lg:p-12 overflow-y-auto max-h-[55vh] space-y-10 text-foreground shadow-inner font-sans leading-relaxed relative">
        <div className="text-center space-y-3 pb-8 border-b border-border/40">
          <h3 className="text-xl font-bold">รายละเอียดสัญญาเช่าที่พักอาศัย</h3>
          <p className="text-xs text-muted-foreground">จัดทำขึ้นและมีผลบังคับใช้ ณ วันที่ {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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

          <ol className="list-decimal pl-6 space-y-4 text-foreground/90">
            <li><strong>การชำระเงิน:</strong> ผู้เช่าตกลงชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน หากล่าช้าจะมีค่าปรับตามที่หอพักกำหนด</li>
            <li><strong>ระเบียบที่พัก:</strong> ผู้เช่าต้องปฏิบัติตามกฎระเบียบของหอพักอย่างเคร่งครัดเพื่อความสงบเรียบร้อยของส่วนรวม</li>
            <li><strong>ความรับผิดชอบ:</strong> ผู้เช่าต้องดูแลรักษาความสะอาดและไม่กระทำการที่ก่อให้เกิดความเสียหายต่อทรัพย์สินของผู้อื่น</li>
            <li><strong>การสิ้นสุดสัญญา:</strong> เมื่อครบกำหนดเวลาเช่า ผู้เช่าต้องย้ายออกและคืนห้องในสภาพเดิม</li>
          </ol>

          <p className="pt-6 italic text-xs text-muted-foreground">
            * หน้านี้ใช้สำหรับอ่านและตรวจสอบข้อตกลงสัญญาเช่าเบื้องต้น การลงลายมือชื่อจริงจะเกิดขึ้นในขั้นตอนการทำสัญญาตามกระบวนการจอง
          </p>
        </div>
        
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl font-display font-black text-foreground/[0.03] -rotate-12 pointer-events-none select-none">
          SMARTDOM AGREEMENT
        </div>
      </div>

      {/* Signature Pad Area - rendered ONLY if NOT readOnly */}
      {!readOnly && (
        <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">ลงลายมือชื่อผู้เช่า (Electronic Signature)</label>
            <button 
              onClick={clearCanvas} 
              className="text-xs font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
            >
              ล้างข้อมูล
            </button>
          </div>

          <div className="relative group">
            <canvas 
              ref={canvasRef}
              width={1200}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className={cn(
                "w-full h-[220px] border-2 border-dashed border-border rounded-[2.5rem] bg-white cursor-crosshair",
                "transition-all duration-500 hover:border-primary focus:border-primary",
                hasSigned && "border-primary shadow-inner"
              )}
            />
            {!hasSigned && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500">
                 <span className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] italic">Sign Here</span>
              </div>
            )}
          </div>
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
            disabled={!hasSigned}
            className={cn(
              "flex-[2.5] py-4 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-widest",
              "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 active:scale-95",
              "disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
            )}
          >
            ยืนยันข้อมูลและลงนามสัญญาเช่า
          </button>
        </div>
      )}
    </div>
  );
}
