# 📈 บันทึกความคืบหน้าการพัฒนาระบบ SmartDom (Progress Log)

**อัปเดตล่าสุด:** 29 สิงหาคม 2026  
**เวอร์ชันปัจจุบัน:** `v2.4.0-b119` (`ylxlwz`)  
**สถานะเซิร์ฟเวอร์:** 🟢 Online (PM2 Production Server: `http://kritsakorn.thddns.net:5993`)

---

## 🚀 สรุปงานที่พัฒนาและปรับปรุงล่าสุด (29 สิงหาคม 2026)

### 1. ระบบจัดการการจองห้องพักครบวงจรสำหรับเจ้าของหอพัก (`/owner/bookings`)
- **เมนูและทางลัดใหม่:** เพิ่มเมนู `🛎️ รายการจองห้องพัก` ใน Sidebar และปุ่มด่วนบนแดชบอร์ดเจ้าของหอพัก
- **การ์ดสถิติภาพรวม (Stat Metrics):**
  - แสดงจำนวนรายการที่รอดำเนินการ (Pending)
  - คำนวณยอดรวมเงินประกัน 1 เดือนที่รอตรวจสอบ
  - แสดงสัญญาที่เปิดใช้งานแล้ว (Active) และประวัติการจองทั้งหมด
- **ฟังก์ชันการจัดการคำขอจอง (Management Suite):**
  - **อนุมัติการจอง (Approve):** ปรับสถานะสัญญาเป็น `Active`, ปรับห้องพักเป็น `Occupied`, อัปเกรดบทบาทผู้ใช้เป็นผู้เช่า พร้อมตัวเลือก **`[✓] ออกใบแจ้งหนี้ค่าเช่าเดือนแรกทันที`**
  - **ปฏิเสธการจอง (Reject):** ระบุเหตุผลการปฏิเสธ คืนสถานะห้องพักกลับเป็น `Available (ว่าง)` ทันที
  - **แก้ไขข้อมูลการจอง (Edit):** แก้ไขชื่อผู้จอง, เบอร์โทร, วันที่สัญญา, ยอดเงินประกัน, และย้ายห้องพักได้
  - **เพิ่มการจอง Walk-in (Manual Booking):** เพิ่มการจองโดยตรงสำหรับนักศึกษาที่มาติดต่อหน้าร้าน พร้อมตัวเลือกอนุมัติทันที
  - **พิมพ์ใบรับเงินจอง (Print Receipt):** เอกสาร A4 สวยงาม แสดงยอดเงินประกัน 1 เดือน พร้อมปุ่มพิมพ์และบันทึกเป็น PDF
  - **ขยายดูสลิปโอนเงิน (Slip Viewer Modal):** ดูรูปสลิปพร้อมเพย์ขนาดเต็ม
- **รองรับหลายหอพัก (Multi-Dorm Selector):** มี Dropdown สลับดูรายการจองเฉพาะหอพัก หรือดูทุกหอพักรวมกัน (`All Dorms`)

---

### 2. ปรับปรุงการแสดงผลฝั่ง Mobile iOS (Apple HIG & Responsive Design)
- **การเลื่อนหน้าจอที่ลื่นไหล:** เพิ่มคลาส `-webkit-overflow-scrolling: touch` พร้อม `overflow-y-auto` และ Safe area padding (`pb-32`)
- **ป้องกัน Safari Auto-Zoom:** กำหนดขนาดฟอนต์ช่องกรอกข้อมูล (`<input>`, `<select>`, `<textarea>`) ขั้นต่ำ 16px
- **Touch Targets 44px:** ขยายขนาดปุ่มกดทั้งหมดให้แตะง่ายตามมาตรฐาน iOS
- **ปุ่มโทรออกด่วน:** เพิ่มปุ่ม `📞 โทรออก` ข้างเบอร์โทรผู้จอง เพื่อกดโทรออกผ่านระบบ iOS ได้ทันที
- **iOS Segmented Control Tabs:** ปรับแท็บสถานะและ Filter Bar ให้ปัดเลื่อนซ้าย-ขวาได้อย่างนุ่มนวล

---

### 3. ระบบจองห้องพักและชำระเงินประกัน 1 เดือน (Guest Booking Flow)
- **นโยบายเงินประกัน 1 เดือน:** ปรับยอดชำระล่วงหน้าเหลือเฉพาะ **เงินประกัน 1 เดือน** (ไม่คิดค่าเช่าเดือนแรกตอนจอง ให้เจ้าของหอคิดตอนเข้าพัก)
- **สร้าง QR Code พร้อมเพย์อัตโนมัติ:** คำนวณยอดเงินประกันและดึงเบอร์ PromptPay ของหอพักมาสร้าง QR Code แบบเรียลไทม์
- **แนบสลิปโอนเงิน:** ระบบอัปโหลดรูปภาพสลิปและแสดงตัวอย่างทันทีก่อนกดยืนยันการจอง
- **หน้าตรวจสอบสถานะของผู้จอง (`/tenant`):** แสดงแบนเนอร์ติดตามสถานะการจอง 3 ขั้นตอน พร้อมปุ่มขอยกเลิกการจอง

