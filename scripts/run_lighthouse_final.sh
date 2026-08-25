#!/usr/bin/env bash
# ============================================================================
# run_lighthouse_final.sh
# เส้นทางที่แนะนำที่สุด: URL จริงของหอพัก + ส่ง Cookie ล็อกอินให้ Lighthouse
# (แก้ปัญหาหน้า Owner/Tenant ที่เคยวัดได้แค่หน้า Loading เพราะไม่ได้ล็อกอิน)
# + แคปภาพหลักฐานอัตโนมัติ ครบในคำสั่งเดียว
# ============================================================================
#
# ปัญหาที่สคริปต์นี้แก้ (เทียบกับรอบก่อนหน้า):
#   1) วัดจาก localhost -> เปลี่ยนเป็น URL จริงที่หอพักใช้งาน (มี safety guard
#      กันเผลอแก้กลับเป็น localhost)
#   2) หน้า Owner/Tenant/Bills ต้องล็อกอินก่อนถึงจะเห็นข้อมูลจริง -> สคริปต์นี้
#      ส่ง Cookie ของผู้ใช้ที่ล็อกอินแล้วไปกับทุก request ผ่าน --extra-headers
#      (วิธีนี้ทดสอบแล้วว่าใช้งานได้จริงกับ Lighthouse CLI)
#
# ============================================================================
# ขั้นตอนเตรียม Cookie ก่อนรันสคริปต์ (ทำครั้งเดียวก่อนเริ่ม):
#
#   1) เปิด Chrome (ไม่ต้อง Incognito) เข้า BASE_URL ด้านล่าง แล้วล็อกอิน
#      ด้วยบัญชี Owner (เช่น owner@kaset2.com)
#   2) กด F12 เปิด DevTools -> แท็บ Application -> ด้านซ้าย Cookies
#      -> เลือกโดเมนของเว็บ
#   3) หาแถวชื่อ "next-auth.session-token" (หรือ "__Secure-next-auth.session-token"
#      ถ้าเว็บเป็น https) คัดลอกค่าในคอลัมน์ Value ทั้งหมด (เป็นข้อความยาว ๆ)
#   4) วางค่านั้นแทนที่ OWNER_COOKIE_VALUE ด้านล่าง
#   5) ล็อกเอาต์ แล้วล็อกอินใหม่ด้วยบัญชี Tenant (เช่น tenant@kaset2.com)
#      ทำซ้ำขั้นตอน 2-3 แล้ววางค่าแทนที่ TENANT_COOKIE_VALUE ด้านล่าง
#
#   หมายเหตุ: Cookie มีอายุจำกัด (ปกติหลายชั่วโมงถึงหลายวันแล้วแต่การตั้งค่า
#   NextAuth) ถ้ารันสคริปต์แล้วหน้า Owner/Tenant ยังเจอ Loading อยู่ ให้กลับไป
#   ล็อกอินใหม่แล้วคัดลอก Cookie มาใส่ใหม่อีกครั้ง
# ============================================================================

set -e

# ---------- ตั้งค่าตรงนี้ก่อนรัน ----------
BASE_URL="http://kritsakorn.thddns.net:5993"
OWNER_COOKIE_VALUE="eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiTW5PeFdrbXgwTnlFT0xhMW1oT1ItdGNSV3p6Q0VCTjdmT0N0d054b1FLeVBPNXhkc3RJWC1zSHpmTnpkbm53bEtsS2lablQ4anAxQkNsTEJNa2lROVEifQ..wjBlKryN1UepQnJWyGus3g.UTqxXPS1V6sFpEXjbR9hEEo6_8tP8fUmXRU88LfAkWXJ1GgJPIon12omRjPFkryJ6VybxBM_n3-BalLEYa_Lal6FrQqDiB-X8hIEm71PQmYC5Uv4uZWxvGjmXLsu8zP9QzWYf0rZtLjHfGM0CgqUypC7Dzjfrr6_9YmxPZ268qx5nnB7cLTrYmqtnrwdJ7DpOgEm6u2CB6YcyDVpwqW2FgyXTIu0RXTs9WqXl7g4MABOKkUWuJQyXF4WhzIBRNeHEgIQp0IiXXhNcoFDPlMK3YHE1HGyV90gOBsPqhN_AmmFqb_2Wdre6Qj6vh_1bhc6tRt7rN0gYGoqjgHloeYK6w.gQRU5X_R8mkyYfsQxzx9Y9QWRUS0_WMe7CxkJ5S-ZzA"
TENANT_COOKIE_VALUE="eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiTW5PeFdrbXgwTnlFT0xhMW1oT1ItdGNSV3p6Q0VCTjdmT0N0d054b1FLeVBPNXhkc3RJWC1zSHpmTnpkbm53bEtsS2lablQ4anAxQkNsTEJNa2lROVEifQ..Q6S4R4GXWIEyiTZMdf6Iyw.ABqW_X9_DphK1vsqeno7Aqyn-t0VaNjgs1imxEQvUqRrNn_qpcgFTIX7l79G3Yz7mbe0PvkUOKHT_xdsz_uDFKoh46_Z7EOXCSuiG7uCHNhvIvme_76qilDKGshg-gjcLzIg9E9qtK8q699S1vFHGxHuIYUvWXBziEk8Y19FyQWyGAn9uPaX74JSdMOjfUR-ZmZ9D_J7niml6nqMpqaTDH4_3VBhGd2XE4CYsA0ECR3kQrAfeK52ufWOE2pKH6b2QnMz8tXW8C8g6gLcT7irQKuhacvdCUnudbGyZlEACH4sSFq6iG9uXQBFoSUVaxJQ_JeXah9KQcxrNWyXS6fo-g.giMn-CLcoi3tXF1rMC0hYEFQKIqNuEgSyvutNN2Koc8"
COOKIE_NAME="authjs.session-token"
# -------------------------------------------

