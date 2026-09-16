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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 sm:backdrop-blur-md animate-in fade-in p-0 sm:p-4">
      {/* Hidden Native Camera Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Container: Guaranteed never to overflow viewport */}
      <div className="flex flex-col w-full h-[100dvh] sm:h-[88vh] sm:max-h-[720px] sm:max-w-lg bg-[#0E071D] sm:border sm:border-purple-500/25 sm:rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* 1. Clean, Compact Header Bar */}
        <div className="h-14 px-4 bg-[#180D2F] border-b border-purple-500/20 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
              isWater 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isWater ? '💧' : '⚡'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  สแกน{typeLabel} <span className="text-amber-400 font-mono">ห้อง {roomNumber}</span>
                </h3>
              </div>
              <p className="text-[10px] text-purple-300/70 font-mono leading-none">
                งวดก่อน: <span className="text-amber-300 font-bold">{previousReading}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Torch button */}
            {liveStreamActive && !capturedImage && hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                title={torchOn ? 'ปิดไฟฉาย' : 'เปิดไฟฉาย'}
                className={`p-2 rounded-xl text-xs flex items-center transition-all cursor-pointer ${
                  torchOn
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                    : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                🔦
              </button>
            )}

            {/* Camera Switch button */}
            {liveStreamActive && !capturedImage && (
              <button
                type="button"
                onClick={toggleFacingMode}
                title="สลับกล้องหน้า/หลัง"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs transition-all cursor-pointer"
              >
                🔄
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                stopLiveStream();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. Camera Viewfinder Area (flex-1 min-h-0 guarantees it shrinks properly) */}
        <div className="flex-1 min-h-0 relative w-full bg-black flex items-center justify-center overflow-hidden">
          
          {/* Always-mounted Video Element */}
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

          {/* Clean, Sleek Aiming Reticle */}
          {liveStreamActive && !capturedImage && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              
              {/* Minimal Hint Pill */}
              <div className="mb-3 px-3 py-1 rounded-full bg-[#180D2F]/80 backdrop-blur-sm border border-purple-400/30 shadow flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[11px] font-bold text-purple-200">
                  วางตัวเลขมิเตอร์ในกรอบ
                </span>
              </div>

              {/* Viewfinder Aim Box */}
              <div className="w-[85%] max-w-sm h-36 sm:h-44 relative rounded-xl border border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.25)] bg-purple-950/10 overflow-hidden">
                {/* 4 Corner Brackets */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-purple-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-amber-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-amber-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-purple-400 rounded-br-lg" />

                {/* Laser scan animation */}
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-amber-300 shadow-[0_0_10px_#c084fc]"
                  style={{ animation: 'meterScan 2s ease-in-out infinite' }}
                />
              </div>

              {/* Minimal Zoom Toggle */}
              <div className="pointer-events-auto mt-3 flex items-center bg-[#180D2F]/85 backdrop-blur-sm rounded-full p-0.5 border border-purple-500/30 gap-1">
                {[1, 1.5, 2].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setZoomLevel(lvl)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      zoomLevel === lvl
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-purple-200/70 hover:text-white'
                    }`}
                  >
                    {lvl}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Captured Image Review */}
          {capturedImage && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured Meter"
                className="w-full h-full object-contain"
              />

              {analyzing && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5">
                  <div className="w-10 h-10 rounded-full border-3 border-purple-400 border-t-transparent animate-spin" />
                  <p className="text-xs font-bold text-white tracking-wide">
                    AI กำลังอ่านตัวเลขหน้าปัด...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Stream Error or Fallback State */}
          {!liveStreamActive && !capturedImage && (
            <div className="p-4 max-w-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mx-auto">
                📸
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  ถ่ายภาพมิเตอร์ห้อง {roomNumber}
                </h4>
                {streamError && (
                  <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl mt-1.5">
                    {streamError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>📷</span>
                  <span>เปิดกล้องมือถือถ่ายภาพ</span>
                </button>

                <button
                  type="button"
                  onClick={() => startLiveStream('environment')}
                  className="w-full py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 font-bold text-xs border border-purple-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🎥</span>
                  <span>ลองเปิดกล้องสดอีกครั้ง</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Clean, Non-Overflowing Bottom Controls Panel */}
        <div className="p-3 sm:p-4 bg-[#180D2F] border-t border-purple-500/20 shrink-0 z-20">
          
          {/* A. Live Stream Controls: Clean 3-part action */}
          {liveStreamActive && !capturedImage && (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  stopLiveStream();
                  fileInputRef.current?.click();
                }}
                className="flex-1 py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📷</span>
                <span>กล้องมือถือ</span>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={captureLiveFrame}
                title="กดถ่ายภาพและอ่านตัวเลข"
                className="w-15 h-15 rounded-full border-3 border-white/90 flex items-center justify-center p-1 cursor-pointer transition-transform active:scale-90 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              >
                <div className="w-full h-full rounded-full bg-white hover:bg-purple-200 transition-colors flex items-center justify-center text-slate-950 text-lg">
                  📸
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopLiveStream();
                  onClose();
                }}
                className="flex-1 py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs border border-white/10 flex items-center justify-center cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>
          )}

          {/* B. Review & Result Controls */}
          {capturedImage && (
            <div className="space-y-2.5">
              {/* Header row: Retake & cycle info */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => startLiveStream(facingMode)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-purple-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer border border-white/10"
                >
                  <span>🔄 ถ่ายใหม่</span>
                </button>

                <span className="text-[11px] text-purple-300/80 font-mono">
                  งวดก่อน: <strong className="text-amber-400">{previousReading}</strong>
                </span>
              </div>

              {/* Input & Units delta row */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="any"
                    value={detectedReading}
                    onChange={(e) => setDetectedReading(e.target.value)}
                    placeholder="กรอกเลขหน้าปัด"
                    className="w-full px-3.5 py-2.5 bg-[#0E071D] border border-purple-400/50 focus:border-amber-400 rounded-xl text-xl font-black text-amber-300 font-mono outline-none shadow-inner"
                  />
                </div>

                <div className="shrink-0 bg-[#0E071D] px-3 py-2 rounded-xl border border-purple-500/20 text-right min-w-[80px]">
                  <span className="text-[9px] text-purple-300/70 block font-bold">ใช้ไปงวดนี้</span>
                  <span className={`text-sm font-black font-mono ${
                    unitsDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {unitsDelta >= 0 ? `+${unitsDelta.toFixed(1)}` : unitsDelta.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-purple-300/70 ml-0.5">หน.</span>
                </div>
              </div>

              {/* Warning if any */}
              {warning && (
                <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg leading-tight">
                  ⚠️ {warning}
                </p>
              )}

              {/* Big Confirm Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={analyzing || !detectedReading}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
            top: 6%;
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 92%;
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
