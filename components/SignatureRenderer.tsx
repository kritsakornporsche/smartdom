'use client';

import React, { useEffect, useRef } from 'react';

export default function SignatureRenderer({ dataUrl }: { dataUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!dataUrl || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Match high resolution source for crisp rendering
      canvas.width = img.width || 800;
      canvas.height = img.height || 400;
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }, [dataUrl]);

  return (
    // We use a canvas because html2canvas captures HTML5 Canvas elements with 100% reliability
    // compared to img tags with base64 which often get skipped due to async image painting bugs.
    <canvas 
      ref={canvasRef} 
      className="h-24 w-auto" 
      title="Signature"
    />
  );
}
