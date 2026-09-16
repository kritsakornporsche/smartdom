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
      await worker.setParameters({
        tessedit_pageseg_mode: '6' as any, // Uniform block of text (far more resilient for meter dials)
      });
      globalForOcr._ocrWorker = worker;
      return worker;
    })();
  }
  return globalForOcr._ocrWorkerPromise;
}

/**
 * Robust parser for utility meters:
 * 1. Handles mechanical rotating wheels with physical gaps e.g. "0 1 5 2 4" -> "01524"
 * 2. Handles decimal dots e.g. "00142 . 8" -> "142.8"
 * 3. Resolves common OCR letter misclassifications (O->0, l/I->1, S->5, B->8)
 * 4. Filters out noise (e.g. 220V, 50Hz, 5(15)A) by prioritizing numbers close to previous reading
 */
function parseMeterDigits(rawText: string, previousReading?: number | string | null): {
  reading: number | null;
  candidates: number[];
} {
  if (!rawText || typeof rawText !== 'string') {
    return { reading: null, candidates: [] };
  }

  // 1. Replace common visual character confusions in mechanical odometer meters
  let text = rawText
    .replace(/[Oo]/g, '0')
    .replace(/[Il|]/g, '1')
    .replace(/[Ss]/g, '5')
    .replace(/[Bb]/g, '8');

  // 2. Collapse spaced digits: mechanical meter wheels have gaps e.g. "0 1 5 2 4" -> "01524"
  let collapsed = text;
  while (/(\d)\s+(\d)/.test(collapsed)) {
    collapsed = collapsed.replace(/(\d)\s+(\d)/g, '$1$2');
  }
  // Decimal spaces e.g. "142 . 5" -> "142.5"
  collapsed = collapsed.replace(/(\d)\s*\.\s*(\d)/g, '$1.$2');

  const matches = collapsed.match(/\d+(\.\d+)?/g) || [];
  if (matches.length === 0) {
    return { reading: null, candidates: [] };
  }

  const candidates = matches
    .map(m => parseFloat(m))
    .filter(n => !isNaN(n) && n >= 0);

  if (candidates.length === 0) {
    return { reading: null, candidates: [] };
  }

  let chosen: number | null = null;

  if (previousReading !== undefined && previousReading !== null && previousReading !== '') {
    const prev = Number(previousReading);
    // 1. Look for a candidate >= prev and within reasonable monthly consumption (+2500 units)
    const valid = candidates.filter(n => n >= prev && n <= prev + 2500);
    if (valid.length > 0) {
      chosen = valid[0];
    } else {
      // 2. Look for any candidate >= prev
      const validLeeway = candidates.filter(n => n >= prev);
      if (validLeeway.length > 0) {
        chosen = validLeeway[0];
      } else {
        // 3. Fallback to reasonable positive candidates
        const reasonable = candidates.filter(n => n > 0 && n <= prev + 5000);
        if (reasonable.length > 0) {
          chosen = reasonable[0];
        }
      }
    }
  }

  if (chosen === null) {
    // Filter out standalone 0 if other non-zero numbers exist
    const nonZeros = candidates.filter(n => n > 0);
    chosen = nonZeros.length > 0 ? nonZeros[0] : candidates[0];
  }

  return { reading: chosen, candidates };
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
