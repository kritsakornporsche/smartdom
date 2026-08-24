#!/usr/bin/env bash
# ============================================================================
# run_lighthouse_all.sh — รันการทดสอบ Google Lighthouse ทุกหน้าอัตโนมัติ
# ============================================================================

set -e

REPORT_DIR="./report"
mkdir -p "$REPORT_DIR"

URLS=(
  "explore http://localhost:3000/explore"
  "signin http://localhost:3000/signin"
  "owner http://localhost:3000/owner"
  "tenant http://localhost:3000/tenant"
  "bills http://localhost:3000/owner/billing"
)

echo "=== เริ่มต้นการทดสอบ Google Lighthouse ทุกหน้า ==="

for item in "${URLS[@]}"; do
  name=$(echo $item | awk '{print $1}')
  url=$(echo $item | awk '{print $2}')

  for mode in "desktop" "mobile"; do
    flags="--preset=desktop"
    if [ "$mode" = "mobile" ]; then
      flags="--form-factor=mobile --screenEmulation.mobile=true"
    fi

    for run in 1 2 3; do
      out_name="${name}_${mode}_run${run}"
      echo ">>> กำลังทดสอบ $name ($mode) รอบที่ $run -> $url"
      npx -y lighthouse "$url" \
        --output=html,json \
        --output-path="$REPORT_DIR/$out_name" \
        --chrome-flags="--headless --no-sandbox" \
        $flags \
        --quiet
    done
  done
done

echo "=== ทดสอบ Lighthouse เสร็จสมบูรณ์! ไฟล์ทั้งหมดอยู่ใน $REPORT_DIR ==="
