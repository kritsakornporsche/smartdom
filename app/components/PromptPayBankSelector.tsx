"use client";

import { useState } from "react";

interface PromptPayBankSelectorProps {
  qrImage?: string;
  promptpayNumber?: string;
  promptpayName?: string;
  amount?: number;
  fileName?: string;
}

const BANKS = [
  { name: "K PLUS", scheme: "kplus://", bg: "bg-[#138f2d]", text: "text-white", label: "กสิกรไทย" },
  { name: "SCB EASY", scheme: "scbeasy://", bg: "bg-[#4e2e7f]", text: "text-white", label: "ไทยพาณิชย์" },
  { name: "Krungthai NEXT", scheme: "ktbnext://", bg: "bg-[#00a6e6]", text: "text-white", label: "กรุงไทย" },
  { name: "KMA", scheme: "kma://", bg: "bg-[#fec400]", text: "text-slate-900", label: "กรุงศรี" },
  { name: "Bualuang", scheme: "bualuangmbanking://", bg: "bg-[#1e3f8a]", text: "text-white", label: "กรุงเทพ" },
  { name: "ttb touch", scheme: "ttbtouch://", bg: "bg-[#002d63]", text: "text-white", label: "ทีทีบี" },
];

export default function PromptPayBankSelector({
  qrImage,
  promptpayNumber,
  promptpayName,
  amount,
  fileName = "promptpay-qr.png",
}: PromptPayBankSelectorProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    if (!promptpayNumber) return;
    try {
      await navigator.clipboard.writeText(promptpayNumber.replace(/[^0-9]/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const textarea = document.createElement("textarea");
      textarea.value = promptpayNumber.replace(/[^0-9]/g, '');
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleDownloadQR = async () => {
    if (!qrImage) return;
    setDownloading(true);

    try {
      // 1. Try Native Web Share API (supports iOS "Save to Files" / บันทึกไปยังแอปไฟล์ and "Save Image")
      if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
        try {
          const res = await fetch(qrImage);
          const blob = await res.blob();
          const file = new File([blob], fileName, { type: blob.type || 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'QR Code สำหรับชำระเงิน',
              text: promptpayName ? `ชำระให้: ${promptpayName}` : undefined,
            });
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
            return;
          }
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            // User cancelled or closed the share sheet
            return;
          }
          console.warn('Share API notice, falling back to download:', shareErr);
        }
      }

      // 2. Fallback: Direct Blob Download Link
      const res = await fetch(qrImage);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Download QR error:', e);
      // Last-resort fallback
      const link = document.createElement("a");
      link.href = qrImage;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleOpenBank = (scheme: string) => {
    // Attempt deeplink open
    window.location.href = scheme;
  };

  return (
    <div className="space-y-3 w-full">
      {/* Action Buttons: Save QR & Copy Number */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownloadQR}
          disabled={!qrImage || downloading}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 active:scale-95 transition-all text-xs font-bold text-emerald-300 hover:text-emerald-100 cursor-pointer border border-emerald-500/30 shadow-sm"
          title="บันทึกรูปลงแอปไฟล์ หรืออัลบั้มภาพในเครื่อง"
        >
          <span>{savedSuccess ? "✓" : "📁"}</span>
          <span>
            {downloading
              ? "กำลังดำเนินการ..."
              : savedSuccess
              ? "บันทึกสำเร็จ!"
              : "บันทึกลงแอปไฟล์"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!promptpayNumber}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-xs font-bold text-white cursor-pointer border border-white/10 shadow-sm"
        >
          <span>{copied ? "✓" : "📋"}</span>
          <span className={copied ? "text-emerald-400" : ""}>
            {copied ? "คัดลอกเบอร์แล้ว" : "คัดลอกพร้อมเพย์"}
          </span>
        </button>
      </div>

      {/* Deeplink Banking Apps */}
      <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-white/70">
            แตะเพื่อเปิดแอปธนาคาร
          </span>
          <span className="text-[9px] text-amber-400 font-medium">
            (บันทึกรูป QR ก่อน)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {BANKS.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => handleOpenBank(b.scheme)}
              className={`${b.bg} ${b.text} py-2 px-2 rounded-xl text-center shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center`}
            >
              <span className="text-xs font-black tracking-tight">{b.name}</span>
              <span className="text-[9px] opacity-80 leading-tight">{b.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
