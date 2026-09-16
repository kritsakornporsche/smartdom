const METER_NOISE_CONSTANTS = new Set([
  220, 230, 240, 380, 50, 60, 100, 1200, 1600, 2400, 3200, 4064, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027
]);

function parseMeterDigits(rawText, previousReading) {
  if (!rawText || typeof rawText !== 'string') {
    return { reading: null, candidates: [] };
  }

  const prev = (previousReading !== undefined && previousReading !== null && previousReading !== '') 
    ? Number(previousReading) 
    : 0;

  // 1. Find sequences of spaced odometer digits: e.g. "0 0 1 8 4" or "0 1 2 4 5 . 8"
  // Match single digits separated by spaces: "0 0 1 8 4" -> "00184"
  let processed = rawText.replace(/\b([0-9])\s+([0-9])(?:\s+([0-9]))*(?:\s*\.\s*([0-9]))?\b/g, (match) => {
    return match.replace(/\s+/g, '');
  });

  // Also handle letter O / I / l when inside or adjacent to digit sequences
  processed = processed.replace(/(?<=\d)[Oo](?=\d)/g, '0')
                       .replace(/(?<=\d)[Il|](?=\d)/g, '1')
                       .replace(/\b[Oo]\b/g, '0');

  // Extract all numeric tokens (integers and decimals)
  const tokens = processed.match(/\d+(?:\.\d+)?/g) || [];
  
  // Convert to numbers and remove noise
  const candidates = [];
  for (const t of tokens) {
    const num = parseFloat(t);
    if (isNaN(num)) continue;
    // Discard obvious non-meter constants
    if (METER_NOISE_CONSTANTS.has(num)) continue;
    // Discard single digits if they are standalone noise (e.g. 1 or 2) when larger numbers exist
    candidates.push(num);
  }

  // Deduplicate candidates
  const unique = Array.from(new Set(candidates));

  if (unique.length === 0) {
    return { reading: null, candidates: [] };
  }

  // Score candidates based on closeness to previous reading
  // Best candidate is >= prev, and diff is between 0 and 1500 (typical monthly consumption)
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
    // Boost 4-6 digit numbers which are standard meter odometer lengths
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

console.log('Sanwa Water Meter:', parseMeterDigits('SANWA SV15 1/2" 0 0 1 8 4 m3 2026', 180));
console.log('Mitsubishi Electric Meter:', parseMeterDigits('MITSUBISHI MF-33E 220V 50Hz 0 1 2 4 5 . 8 kWh', 1240));
console.log('Meter with noise:', parseMeterDigits('1 Phase 2 Wire 5(15)A 220V 50Hz 1200 rev/kWh No. 847291 00352 kWh', 345));
console.log('Asahi water meter:', parseMeterDigits('ASAHI 15mm 0 0 4 8 . 3 m3', 42));
