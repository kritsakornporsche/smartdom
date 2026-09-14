'use client';

import { useState, useRef, useEffect } from 'react';

interface CameraMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomNumber: string;
  meterType: 'Water' | 'Electricity';
  previousReading: number;
  onConfirmReading: (reading: number, photoUrl: string) => void;
}

export default function CameraMeterModal({
  isOpen,
  onClose,
  roomNumber,
  meterType,
  previousReading,
  onConfirmReading,
}: CameraMeterModalProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedReading, setDetectedReading] = useState<string>('');
  const [warning, setWarning] = useState<string | null>(null);
  const [engineUsed, setEngineUsed] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'live'>('upload');
  const [liveStreamActive, setLiveStreamActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop video stream on close
  useEffect(() => {
    if (!isOpen) {
      stopLiveStream();
      setCapturedImage(null);
      setDetectedReading('');
      setWarning(null);
      setAnalyzing(false);
    }
  }, [isOpen]);

  const stopLiveStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setLiveStreamActive(false);
  };

  const startLiveStream = async () => {
    try {
      stopLiveStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setLiveStreamActive(true);
      setMode('live');
    } catch (err) {
      console.warn('Live stream not supported or permission denied, using Native Camera capture');
      setMode('upload');
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const captureLiveFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopLiveStream();
      setCapturedImage(dataUrl);
      analyzeMeterImage(dataUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      analyzeMeterImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeMeterImage = async (dataUrl: string) => {
    setAnalyzing(true);
    setWarning(null);
    setDetectedReading('');

    try {
      const res = await fetch('/api/owner/meters/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          type: meterType,
          previous_reading: previousReading,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.reading !== null && data.data?.reading !== undefined) {
        setDetectedReading(String(data.data.reading));
        setWarning(data.data.warning || null);
        setEngineUsed(data.data.engine);
      } else {
        setWarning('ระบบไม่สามารถอ่านตัวเลขได้ชัดเจน กรุณากรอกตัวเลขด้วยตนเอง');
      }
    } catch (err) {
      console.error('OCR analyze error:', err);
      setWarning('ไม่สามารถเชื่อมต่อระบบอ่านตัวเลขได้ กรุณากรอกตัวเลขด้วยตนเอง');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    const num = parseFloat(detectedReading);
    if (isNaN(num)) {
      alert('กรุณาระบุตัวเลขมิเตอร์ที่ถูกต้อง');
      return;
    }
    onConfirmReading(num, capturedImage || '');
    onClose();
  };

  if (!isOpen) return null;

  const typeColor = meterType === 'Water' ? 'text-blue-400' : 'text-amber-400';
  const typeLabel = meterType === 'Water' ? 'มิเตอร์น้ำ' : 'มิเตอร์ไฟ';
  const unitsDelta = detectedReading ? Number(detectedReading) - previousReading : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      {/* Hidden Native Camera Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="bg-[#0F172A] border border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-white/50">
              AI Vision Meter Scanner
            </span>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>📸</span>
              <span>สแกน{typeLabel} ห้อง {roomNumber}</span>
            </h3>
          </div>
          <button
            onClick={() => {
              stopLiveStream();
              onClose();
            }}
            className="p-2 text-white/50 hover:text-white rounded-xl text-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Viewfinder / Preview Box */}
        <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10 aspect-[4/3] flex items-center justify-center">
          {/* 1. Live Stream View */}
          {liveStreamActive && (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Target Aim Box */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-24 border-2 border-cyan-400/80 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-cyan-300 bg-black/60 px-2 py-0.5 rounded">
                    เล็งหน้าปัดตัวเลขให้อยู่ในกรอบ
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Captured Image Preview */}
          {!liveStreamActive && capturedImage && (
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Captured Meter"
                className="w-full h-full object-contain"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 backdrop-blur-xs">
                  <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-cyan-300">
                    AI กำลังอ่านตัวเลขหน้าปัด...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. Empty State (Initial) */}
          {!liveStreamActive && !capturedImage && (
            <div className="text-center p-6 space-y-3">
              <span className="text-4xl block">📸</span>
              <p className="text-xs text-white/60">
                เลือกวิธีถ่ายรูปมิเตอร์ห้อง {roomNumber}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>📷</span>
                  <span>เปิดกล้องมือถือถ่ายภาพ (Native Camera)</span>
                </button>
                <button
                  type="button"
                  onClick={startLiveStream}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white/80 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🎥</span>
                  <span>สตรีมกล้องสด (Live Video)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Stream Controls */}
        {liveStreamActive && (
          <div className="flex gap-2">
            <button
              onClick={captureLiveFrame}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📸</span>
              <span>ถ่ายภาพและอ่านตัวเลข</span>
            </button>
            <button
              onClick={stopLiveStream}
              className="px-4 py-3 bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>
        )}

        {/* Retake buttons when image captured */}
        {!liveStreamActive && capturedImage && (
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>🔄</span>
              <span>ถ่ายภาพใหม่</span>
            </button>
            {engineUsed && (
              <span className="text-[10px] text-white/40 font-mono">
                Engine: {engineUsed}
              </span>
            )}
          </div>
        )}

        {/* OCR Result & Input Field */}
        {capturedImage && (
          <div className="p-4 rounded-2xl bg-[#080F1E] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">
                ตัวเลขมิเตอร์ที่อ่านได้:
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                เลขงวดก่อน: <strong>{previousReading}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                step="any"
                value={detectedReading}
                onChange={(e) => setDetectedReading(e.target.value)}
                placeholder="กรอกตัวเลข"
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/20 focus:border-cyan-400 rounded-xl text-lg font-black text-cyan-300 font-mono outline-none shadow-inner"
              />
              <div className="text-right shrink-0">
                <span className="text-[10px] text-white/50 block">ใช้ไปงวดนี้</span>
                <span className={`text-sm font-black ${unitsDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {unitsDelta >= 0 ? `+${unitsDelta}` : unitsDelta} หน่วย
                </span>
              </div>
            </div>

            {/* Warning Message */}
            {warning && (
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl leading-relaxed">
                ⚠️ {warning}
              </p>
            )}

            {/* Confirm Save Button */}
            <button
              onClick={handleSave}
              disabled={analyzing || !detectedReading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>💾</span>
              <span>บันทึกตัวเลขและแนบรูปภาพเป็นหลักฐาน</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
