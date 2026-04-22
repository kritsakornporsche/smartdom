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
}

export default function ContractSigner({ 
  tenantName, 
  roomNumber, 
  monthlyRent, 
  depositAmount, 
  startDate, 
  endDate,
  onSign,
  onCancel
}: ContractSignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  }, []);

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
    <div className="bg-background rounded-[4rem] p-8 lg:p-16 border border-border/40 shadow-2xl max-w-5xl w-full mx-auto space-y-14 animate-reveal">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-display font-black tracking-tight italic">สัญญาเช่าหอพักระบบดิจิทัล</h2>
        <p className="text-sm font-black uppercase tracking-wider text-primary">SmartDom Digital Agreement</p>
      </div>

      {/* Contract Content Area */}
      <div className="bg-[#FAF9F6] border border-border/60 rounded-[3rem] p-10 lg:p-16 overflow-y-auto max-h-[50vh] space-y-12 text-[#3E342B] shadow-inner font-serif leading-normal relative">
        <div className="text-center space-y-5 pb-10 border-b border-border/40">
          <h3 className="text-2xl font-bold">สัญญาเช่าที่พักอาศัย</h3>
          <p className="text-sm opacity-60">จัดทำขึ้นและมีผลบังคับใช้ ณ วันที่ {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="space-y-8 text-base">
          <p>
            สัญญานี้ทำขึนระหว่าง <strong>พอร์ช สมาร์ทโดม (ผู้ให้เช่า)</strong> และ <strong>คุณ {tenantName} (ผู้เช่า)</strong> 
            โดยมีรายละเอียดข้อตกลงในการเช่าห้องพักหมายเลข <strong>{roomNumber}</strong> ดังต่อไปนี้:
          </p>

          <div className="bg-white/50 rounded-3xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-1">
                 <p className="text-sm font-black uppercase tracking-wider text-primary/40">ระยะเวลาเช่า</p>
                 <p className="font-bold">{new Date(startDate).toLocaleDateString('th-TH')} — {new Date(endDate).toLocaleDateString('th-TH')}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-sm font-black uppercase tracking-wider text-primary/40">ค่าเช่ารายเดือน</p>
                 <p className="font-bold">฿{monthlyRent.toLocaleString()}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-sm font-black uppercase tracking-wider text-primary/40">เงินประกันความเสียหาย</p>
                 <p className="font-bold">฿{depositAmount.toLocaleString()}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-sm font-black uppercase tracking-wider text-primary/40">ผู้เช่า</p>
                 <p className="font-bold">{tenantName}</p>
               </div>
            </div>
          </div>

          <ol className="list-decimal pl-6 space-y-5 opacity-90">
            <li><strong>การชำระเงิน:</strong> ผู้เช่าตกลงชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน หากล่าช้าจะมีค่าปรับตามที่หอพักกำหนด</li>
            <li><strong>ระเบียบที่พัก:</strong> ผู้เช่าต้องปฏิบัติตามกฎระเบียบของหอพักอย่างเคร่งครัดเพื่อความสงบเรียบร้อยของส่วนรวม</li>
            <li><strong>ความรับผิดชอบ:</strong> ผู้เช่าต้องดูแลรักษาความสะอาดและไม่กระทำการที่ก่อให้เกิดความเสียหายต่อทรัพย์สินของผู้อื่น</li>
            <li><strong>การสิ้นสุดสัญญา:</strong> เมื่อครบกำหนดเวลาเช่า ผู้เช่าต้องย้ายออกและคืนห้องในสภาพเดิม</li>
          </ol>

          <p className="pt-10 italic opacity-60 text-sm text-balance">
            ข้าพเจ้า {tenantName} ได้อ่านและทำความเข้าใจข้อความในสัญญานี้โดยตลอดแล้ว เห็นว่าถูกต้องตามเจตนารมณ์ 
            จึงได้ทำการลงลายมือชื่ออิเล็กทรอนิกส์ไว้เพื่อเป็นหลักฐานในการทำสัญญา
          </p>
        </div>
        
        {/* Subtle watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-display font-black text-black/[0.02] -rotate-12 pointer-events-none select-none">
          SMARTDOM AGREEMENT
        </div>
      </div>

      {/* Signature Pad Area */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <label className="text-sm font-black uppercase tracking-wide text-primary/60">ลงลายมือชื่อผู้เช่า (Electronic Signature)</label>
          <button 
            onClick={clearCanvas} 
            className="text-sm font-black text-rose-500 uppercase tracking-wider hover:text-rose-600 transition-colors"
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
              "w-full h-[250px] border-2 border-dashed border-border/60 rounded-[2.5rem] bg-white cursor-crosshair",
              "transition-all duration-500 hover:border-primary/40 focus:border-primary/40",
              hasSigned && "border-primary/20 shadow-inner"
            )}
          />
          {!hasSigned && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500">
               <span className="text-xs font-black text-primary/20 uppercase tracking-[0.5em] italic">Sign Here</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 pt-4">
        <button 
          onClick={onCancel}
          className="flex-1 py-6 bg-secondary/10 border border-transparent rounded-full text-sm font-black uppercase tracking-wide hover:bg-secondary/20 transition-all duration-300 active:scale-95"
        >
          ย้อนกลับ
        </button>
        <button 
          onClick={handleConfirm}
          disabled={!hasSigned}
          className={cn(
            "flex-[2.5] py-6 bg-primary text-primary-foreground rounded-full text-sm font-black uppercase tracking-wide",
            "hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 active:scale-95",
            "disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
          )}
        >
          ยืนยันข้อมูลและลงนามสัญญาเช่า
        </button>
      </div>
    </div>
  );
}
