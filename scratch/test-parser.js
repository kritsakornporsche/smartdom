function parseMeterDigits(rawText, previousReading) {
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
  console.log('matches in file:', matches);
}

parseMeterDigits('Sanwa SV15 0 0 1 8 4 m3 2026', 180);
parseMeterDigits('Mitsubishi MF-33E 220V 50Hz 0 1 2 4 5 . 8 kWh', 1240);
