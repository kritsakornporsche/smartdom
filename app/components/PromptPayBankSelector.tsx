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

  const handleDownloadQR = () => {
    if (!qrImage) return;
    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = qrImage;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
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
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-xs font-bold text-white cursor-pointer border border-white/10"
        >
          <span>📥</span>
          <span>{downloading ? "กำลังดาวน์โหลด..." : "บันทึกรูป QR"}</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!promptpayNumber}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-xs font-bold text-white cursor-pointer border border-white/10"
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