# ---------- ตัวป้องกันไม่ให้เผลอใช้ localhost ----------
if [[ "$BASE_URL" == *"localhost"* ]] || [[ "$BASE_URL" == *"127.0.0.1"* ]]; then
  echo "!! ห้ามใช้ localhost — ต้องเป็น URL จริงที่หอพักใช้งานเท่านั้น"
  exit 1
fi

# ---------- ตัวเช็คว่าใส่ Cookie แล้วหรือยัง ----------
if [[ "$OWNER_COOKIE_VALUE" == "แปะค่า"* ]] || [[ "$TENANT_COOKIE_VALUE" == "แปะค่า"* ]]; then
  echo "!! ยังไม่ได้ใส่ค่า Cookie จริง — เปิดไฟล์นี้แล้วแก้ OWNER_COOKIE_VALUE"
  echo "   และ TENANT_COOKIE_VALUE ตามขั้นตอนที่อธิบายไว้ด้านบนของไฟล์ก่อน"
  exit 1
fi

echo ">>> จะทดสอบผ่าน URL จริง: $BASE_URL"
sleep 2

# key = ชื่อหน้า, value = "path|คุกกี้ที่ต้องใช้ (owner/tenant/none)"
declare -A PAGES=(
  ["explore"]="/explore|none"
  ["signin"]="/signin|none"
  ["owner"]="/owner|owner"
  ["tenant"]="/tenant|tenant"
  ["bills"]="/tenant/billing|tenant"
)
RUNS_PER_PAGE=3

OUT="./report_final"
mkdir -p "$OUT"
SUMMARY="$OUT/summary.csv"
echo "page,device,run,performance,lcp_s,cls,tbt_ms,tested_url,used_auth" > "$SUMMARY"

run_one () {
  local name="$1" path="$2" auth="$3" device="$4" run="$5"
  local url="${BASE_URL}${path}"
  local prefix="${OUT}/${name}_${device}_run${run}"
  local preset_flag=""
  if [ "$device" = "desktop" ]; then preset_flag="--preset=desktop"; fi

  local cookie_flag=""
  if [ "$auth" = "owner" ]; then
    cookie_flag="--extra-headers={\"Cookie\":\"${COOKIE_NAME}=${OWNER_COOKIE_VALUE}\"}"
  elif [ "$auth" = "tenant" ]; then
    cookie_flag="--extra-headers={\"Cookie\":\"${COOKIE_NAME}=${TENANT_COOKIE_VALUE}\"}"
  fi

  echo ">>> [$name/$device] รอบที่ $run (auth=$auth) $url"
  npx --yes lighthouse "$url" \
    --output=html --output=json \
    --output-path="$prefix" \
    --chrome-flags="--headless --no-sandbox" \
    --quiet $preset_flag $cookie_flag || { echo "!! รอบนี้ล้มเหลว ข้ามไปต่อ"; return; }

  node -e "
    const r = require('${prefix}.report.json');
    const perf = Math.round(r.categories.performance.score * 100);
    const lcp = (r.audits['largest-contentful-paint'].numericValue/1000).toFixed(2);
    const cls = r.audits['cumulative-layout-shift'].numericValue.toFixed(3);
    const tbt = Math.round(r.audits['total-blocking-time'].numericValue);
    console.log('${name},${device},${run},'+perf+','+lcp+','+cls+','+tbt+',${url},${auth}');
  " >> "$SUMMARY"
}

