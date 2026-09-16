import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Global singleton worker to avoid 10-15s re-initialization on every request
const globalForOcr = globalThis as unknown as {
  _ocrWorkerPromise?: Promise<any>;
  _ocrWorker?: any;
};

async function getSharedOcrWorker() {
  if (globalForOcr._ocrWorker) {
    return globalForOcr._ocrWorker;
  }
  if (!globalForOcr._ocrWorkerPromise) {
    globalForOcr._ocrWorkerPromise = (async () => {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      // PSM 6 (single uniform block) handles multi-element dials, labels, and text reliably
      await worker.setParameters({
        tessedit_pageseg_mode: '6' as any,
      });
      globalForOcr._ocrWorker = worker;
      return worker;
    })();
  }
  return globalForOcr._ocrWorkerPromise;
}

// Known constant metadata on Thai meters to ignore (voltage, frequency, amp ratings, meter constants, years)
const METER_NOISE_CONSTANTS = new Set([
  220, 230, 240, 380, 50, 60, 100, 1200, 1600, 2400, 3200, 4064, 
  2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027
]);

/**
 * Robust parser for utility meters:
 * 1. Handles mechanical rotating wheels with single-digit gaps e.g. "0 0 1 8 4" -> "00184"
 * 2. Does NOT corrupt brand words (Sanwa, Mitsubishi) into numbers
 * 3. Filters out electrical ratings (220V, 50Hz, 1200r/kWh) and dates
 * 4. Scores candidates based on closeness to previous reading
 */
function parseMeterDigits(rawText: string, previousReading?: number | string | null): {
  reading: number | null;
  candidates: number[];
} {
  if (!rawText || typeof rawText !== 'string') {
    return { reading: null, candidates: [] };
  }

  const prev = (previousReading !== undefined && previousReading !== null && previousReading !== '') 
    ? Number(previousReading) 
    : 0;

  // 1. Find sequences of spaced odometer digits: e.g. "0 0 1 8 4" or "0 1 2 4 5 . 8"
  let processed = rawText.replace(/\b([0-9])\s+([0-9])(?:\s+([0-9]))*(?:\s*\.\s*([0-9]))?\b/g, (match) => {
    return match.replace(/\s+/g, '');
  });

  // Handle letter O / I / l when inside or adjacent to digit sequences
  processed = processed.replace(/(?<=\d)[Oo](?=\d)/g, '0')
                       .replace(/(?<=\d)[Il|](?=\d)/g, '1')
                       .replace(/\b[Oo]\b/g, '0');

  // Extract all numeric tokens (integers and decimals)
  const tokens = processed.match(/\d+(?:\.\d+)?/g) || [];
  
  // Convert to numbers and remove noise
  const candidates: number[] = [];
  for (const t of tokens) {
    const num = parseFloat(t);
    if (isNaN(num)) continue;
    if (METER_NOISE_CONSTANTS.has(num)) continue;
    candidates.push(num);
  }

  const unique = Array.from(new Set(candidates));

  if (unique.length === 0) {
    return { reading: null, candidates: [] };
  }

  // Score candidates based on closeness to previous reading
  const scored = unique.map(c => {
    let score = 0;
    const diff = c - prev;
    if (diff >= 0 && diff <= 500) {
      score += 100 - (diff / 10); // close positive delta is top priority
    } else if (diff > 500 && diff <= 2500) {
      score += 50 - (diff / 100);
    } else if (diff < 0 && Math.abs(diff) < 50) {
      score += 20; // slight OCR under-read
    } else {
      score += 5;
    }
    // Boost 3-6 digit numbers which are standard meter odometer lengths
    const digitCount = Math.floor(c).toString().length;
    if (digitCount >= 3 && digitCount <= 6) {
      score += 15;
    }
    return { candidate: c, score, diff };
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    reading: scored[0].candidate,
    candidates: scored.map(s => s.candidate),
  };
}

export async function POST(req: Request) {
  try {
    // Permissive session check (never return 401 for OCR utility)
    try {
      await auth();
    } catch {
      // ignore
    }

    const { image, previous_reading, type } = await req.json();

    if (!image) {
      return NextResponse.json({ success: false, message: 'Image data is required' }, { status: 400 });
    }

    let detectedNumber: number | null = null;
    let rawText = '';
    let confidence = 0;
    let engineUsed = 'tesseract-smart';
    let allCandidates: number[] = [];

    // 1. Try Gemini Vision if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Read the utility meter dial counter display (${type || 'meter'}). Return ONLY valid JSON: { "reading": 1234.5, "confidence": 0.95 } without markdown formatting. Previous reading was ${previous_reading || 0}. If unreadable, return { "reading": null, "confidence": 0 }`,
                    },
                    {
                      inline_data: {
                        mime_type: 'image/jpeg',
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );
        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && typeof parsed.reading === 'number') {
            detectedNumber = parsed.reading;
            confidence = parsed.confidence || 0.95;
            engineUsed = 'gemini-1.5-flash';
          }
        }
      } catch {
        // Fallback to local OCR worker
      }
    }

    // 2. High-Speed Local Tesseract OCR with Smart Spaced-Dial Parser
    if (detectedNumber === null) {
      try {
        const base64Buffer = Buffer.from(
          image.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        );

        const worker = await getSharedOcrWorker();
        const ret = await worker.recognize(base64Buffer);

        rawText = ret.data.text ? ret.data.text.trim() : '';
        confidence = ret.data.confidence;

        const parsed = parseMeterDigits(rawText, previous_reading);
        detectedNumber = parsed.reading;
        allCandidates = parsed.candidates;
      } catch (tessErr: any) {
        console.warn('Tesseract OCR error:', tessErr);
      }
    }

    // Sanity checks and warnings
    let warning: string | null = null;
    if (detectedNumber !== null && previous_reading !== undefined && previous_reading !== null && previous_reading !== '') {
      const prev = Number(previous_reading);
      if (detectedNumber < prev) {
        warning = `ตัวเลขที่ตรวจพบ (${detectedNumber}) น้อยกว่างวดก่อน (${prev}) กรุณาตรวจสอบหรือแตะแก้ไขตัวเลข`;
      } else if (detectedNumber - prev > 800) {
        warning = `หน่วยที่ใช้ (${(detectedNumber - prev).toFixed(1)} หน่วย) สูงกว่าปกติ กรุณายืนยันความถูกต้อง`;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reading: detectedNumber,
        rawText,
        confidence,
        warning,
        candidates: allCandidates,
        engine: engineUsed,
      },
    });
  } catch (err: any) {
    console.error('API OCR error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
