'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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
  const [liveStreamActive, setLiveStreamActive] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopLiveStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setLiveStreamActive(false);
    setTorchOn(false);
  }, []);

  const startLiveStream = useCallback(async (preferredFacing: 'environment' | 'user' = facingMode) => {
    stopLiveStream();
    setStreamError(null);

    // Guard if mediaDevices not supported
    if (!navigator?.mediaDevices?.getUserMedia) {
      setStreamError('เบราว์เซอร์นี้ไม่รองรับการสตรีมกล้องสด กรุณาใช้กล้องมือถือถ่ายภาพ');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: preferredFacing },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check for torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof (videoTrack as any).getCapabilities === 'function') {
        const capabilities = (videoTrack as any).getCapabilities() || {};
        setHasTorch(Boolean(capabilities.torch));
      } else {
        setHasTorch(false);
      }

      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.setAttribute('playsinline', 'true');
        videoEl.setAttribute('webkit-playsinline', 'true');
        videoEl.muted = true;
        
        videoEl.onloadedmetadata = () => {
          videoEl.play().catch((err) => {
            console.warn('Auto-play blocked or error:', err);
          });
        };
        
        // Immediate play attempt
        videoEl.play().catch(() => {});
      }

      setLiveStreamActive(true);
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      let errorMsg = 'ไม่สามารถเปิดกล้องสดได้';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'ท่านปฏิเสธการเข้าถึงกล้อง กรุณาอนุญาตหรือใช้ปุ่มเปิดกล้องมือถือ (Native Camera)';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'ไม่พบอุปกรณ์กล้องบนเครื่องนี้';
      }
      setStreamError(errorMsg);
      setLiveStreamActive(false);
    }
  }, [facingMode, stopLiveStream]);

  // Handle modal open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setDetectedReading('');
      setWarning(null);
      setAnalyzing(false);
      setZoomLevel(1);
      // Auto start live stream on open
      startLiveStream('environment');
    } else {
      stopLiveStream();
    }

    return () => {
      stopLiveStream();
    };
  }, [isOpen, startLiveStream, stopLiveStream]);

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Failed to toggle torch:', err);
      }
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startLiveStream(nextMode);
  };

  const captureLiveFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      if (zoomLevel > 1) {
        const cropW = width / zoomLevel;
        const cropH = height / zoomLevel;
        const cropX = (width - cropW) / 2;
        const cropY = (height - cropH) / 2;
        ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, width, height);
      } else {
        ctx.drawImage(video, 0, 0, width, height);
      }

      // 1. High-resolution photo retained as evidence for bill
      const fullDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      stopLiveStream();
      setCapturedImage(fullDataUrl);

      // 2. High-speed OCR ROI Crop (aiming reticle center area)
      try {
        const ocrCanvas = document.createElement('canvas');
        const roiW = Math.round(width * 0.88);
        const roiH = Math.round(height * 0.44);
        const roiX = Math.round((width - roiW) / 2);
        const roiY = Math.round((height - roiH) / 2);

        const ocrW = 640;
        const ocrH = Math.round((roiH / roiW) * 640);
        ocrCanvas.width = ocrW;
        ocrCanvas.height = ocrH;
        const ocrCtx = ocrCanvas.getContext('2d');
        if (ocrCtx) {
          ocrCtx.drawImage(canvas, roiX, roiY, roiW, roiH, 0, 0, ocrW, ocrH);
          const ocrDataUrl = ocrCanvas.toDataURL('image/jpeg', 0.80);
          analyzeMeterImage(ocrDataUrl);
          return;
        }
      } catch (err) {
        console.warn('ROI crop error:', err);
      }

      analyzeMeterImage(fullDataUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      stopLiveStream();
      setCapturedImage(dataUrl);

      // Downscale for fast OCR if the phone took a huge photo
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const cx = c.getContext('2d');
          if (cx) {
            cx.drawImage(img, 0, 0, w, h);
            analyzeMeterImage(c.toDataURL('image/jpeg', 0.82));
            return;
          }
        } catch {
          // fallback to full image
        }
        analyzeMeterImage(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const analyzeMeterImage = async (dataUrl: string) => {
    setAnalyzing(true);
    setWarning(null);
    setDetectedReading('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s max timeout

    try {
      const res = await fetch('/api/owner/meters/ocr', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          type: meterType,
          previous_reading: previousReading,
        }),
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data.success && data.data?.reading !== null && data.data?.reading !== undefined) {
        setDetectedReading(String(data.data.reading));
        setWarning(data.data.warning || null);
        setEngineUsed(data.data.engine);
      } else {
        setWarning('ระบบไม่สามารถอ่านตัวเลขได้ชัดเจน กรุณาตรวจสอบหรือกรอกตัวเลขด้วยตนเอง');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError') {
        setWarning('การประมวลผล AI ใช้เวลานาน กรุณากรอกตัวเลขหน้าปัดด้วยตนเอง');
      } else {
        console.error('OCR analyze error:', err);
        setWarning('ไม่สามารถเชื่อมต่อระบบอ่านตัวเลขได้ กรุณากรอกตัวเลขด้วยตนเอง');
      }
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

  const isWater = meterType === 'Water';
  const typeLabel = isWater ? 'มิเตอร์น้ำ' : 'มิเตอร์ไฟ';
  const unitsDelta = detectedReading ? Number(detectedReading) - previousReading : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center bg-black/90 sm:backdrop-blur-md animate-in fade-in sm:p-4">
      {/* Hidden Native Camera Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Container: Fullscreen on mobile, elegant UP Purple dialog on desktop */}
      <div className="flex flex-col w-full h-full sm:h-auto sm:max-h-[94vh] sm:max-w-2xl bg-[#0E071D] sm:border sm:border-purple-500/25 sm:rounded-3xl shadow-2xl shadow-purple-950/50 overflow-hidden relative">
        
        {/* 1. Header Bar with UP Theme */}
        <div className="h-16 px-4 sm:px-6 bg-[#180D2F]/95 border-b border-purple-500/20 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
              isWater 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isWater ? '💧' : '⚡'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300/80">
                  AI Meter Vision • UP SmartDom
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                สแกน{typeLabel} <span className="text-amber-400 font-mono">ห้อง {roomNumber}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Camera Switch button (when live) */}
            {liveStreamActive && !capturedImage && (
              <button
                type="button"
                onClick={toggleFacingMode}
                title="สลับกล้องหน้า/หลัง"
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>🔄</span>
                <span className="hidden sm:inline text-[11px]">สลับกล้อง</span>
              </button>
            )}

            {/* Torch button (when supported) */}
            {liveStreamActive && !capturedImage && hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                title={torchOn ? 'ปิดไฟฉาย' : 'เปิดไฟฉาย'}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  torchOn
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                    : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border-purple-500/20'
                }`}
              >
                <span>🔦</span>
                <span className="hidden sm:inline text-[11px]">{torchOn ? 'ไฟเปิด' : 'เปิดไฟ'}</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                stopLiveStream();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. Camera Viewfinder Area (Expanded, High-Resolution, Large Frame) */}
        <div className="flex-1 relative w-full bg-black flex items-center justify-center overflow-hidden min-h-[50vh] sm:min-h-[440px]">
          
          {/* Always-mounted Video Element with playsInline and muted for Safari */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out',
            }}
            className={`w-full h-full object-cover select-none ${
              liveStreamActive && !capturedImage ? 'block' : 'hidden'
            }`}
          />

          {/* Aiming Reticle Overlay (Only shown during active live stream) */}
          {liveStreamActive && !capturedImage && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              
              {/* Top Hint Badge */}
              <div className="mb-3 px-4 py-1.5 rounded-full bg-[#180D2F]/85 backdrop-blur-md border border-purple-400/40 shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold text-purple-200 tracking-wide">
                  เล็งหน้าปัดตัวเลขมิเตอร์ให้อยู่ในกรอบนี้
                </span>
              </div>

              {/* Large High-Contrast Viewfinder Aim Box */}
              <div className="w-[88%] max-w-md h-48 sm:h-56 relative rounded-2xl border-2 border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.35)] bg-purple-950/15 overflow-hidden">
                
                {/* 4 Glowing Corner Brackets in UP Purple & Gold */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-400 rounded-tl-xl shadow-[0_0_10px_#c084fc]" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl shadow-[0_0_10px_#fbbf24]" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl shadow-[0_0_10px_#fbbf24]" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-400 rounded-br-xl shadow-[0_0_10px_#c084fc]" />

                {/* Center Crosshair Tick Marks */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-8 h-0.5 bg-purple-300" />
                  <div className="h-8 w-0.5 bg-purple-300 -ml-4" />
                </div>

                {/* Scanning Laser Line Animation in UP Purple/Gold */}
                <div 
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-amber-300 shadow-[0_0_12px_#c084fc] animate-pulse"
                  style={{
                    animation: 'meterScan 2.2s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Bottom Instruction */}
              <p className="mt-3 text-[11px] font-semibold text-purple-200/90 bg-[#180D2F]/75 px-3 py-1 rounded-full border border-purple-500/20">
                {isWater ? '💧 มิเตอร์น้ำ: ถ่ายตัวเลขแถบดำ-แดง' : '⚡ มิเตอร์ไฟ: ถ่ายตัวเลขช่องกระจกหมุน'}
              </p>
            </div>
          )}

          {/* Floating Zoom Controls (1x, 1.5x, 2x) on viewfinder */}
          {liveStreamActive && !capturedImage && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center bg-[#180D2F]/80 backdrop-blur-md rounded-full p-1 border border-purple-500/30 shadow-xl z-10 gap-1">
              {[1, 1.5, 2].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setZoomLevel(lvl)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    zoomLevel === lvl
                      ? 'bg-purple-600 text-white shadow-md scale-105'
                      : 'text-purple-200/80 hover:text-white'
                  }`}
                >
                  {lvl}x
                </button>
              ))}
            </div>
          )}

          {/* 3. Captured Image Review State */}
          {capturedImage && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured Meter Reading"
                className="w-full h-full object-contain max-h-[60vh]"
              />

              {analyzing && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-purple-400 border-t-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-amber-400 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-white">
                      AI กำลังอ่านตัวเลขบนหน้าปัด...
                    </p>
                    <p className="text-xs text-purple-300 font-mono mt-0.5">
                      High-Speed Meter Vision OCR
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Stream Error or Fallback State */}
          {!liveStreamActive && !capturedImage && (
            <div className="p-6 max-w-md text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl mx-auto">
                📸
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  เลือกวิธีบันทึกภาพมิเตอร์ห้อง {roomNumber}
                </h4>
                {streamError && (
                  <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                    {streamError}
                  </p>
                )}
                <p className="text-xs text-purple-200/60">
                  ถ่ายภาพหน้าปัดให้เห็นตัวเลขชัดเจน เพื่อให้ระบบ AI สกัดตัวเลขอัตโนมัติ
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
                >
                  <span className="text-lg">📷</span>
                  <span>เปิดกล้องมือถือถ่ายภาพ (Native Camera)</span>
                </button>

                <button
                  type="button"
                  onClick={() => startLiveStream('environment')}
                  className="w-full py-3 px-4 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 font-bold text-xs border border-purple-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span className="text-base">🎥</span>
                  <span>ลองเปิดกล้องสดอีกครั้ง (Retry Live Camera)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Bottom Controls Panel */}
        <div className="p-4 sm:p-5 bg-[#180D2F]/95 border-t border-purple-500/20 shrink-0 z-20 space-y-4">
          
          {/* A. Controls during active live stream: Prominent Shutter + Native Camera */}
          {liveStreamActive && !capturedImage && (
            <div className="flex items-center justify-between gap-3">
              {/* Native camera trigger button */}
              <button
                type="button"
                onClick={() => {
                  stopLiveStream();
                  fileInputRef.current?.click();
                }}
                className="flex-1 py-3 px-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 font-bold text-xs border border-purple-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
              >
                <span className="text-base">📷</span>
                <span>กล้องมือถือชัดสูง</span>
              </button>

              {/* Big Ergonomic Camera Shutter Button */}
              <button
                type="button"
                onClick={captureLiveFrame}
                title="กดถ่ายภาพและอ่านตัวเลข"
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 cursor-pointer transition-transform active:scale-90 shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
              >
                <div className="w-full h-full rounded-full bg-white hover:bg-purple-300 active:bg-purple-400 transition-colors flex items-center justify-center text-slate-950 text-xl font-bold">
                  📸
                </div>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  stopLiveStream();
                  onClose();
                }}
                className="flex-1 py-3 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <span>✕ ยกเลิก</span>
              </button>
            </div>
          )}

          {/* B. Controls during Captured Image Review & OCR Result Verification */}
          {capturedImage && (
            <div className="space-y-3">
              
              {/* Retake and Engine status bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startLiveStream(facingMode)}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-purple-500/20 transition-all"
                  >
                    <span>🔄 ถ่ายใหม่ (กล้องสด)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/5 transition-all"
                  >
                    <span>📷 กล้องมือถือ</span>
                  </button>
                </div>

                {engineUsed && (
                  <span className="text-[10px] font-mono text-purple-300/60 bg-purple-950/60 border border-purple-500/20 px-2 py-1 rounded-md">
                    Speed: {engineUsed}
                  </span>
                )}
              </div>

              {/* Number Input & Delta calculation */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0E071D] border border-purple-500/25 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🔢</span>
                    <span>ตัวเลขมิเตอร์ที่อ่านได้:</span>
                  </label>
                  <span className="text-[11px] text-purple-300 font-mono">
                    งวดก่อน: <strong className="text-amber-400">{previousReading}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="any"
                      value={detectedReading}
                      onChange={(e) => setDetectedReading(e.target.value)}
                      placeholder="กรอกตัวเลขหน้าปัด"
                      className="w-full px-4 py-3 bg-[#180D2F] border border-purple-400/50 focus:border-amber-400 rounded-xl text-xl sm:text-2xl font-black text-amber-300 font-mono outline-none shadow-inner tracking-wider"
                    />
                  </div>

                  <div className="text-right shrink-0 bg-[#180D2F] px-3 py-2 rounded-xl border border-purple-500/20 min-w-[90px]">
                    <span className="text-[10px] text-purple-300/70 block font-bold">ใช้ไปงวดนี้</span>
                    <span className={`text-base font-black font-mono ${
                      unitsDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {unitsDelta >= 0 ? `+${unitsDelta}` : unitsDelta}
                    </span>
                    <span className="text-[10px] text-purple-300/70 ml-1">หน่วย</span>
                  </div>
                </div>

                {/* Warning message if any */}
                {warning && (
                  <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl leading-relaxed">
                    ⚠️ {warning}
                  </p>
                )}
              </div>

              {/* Confirm Save Button in UP Purple & Gold */}
              <button
                type="button"
                onClick={handleSave}
                disabled={analyzing || !detectedReading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 disabled:opacity-40 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>💾</span>
                <span>บันทึกตัวเลขมิเตอร์ห้อง {roomNumber}</span>
              </button>
            </div>
          )}

        </div>

      </div>

      <style jsx>{`
        @keyframes meterScan {
          0% {
            top: 4%;
            opacity: 0.2;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            top: 94%;
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}