for name in "${!PAGES[@]}"; do
  IFS='|' read -r path auth <<< "${PAGES[$name]}"
  for device in desktop mobile; do
    for run in $(seq 1 $RUNS_PER_PAGE); do
      run_one "$name" "$path" "$auth" "$device" "$run"
    done
  done
done

echo ""
echo "=== รัน Lighthouse เสร็จสิ้น ==="

# ---------- ตรวจเบื้องต้นว่ามีหน้าไหนน่าจะยังติด Loading อยู่ไหม ----------
echo "=== ตรวจสอบว่ามีหน้าใดที่อาจยังไม่ได้ล็อกอิน (Cookie หมดอายุ) ==="
for f in "$OUT"/owner_*.report.json "$OUT"/tenant_*.report.json "$OUT"/bills_*.report.json; do
  [ -e "$f" ] || continue
  if grep -qi "กำลังโหลด\|loading\|กรุณาเข้าสู่ระบบ\|กรุณาล็อกอิน" "$f" 2>/dev/null; then
    echo "   !! $f อาจยังเจอหน้า Loading/ต้องล็อกอิน — ตรวจ Cookie อีกครั้ง"
  fi
done

echo ""
echo "=== กำลังคำนวณค่ามัธยฐาน ==="
python3 - << 'PYEOF'
import csv, statistics as st
from collections import defaultdict

rows = list(csv.DictReader(open("report_final/summary.csv")))
groups = defaultdict(list)
for r in rows:
    groups[(r["page"], r["device"])].append(r)

out = open("report_final/median_summary.csv", "w", newline="", encoding="utf-8")
w = csv.writer(out)
w.writerow(["page", "device", "performance_median", "lcp_s_median", "cls_median", "tbt_ms_median", "n_runs", "used_auth"])
for (page, device), items in sorted(groups.items()):
    perf = st.median(float(i["performance"]) for i in items)
    lcp = st.median(float(i["lcp_s"]) for i in items)
    cls = st.median(float(i["cls"]) for i in items)
    tbt = st.median(float(i["tbt_ms"]) for i in items)
    w.writerow([page, device, round(perf), lcp, cls, round(tbt), len(items), items[0]["used_auth"]])
out.close()
print("เขียนไฟล์ report_final/median_summary.csv แล้ว")
PYEOF

# ============================================================================
# แคปภาพหลักฐานอัตโนมัติ
# ============================================================================
echo ""
echo "=== เริ่มแคปภาพหลักฐาน ==="

SCREENSHOT_DIR="$OUT/screenshots"
mkdir -p "$SCREENSHOT_DIR"
CHROME_BIN_OVERRIDE=""

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
  found=$(find "$HOME/.cache/puppeteer" -maxdepth 4 -type f -name "chrome" 2>/dev/null | head -1)
  if [ -n "$found" ]; then echo "$found"; return; fi
  echo ""
}

CHROME_BIN=$(find_chrome)
if [ -z "$CHROME_BIN" ]; then
  echo "!! หา Chrome ในเครื่องไม่เจอ — เปิดไฟล์ .report.html เองแล้วแคปภาพแทน"
else
  echo ">>> ใช้ Chrome ที่: $CHROME_BIN"
  count=0
  for html_file in "$OUT"/*.report.html; do
    [ -e "$html_file" ] || continue
    base=$(basename "$html_file" .report.html)
    out_png="$SCREENSHOT_DIR/${base}.png"
    abs_path=$(cd "$(dirname "$html_file")" && pwd)/$(basename "$html_file")
    "$CHROME_BIN" --headless --disable-gpu --no-sandbox --hide-scrollbars \
      --window-size=1280,1400 --screenshot="$out_png" \
      "file://$abs_path" >/dev/null 2>&1
    [ -f "$out_png" ] && count=$((count+1))
  done
  echo ">>> แคปภาพสำเร็จ $count ไฟล์"
fi

echo ""
echo "================================================================"
echo " เสร็จสิ้น — ส่งกลับ 3 อย่าง:"
echo "   1) $OUT/median_summary.csv"
echo "   2) $OUT/*.report.json + .report.html"
echo "   3) $SCREENSHOT_DIR/*.png"
echo " ก่อนส่ง เปิดดู $OUT/screenshots/owner_desktop_run1.png และ"
echo " tenant_desktop_run1.png เองสักครั้งว่าเห็น Dashboard จริง"
echo " ไม่ใช่หน้า Loading — ถ้ายังเป็น Loading แปลว่า Cookie หมดอายุ ต้อง"
echo " เอา Cookie ใหม่มาใส่แล้วรันใหม่"
echo "================================================================"