---

### 4. ปรับปรุงระบบบิลค่าเช่าและการชำระเงิน (`/tenant/billing` & `/owner/billing`)
- **แก้ไขปัญหา `Unauthorized (401)`:** ปรับปรุง API `/api/tenant/billing/qr`, `/payment`, `/list` ให้จับคู่ผู้เช่าด้วย `user_id` และ `email` ข้ามทุกหอพักได้อย่างแม่นยำ
- **แก้ไข Error Database Column:** แก้ไขการดึงข้อมูลเบอร์พร้อมเพย์จาก `dormitory_profile` (`promptpay_number`, `promptpay_name`, `name`) ป้องกัน Error 500
- **ปรับปรุง API บิลฝั่งเจ้าของ:** อัปเดต `/api/owner/billing/[id]` และ `/api/owner/billing/batch` ให้รองรับการอัปเดตสลิปและการสร้างบิลอัตโนมัติทุกห้อง
- **Safe Guarded Chunk Reload Handler:** เพิ่ม Global Error Listener ใน `layout.tsx` จัดการ `ChunkLoadError` เมื่อมีการอัปเดตไฟล์บนเซิร์ฟเวอร์แบบไร้รอยต่อ

---

### 5. ระบบอัปเดตเวอร์ชันอัตโนมัติ (Auto-Increment Versioning)
- สคริปต์ `scripts/generate-version.js` ทำงานอัตโนมัติก่อน Build ทุกครั้ง (`prebuild`)
- สร้าง Version Badge ที่มุมขวาล่างของแอป เชื่อมต่อไปยังหน้ารายละเอียดการอัปเดต (`/updates`)
- ปัจจุบันทำงานอยู่ที่เวอร์ชัน **`v2.4.0-b116`**

---

## 📁 ไฟล์สำคัญที่สร้างและแก้ไข

| ไฟล์ | รายละเอียด |
| :--- | :--- |
| `app/owner/bookings/page.tsx` | หน้าศูนย์จัดการการจองห้องพักของเจ้าของหอพัก (Responsive + iOS Optimized) |
| `app/api/owner/bookings/route.ts` | API สำหรับ Approve, Reject, Edit, Walk-in Create, Delete การจอง |
| `app/owner/components/OwnerSidebar.tsx` | เพิ่มเมนู `🛎️ รายการจองห้องพัก` ในแถบนำทาง |
| `app/owner/page.tsx` | เพิ่มปุ่มทางลัดไปยังหน้ารายการจองห้องพัก |
| `app/api/tenant/billing/qr/route.ts` | API สร้าง PromptPay QR Code สำหรับชำระบิลรายเดือน |
| `app/api/tenant/billing/payment/route.ts` | API แนบสลิปชำระบิลรายเดือน |
| `app/api/tenant/billing/list/route.ts` | API รายการบิลของผู้เช่า รองรับ multi-match |
| `app/tenant/billing/page.tsx` | หน้ารายการบิลและการชำระเงินของผู้เช่า |
| `app/api/owner/billing/[id]/route.ts` | API อัปเดตสถานะและข้อมูลบิลของเจ้าของ |
| `app/api/owner/billing/batch/route.ts` | API ออกบิลค่าเช่าอัตโนมัติแบบกลุ่ม |
| `app/layout.tsx` | เพิ่ม Safe guarded chunk reload handler |
| `app/explore/room/[id]/page.tsx` | หน้าจองห้องพักพร้อมระบบสร้าง QR และแนบสลิปเงินประกัน 1 เดือน |
| `app/api/booking/qr/route.ts` | API สร้าง QR Code เงินประกันการจองห้องพัก |
| `app/api/booking/cancel/route.ts` | API ขอยกเลิกการจองห้องพักของผู้จอง |
| `app/tenant/page.tsx` | แดชบอร์ดผู้จอง/ผู้เช่า พร้อมแทร็กเกอร์สถานะการจอง |
| `scripts/generate-version.js` | สคริปต์ Auto-Increment Versioning |
| `scripts/restart-server.js` | สคริปต์สั่ง Restart Next.js บน PM2 พร้อม Health Check |
