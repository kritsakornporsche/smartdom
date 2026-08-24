#!/usr/bin/env bash
# ============================================================================
# capture_lighthouse_screenshots.sh — แคปภาพหลักฐานจากรายงาน Lighthouse อัตโนมัติ
# ============================================================================
# ทำงานต่อจาก run_lighthouse_all.sh — อ่านไฟล์ .report.html ทุกไฟล์ในโฟลเดอร์
# ./report แล้วใช้ Chrome (ตัวเดียวกับที่ Lighthouse ใช้อยู่แล้ว) แคปภาพหน้าจอ
# ให้อัตโนมัติ ไม่ต้องเปิดเบราว์เซอร์เองทีละไฟล์
#
# วิธีใช้:
#   1) รัน run_lighthouse_all.sh ให้เสร็จก่อน (จะได้ไฟล์ .report.html ในโฟลเดอร์ report/)
#   2) รันคำสั่ง:  bash capture_lighthouse_screenshots.sh
#   3) ภาพจะถูกสร้างในโฟลเดอร์ ./report/screenshots/
#      ชื่อไฟล์ตรงกับชื่อรายงาน เช่น explore_desktop_run1.png
# ============================================================================

set -e

REPORT_DIR="./report"
OUT_DIR="./report/screenshots"
mkdir -p "$OUT_DIR"

# ถ้าสคริปต์หา Chrome เองไม่เจอ ให้ตั้งค่า path เต็มของ Chrome ตรงนี้เอง แล้วรันใหม่
# เช่น: CHROME_BIN="/c/Program Files/Google/Chrome/Application/chrome.exe"
CHROME_BIN_OVERRIDE=""

# ---------- หา Chrome ที่ติดตั้งอยู่ในเครื่อง (ลองทีละชื่อจนกว่าจะเจอ) ----------
find_chrome () {
  if [ -n "$CHROME_BIN_OVERRIDE" ]; then echo "$CHROME_BIN_OVERRIDE"; return; fi
  for candidate in \
    "google-chrome" "google-chrome-stable" "chromium" "chromium-browser" \
    "/usr/bin/google-chrome" "/usr/bin/chromium" \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/c/Program Files/Google/Chrome/Application/chrome.exe" \
    "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
  do
    if command -v "$candidate" >/dev/null 2>&1; then echo "$candidate"; return; fi
    if [ -x "$candidate" ]; then echo "$candidate"; return; fi
  done
  # ถ้า Lighthouse เคยดาวน์โหลด Chrome ของตัวเองไว้ (ผ่าน puppeteer cache) ให้ลองหาที่นั่นด้วย
  found=$(find "$HOME/.cache/puppeteer" -maxdepth 4 -type f -name "chrome" 2>/dev/null | head -1)
  if [ -n "$found" ]; then echo "$found"; return; fi
  echo ""
}

CHROME_BIN=$(find_chrome)
if [ -z "$CHROME_BIN" ]; then
  echo "!! หา Chrome ในเครื่องไม่เจอ กรุณาติดตั้ง Google Chrome ก่อน หรือแก้ตัวแปร CHROME_BIN ในสคริปต์นี้เอง"
  exit 1
fi
echo ">>> ใช้ Chrome ที่: $CHROME_BIN"

count=0
for html_file in "$REPORT_DIR"/*.report.html; do
  [ -e "$html_file" ] || continue
  base=$(basename "$html_file" .report.html)
  out_png="$OUT_DIR/${base}.png"
  abs_path=$(cd "$(dirname "$html_file")" && pwd)/$(basename "$html_file")

  echo ">>> กำลังแคปภาพ: $base"
  "$CHROME_BIN" --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size=1280,1400 \
    --screenshot="$out_png" \
    "file://$abs_path" >/dev/null 2>&1

  if [ -f "$out_png" ]; then
    count=$((count+1))
  else
    echo "   !! แคปภาพไฟล์นี้ไม่สำเร็จ: $base"
  fi
done

echo ""
echo "=== เสร็จสิ้น: แคปภาพสำเร็จ $count ไฟล์ อยู่ในโฟลเดอร์ $OUT_DIR ==="
echo "=== แนะนำ: เลือก 1 ภาพต่อ 1 หน้า/โหมด (รอบที่ค่าตรงกับ median_summary.csv มากที่สุด) ไปใช้ในแบบฟอร์ม ==="
