import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { image, previous_reading, type } = await req.json();

    if (!image) {
      return NextResponse.json({ success: false, message: 'Image data is required' }, { status: 400 });
    }

    let detectedNumber: number | null = null;
    let rawText = '';
    let confidence = 0;
    let engineUsed = 'tesseract';

    // 1. Try Gemini Vision if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an expert utility meter reader. Analyze this image of a ${type || 'utility'} meter (water/electric). Read the current numerical reading display (digits on the dials or digital counter, integers only). Return a JSON object with: { "reading": 1234, "confidence": 0.95 } without any markdown backticks. If unreadable, return { "reading": null, "confidence": 0 }`,
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
      } catch (geminiErr) {
        console.warn('Gemini vision error, falling back to local OCR:', geminiErr);
      }
    }

    // 2. Fallback to Tesseract.js (On-Device / Server-Side Node OCR)
    if (detectedNumber === null) {
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789.',
        });

        const base64Buffer = Buffer.from(
          image.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        );

        const ret = await worker.recognize(base64Buffer);
        await worker.terminate();

        rawText = ret.data.text.trim();
        confidence = ret.data.confidence;

        // Extract continuous digit sequences
        const matches = rawText.match(/\d+(\.\d+)?/g);
        if (matches && matches.length > 0) {
          // Sort candidates by length or closeness to previous reading
          const candidates = matches.map(m => parseFloat(m)).filter(n => !isNaN(n) && n > 0);
          if (candidates.length > 0) {
            if (previous_reading !== undefined && previous_reading !== null) {
              const prev = Number(previous_reading);
              // Pick candidate that is >= prev and within reasonable range
              const validCandidates = candidates.filter(c => c >= prev && c <= prev + 2000);
              detectedNumber = validCandidates.length > 0 ? validCandidates[0] : candidates[0];
            } else {
              detectedNumber = candidates[0];
            }
          }
        }
      } catch (tessErr: any) {
        console.error('Tesseract OCR error:', tessErr);
      }
    }

    // Sanity checks
    let warning: string | null = null;
    if (detectedNumber !== null && previous_reading !== undefined && previous_reading !== null) {
      const prev = Number(previous_reading);
      if (detectedNumber < prev) {
        warning = `ตัวเลขที่ตรวจพบ (${detectedNumber}) น้อยกว่าเลขงวดก่อน (${prev}) กรุณาตรวจสอบอีกครั้ง`;
      } else if (detectedNumber - prev > 800) {
        warning = `หน่วยการใช้ (${(detectedNumber - prev).toFixed(0)} หน่วย) สูงผิดปกติ กรุณายืนยันความถูกต้อง`;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reading: detectedNumber,
        rawText,
        confidence,
        warning,
        engine: engineUsed,
      },
    });
  } catch (err: any) {
    console.error('API OCR error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
