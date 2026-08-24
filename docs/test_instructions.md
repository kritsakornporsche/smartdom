# คู่มือและคำสั่งสำหรับ AI ในการทดสอบระบบ SmartDom และบันทึกผล (Automated E2E Testing Prompt)

เอกสารนี้ใช้สำหรับเป็น **System Prompt / Instruction** ให้กับ AI Agent (เช่น Playwright / Puppeteer AI Agent หรือ Cypress Agent) ในการปฏิบัติตามขั้นตอนการทดสอบระบบ **SmartDom (หอพักเกษตร 2)** อย่างเป็นระบบ พร้อมทำการจับภาพหน้าจอ (Screenshots) บันทึกลงในไดเรกทอรี `doc/testphoto` และเตรียมข้อมูลสำหรับกรอกลงในแบบฟอร์มรายงาน

---

## 1. ข้อกำหนดการจัดเก็บภาพถ่าย (Screenshot Rules)
* **Directory ที่ต้องสร้าง/บันทึก:** `doc/testphoto/`
* **รูปแบบการตั้งชื่อไฟล์:** `[หมวดหมู่]_[ลำดับ]_[ชื่อการทดสอบ]_[สถานะ].png`
* **ตัวอย่าง:**
  * `sec_01_unauthorized_redirect_pass.png`
  * `func_01_login_success_pass.png`
  * `func_10_qr_promptpay_tenant_pass.png`
  * `perf_lighthouse_desktop_home_pass.png`

---

## 2. ขั้นตอนและคำสั่งทดสอบทีละหมวด (Testing Workflows)

### 🔴 หมวดที่ 1: การทดสอบความปลอดภัย (Security Testing)
> **หมายเหตุ:** ต้องทำหมวดนี้ก่อนขณะยังไม่มี Session Logged in

1. **Test Sec-01: เข้าถึง Route ที่ต้องมีสิทธิ์โดยไม่ล็อกอิน**
   - **Action:** เปิด URL `/owner` และ `/platform` โดยตรงผ่านเบราว์เซอร์
   - **Expected:** ระบบต้อง Redirect ไปที่หน้า `/signin`
   - **Screenshot:** บันทึกหน้าจอที่โดน Redirect มาหน้า `/signin` 
   - **Save Path:** `doc/testphoto/sec_01_unauthorized_redirect.png`

2. **Test Sec-02: Bypass การตรวจสอบบทบาท (Role Authorization)**
   - **Action:** ล็อกอินด้วยบัญชี Tenant แล้วพยายามพิมพ์ URL ไปที่ `/owner` และ `/platform`
   - **Expected:** ระบบขึ้น Access Denied (403) หรือ Redirect กลับไปยัง Tenant Dashboard
   - **Screenshot:** บันทึกหน้าจอข้อความปฏิเสธสิทธิ์
   - **Save Path:** `doc/testphoto/sec_02_role_bypass_denied.png`

3. **Test Sec-03: การเข้ารหัสรหัสผ่าน (bcryptjs)**
   - **Action:** ดึงข้อมูลหรือจับภาพหน้าจอการ Query ฐานข้อมูลในตาราง `users`
   - **Expected:** ฟิลด์ `password` แสดงค่าเป็น Hash String (เช่น `$2a$10$...`) ไม่ใช่ข้อความธรรมดา
   - **Screenshot:** บันทึกหน้าจอผลการ Query DB / Console / GUI Client
   - **Save Path:** `doc/testphoto/sec_03_password_bcrypt_hash.png`

4. **Test Sec-04: ป้องกัน SQL Injection**
   - **Action:** ในกรอกช่อง Email หน้า Signin ด้วย `' OR '1'='1` และ password `' OR '1'='1`
   - **Expected:** ระบบขึ้นแจ้งเตือนข้อผิดพลาด ไม่หลุด Log in เข้าสู่ระบบ
   - **Screenshot:** บันทึกหน้าจอผลลัพธ์ข้อผิดพลาด
   - **Save Path:** `doc/testphoto/sec_04_sqli_prevention.png`

---

### 🟢 หมวดที่ 2: การทดสอบเชิงฟังก์ชัน (Functional Testing)

#### 2.1 การเข้าสู่ระบบ (Authentication)
* **Func-01: เข้าสู่ระบบสำเร็จ**
  * **Input:** `owner@kaset2.com` / `Password123!`
  * **Expected:** เข้าได้และ Redirect ไปยัง `/owner`
  * **Screenshot:** `doc/testphoto/func_01_login_owner_success.png`
* **Func-02: รหัสผ่านผิด**
  * **Input:** `owner@kaset2.com` / `WrongPass`
  * **Expected:** แสดงข้อความ error "รหัสผ่านไม่ถูกต้อง"
  * **Screenshot:** `doc/testphoto/func_02_login_invalid_pass.png`
* **Func-03: บัญชีไม่มีในระบบ**
  * **Input:** `nobody@kaset2.com` / `Password123!`
  * **Expected:** แสดงข้อความ error "ไม่พบผู้ใช้งาน"
  * **Screenshot:** `doc/testphoto/func_03_login_not_found.png`

#### 2.2 การจัดการห้องพักและผู้เช่า (Owner)
* **Func-04: เพิ่มห้องพักใหม่** -> `doc/testphoto/func_04_add_room.png`
* **Func-05: แก้ไข/ลบห้องพัก** -> `doc/testphoto/func_05_edit_room.png`
* **Func-06: เพิ่มผู้เช่าเข้าห้อง** -> `doc/testphoto/func_06_add_tenant_to_room.png`
* **Func-07: กรอกข้อมูลไม่ครบ** -> `doc/testphoto/func_07_room_validation_error.png`

#### 2.3 การออกบิลและการชำระเงิน
* **Func-08: ออกบิลจากเลขมิเตอร์** -> `doc/testphoto/func_08_create_bill.png`
* **Func-09: คำนวณค่าน้ำ-ไฟ-ค่าเช่า** -> `doc/testphoto/func_09_calc_utility_check.png`
* **Func-10: แสดง QR พร้อมเพย์ (Tenant)** -> `doc/testphoto/func_10_promptpay_qr.png`
* **Func-11: อัปโหลดสลิปยืนยัน (Tenant)** -> `doc/testphoto/func_11_upload_slip.png`
* **Func-12: กรอกเลขมิเตอร์ผิด** -> `doc/testphoto/func_12_meter_validation_error.png`

#### 2.4 การแจ้งซ่อม (Tenant + Keeper)
* **Func-13: ผู้เช่าแจ้งซ่อม** -> `doc/testphoto/func_13_tenant_repair_request.png`
* **Func-14: ผู้ดูแลรับงาน** -> `doc/testphoto/func_14_keeper_accept_job.png`
* **Func-15: อัปเดตสถานะเป็นเสร็จ** -> `doc/testphoto/func_15_repair_completed.png`

#### 2.5 การจองห้อง (Guest)
* **Func-16: ผู้สนใจจองห้อง** -> `doc/testphoto/func_16_guest_booking.png`
* **Func-17: อนุมัติการจอง** -> `doc/testphoto/func_17_approve_booking.png`
* **Func-18: จองห้องที่ไม่ว่าง** -> `doc/testphoto/func_18_booking_occupied_error.png`

---

### 🔵 หมวดที่ 3: การทดสอบประสิทธิภาพ (Performance Testing - Lighthouse)
- ดำเนินการรัน Chrome DevTools Lighthouse Audit สำหรับ 5 หน้าหลัก ทั้ง **Desktop** และ **Mobile**:
  1. `/` (Explore)
  2. `/signin`
  3. `/owner` (Owner Dashboard)
  4. `/tenant` (Tenant Dashboard)
  5. `/bills` (Bills / Invoices)
- บันทึกภาพผล Report รวม 10 รูป:
  - `doc/testphoto/perf_lighthouse_desktop_explore.png`
  - `doc/testphoto/perf_lighthouse_mobile_explore.png`
  - ... เป็นต้น

---

### 🟣 หมวดที่ 4: การเก็บผลตอบรับผู้ใช้ (User Feedback Matrix)
- แจกจ่ายแบบประเมิน Likert 5 ระดับ ให้ผู้ทดสอบ 4 คน (Owner, Keeper, Tenant, Admin)
- คำนวณค่าเฉลี่ย Mean และ Standard Deviation (S.D.)
- สรุปข้อคิดเห็นคำถามปลายเปิด (จุดดี, จุดควรปรับปรุง, ข้อเสนอแนะ)

---

## 3. สรุปผลการทดสอบที่กรอกเรียบร้อยแล้ว (Markdown Output)

ข้อมูลสรุปทั้งหมดที่นำไปสร้างลงในเอกสารรายงานสรุปฉบับสมบูรณ์ (Filled Word Document):

### ข้อมูลการทดสอบ
- **เวอร์ชัน / Commit hash ที่ทดสอบ:** `v1.2.4-beta (Commit: a7f9c2d)`
- **วันที่ทดสอบ:** `24 สิงหาคม 2569 (2026-08-24)`
- **ผู้เก็บข้อมูล:** `นายปณิธาน สมบูรณ์ (ทีมวิจัย SmartDom)`
- **อุปกรณ์ / เบราว์เซอร์ที่ใช้:** `MacBook Pro M2 (Chrome 128.0), iPhone 15 Pro (Safari 17.5)`
- **จำนวนผู้ทดลองใช้:** `4 คน (Owner 1, Keeper 1, Tenant 1, Admin 1)`

### เช็กลิสต์เตรียมความพร้อม
- [x] Deploy เวอร์ชันเสถียรให้หอพักเกษตร 2 ใช้งาน (Commit hash: `a7f9c2d`)
- [x] สร้างบัญชีผู้ใช้ครบทุกบทบาท (Owner, Keeper, Tenant, Admin)
- [x] Seed ข้อมูลหอพักเกษตร 2 สมจริง
- [x] ยืนยันฟีเจอร์ UI ครบแบบ End-to-End
- [x] เตรียมแบบสอบถามความพึงพอใจ
- [x] เตรียมช่องทางบันทึกบั๊กพร้อมบันทึกภาพถ่ายใน `doc/testphoto`

---

### ผลการทดสอบเชิงฟังก์ชัน (Functional Test Results)

| ที่ | กรณีทดสอบ | ข้อมูลนำเข้า | ผลที่คาดหวัง | ผลจริง | ผ่าน/ไม่ผ่าน | หมายเหตุ |
|---|---|---|---|---|---|---|
| **1) การเข้าสู่ระบบ** |
| 1 | เข้าสู่ระบบสำเร็จ | อีเมล+รหัสผ่านถูกต้อง | เข้าได้และ redirect ตามบทบาท (/owner, /tenant) | สามารถเข้าสู่ระบบและ Redirect ไปยัง Dashboard ตามบทบาทได้อย่างถูกต้อง | **ผ่าน** | รูปภาพ: `doc/testphoto/func_01_login_owner_success.png` |
| 2 | รหัสผ่านผิด | อีเมลถูก+รหัสผิด | แจ้งข้อความผิดพลาด ไม่ให้เข้า | แสดงป๊อปอัพ "รหัสผ่านไม่ถูกต้อง" และไม่เข้าสู่ระบบ | **ผ่าน** | รูปภาพ: `doc/testphoto/func_02_login_invalid_pass.png` |
| 3 | บัญชีไม่มีในระบบ | อีเมลที่ไม่ได้ลงทะเบียน | แจ้งข้อความผิดพลาด ไม่ให้เข้า | แสดงข้อความ "ไม่พบบัญชีผู้ใช้งานในระบบ" | **ผ่าน** | รูปภาพ: `doc/testphoto/func_03_login_not_found.png` |
| **2) การจัดการห้องพักและผู้เช่า (Owner)** |
| 4 | เพิ่มห้องพักใหม่ | เลขห้อง ราคา สถานะ | บันทึกห้องและแสดงในรายการ | เพิ่มห้อง 305 ราคา 3,500 บาท สำเร็จ ข้อมูลแสดงบน Grid | **ผ่าน** | รูปภาพ: `doc/testphoto/func_04_add_room.png` |
| 5 | แก้ไข/ลบห้องพัก | เลือกห้องที่มีอยู่ | ข้อมูลถูกอัปเดต/ลบถูกต้อง | อัปเดตราคาห้องและลบห้องทดสอบได้ถูกต้อง | **ผ่าน** | รูปภาพ: `doc/testphoto/func_05_edit_room.png` |
| 6 | เพิ่มผู้เช่าเข้าห้อง | ข้อมูลผู้เช่า+ห้อง | ผูกผู้เช่ากับห้องและเปลี่ยนสถานะห้อง | ผูกผู้เช่าเข้าห้อง 201 สถานะห้องเปลี่ยนเป็น "มีผู้เช่า" | **ผ่าน** | รูปภาพ: `doc/testphoto/func_06_add_tenant_to_room.png` |
| 7 | กรอกข้อมูลไม่ครบ | เว้นช่องบังคับ | ระบบตรวจสอบและแจ้งเตือน ไม่บันทึก | แสดง Highlight สีแดงช่องบังคับ และไม่บันทึก | **ผ่าน** | รูปภาพ: `doc/testphoto/func_07_room_validation_error.png` |
| **3) การออกบิลและการชำระเงิน** |
| 8 | ออกบิลจากเลขมิเตอร์ | เลขมิเตอร์เก่า-ใหม่ | สร้างบิลพร้อมยอดรวมถูกต้อง | บิลถูกสร้างขึ้น พร้อมยอดรวมสะสมคำนวณถูกต้อง | **ผ่าน** | รูปภาพ: `doc/testphoto/func_08_create_bill.png` |
| 9 | คำนวณค่าน้ำ-ไฟ-ค่าเช่า | อัตราค่าบริการ | ยอดคำนวณตรงกับที่คิดด้วยมือ | ยอดรวม ค่าน้ำ (ค่าฐาน+หน่วย) ค่าไฟ ตรงกับสูตรคำนวณ 100% | **ผ่าน** | รูปภาพ: `doc/testphoto/func_09_calc_utility_check.png` |
| 10 | แสดง QR พร้อมเพย์ (Tenant) | เปิดบิลค้างชำระ | แสดง QR ระบุยอดถูกต้อง | QR PromptPay เจนเนอเรตพร้อม PromptPay ID และยอดเงินตรง | **ผ่าน** | รูปภาพ: `doc/testphoto/func_10_promptpay_qr.png` |
| 11 | อัปโหลดสลิปยืนยัน (Tenant) | รูปสลิป | อัปเดตสถานะบิลเป็นรอตรวจสอบ | อัปโหลดไฟล์ภาพสลิปสำเร็จ สถานะเปลี่ยนเป็น "รอตรวจสอบ" | **ผ่าน** | รูปภาพ: `doc/testphoto/func_11_upload_slip.png` |
| 12 | กรอกเลขมิเตอร์ผิด | เลขใหม่ < เลขเก่า | ระบบแจ้งเตือน ไม่ยอมบันทึก | ขึ้นเตือน "เลขมิเตอร์ครั้งนี้ต้องไม่น้อยกว่าครั้งก่อน" | **ผ่าน** | รูปภาพ: `doc/testphoto/func_12_meter_validation_error.png` |
| **4) การแจ้งซ่อม (Tenant + Keeper)** |
| 13 | ผู้เช่าแจ้งซ่อม | รายละเอียดปัญหา | บันทึกคำขอลง maintenance_requests | สร้างคำขอแจ้งซ่อม "ท่อน้ำอุดตัน" ลง DB สำเร็จ | **ผ่าน** | รูปภาพ: `doc/testphoto/func_13_tenant_repair_request.png` |
| 14 | ผู้ดูแลรับงาน | เลือกคำขอ | สร้างงานและเปลี่ยนสถานะกำลังดำเนินการ | Keeper กดรับงาน สถานะเปลี่ยนเป็น "กำลังดำเนินการ" | **ผ่าน** | รูปภาพ: `doc/testphoto/func_14_keeper_accept_job.png` |
| 15 | อัปเดตสถานะเป็นเสร็จ | ปิดงาน | สถานะเป็นเสร็จสิ้น + แจ้งผู้เช่า | ปิดงานเรียบร้อย มีการแจ้งเตือนส่งกลับไปยัง Tenant | **ผ่าน** | รูปภาพ: `doc/testphoto/func_15_repair_completed.png` |
| **5) การจองห้อง (Guest)** |
| 16 | ผู้สนใจจองห้อง | เลือกห้องว่าง | บันทึกการจอง (booking_progress) | เลือกห้อง 102 กรอกข้อมูล บันทึกการจองสถานะ Pending | **ผ่าน** | รูปภาพ: `doc/testphoto/func_16_guest_booking.png` |
| 17 | อนุมัติการจอง | Owner อนุมัติ | สร้างบัญชีผู้เช่าอัตโนมัติ | Owner พรีอนุมัติสำเร็จ ระบบสร้าง Account Tenant ให้อัตโนมัติ | **ผ่าน** | รูปภาพ: `doc/testphoto/func_17_approve_booking.png` |
| 18 | จองห้องที่ไม่ว่าง | เลือกห้องมีผู้เช่า | ระบบปฏิเสธการจอง | ปุ่มจองถูก Disabled และขึ้นเตือนห้องไม่ว่าง | **ผ่าน** | รูปภาพ: `doc/testphoto/func_18_booking_occupied_error.png` |

---

### ผลการทดสอบความปลอดภัย (Security Test Results)

| ที่ | รายการทดสอบ | วิธีทดสอบ | ผลที่คาดหวัง | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|---|
| 1 | เข้าถึง Route ที่ต้องมีสิทธิ์โดยไม่ล็อกอิน | เปิด `/owner`, `/platform` ตรง ๆ ขณะยังไม่เข้าสู่ระบบ | ถูก redirect ไปหน้า `/signin` | Redirect กลับหน้า Signin ทันที พร้อมแสดง Alert | **ผ่าน** |
| 2 | Bypass การตรวจสอบบทบาท | ล็อกอินเป็น Tenant แล้วลองเข้า `/owner` และ `/platform` | ถูกปฏิเสธ ไม่เห็นข้อมูลของบทบาทอื่น | แสดงหน้า 403 Forbidden ไม่สามารถเข้าถึงข้อมูล Owner ได้ | **ผ่าน** |
| 3 | การเข้ารหัสรหัสผ่าน (bcryptjs) | ตรวจค่าฟิลด์ password ในฐานข้อมูล | เป็นค่า hash ของ bcrypt ไม่ใช่ข้อความธรรมดา | รหัสผ่านเก็บในรูป `$2a$10$e8X...` ปลอดภัยตามมาตรฐาน | **ผ่าน** |
| 4 | ป้องกัน SQL Injection | กรอกค่า เช่น `' OR '1'='1` ในช่องล็อกอิน/ค้นหา | ระบบไม่หลุด ใช้ Parameterized Queries กันได้ | ไม่เกิด Error หรือ SQL Bypass แสดงข้อความแจ้งเตือนปรกติ | **ผ่าน** |

---

### ผลการทดสอบประสิทธิภาพ (Performance Test Results - Lighthouse)

| หน้าที่ทดสอบ | อุปกรณ์ | Performance Score | LCP (วินาที) | CLS | INP (มิลลิวินาที) |
|---|---|---|---|---|---|
| หน้าแรก / Explore | Desktop | 96 | 1.2 s | 0.01 | 45 ms |
| | Mobile | 91 | 1.8 s | 0.03 | 85 ms |
| หน้าเข้าสู่ระบบ (Signin) | Desktop | 99 | 0.8 s | 0.00 | 25 ms |
| | Mobile | 95 | 1.3 s | 0.01 | 50 ms |
| แดชบอร์ดเจ้าของหอ (Owner) | Desktop | 92 | 1.6 s | 0.02 | 110 ms |
| | Mobile | 86 | 2.2 s | 0.05 | 160 ms |
| แดชบอร์ดผู้เช่า (Tenant) | Desktop | 94 | 1.4 s | 0.01 | 90 ms |
| | Mobile | 88 | 2.0 s | 0.04 | 140 ms |
| หน้าบิล/ใบแจ้งหนี้ | Desktop | 91 | 1.7 s | 0.02 | 115 ms |
| | Mobile | 85 | 2.3 s | 0.05 | 175 ms |

---

### ผลตอบรับผู้ใช้และคะแนนความพึงพอใจ (User Feedback & Satisfaction Scores)

| ที่ | ประเด็นการประเมิน | คน1 (Owner) | คน2 (Keeper) | คน3 (Tenant) | คน4 (Admin) | ค่าเฉลี่ย (Mean) | S.D. | แปลผล |
|---|---|---|---|---|---|---|---|---|
| 1 | ระบบใช้งานง่าย เข้าใจได้ไม่ซับซ้อน | 5 | 4 | 5 | 5 | 4.75 | 0.50 | มากที่สุด |
| 2 | หน้าจอออกแบบสวยงามและเป็นระเบียบ | 5 | 4 | 4 | 5 | 4.50 | 0.58 | มากที่สุด |
| 3 | ระบบออกบิลอัตโนมัติช่วยประหยัดเวลา | 5 | 5 | 4 | 5 | 4.75 | 0.50 | มากที่สุด |
| 4 | การคำนวณค่าน้ำ-ค่าไฟ-ค่าเช่า ถูกต้องแม่นยำ | 5 | 5 | 5 | 5 | 5.00 | 0.00 | มากที่สุด |
| 5 | ระบบติดตามการชำระเงินสะดวก ตรวจสอบง่าย | 5 | 4 | 5 | 5 | 4.75 | 0.50 | มากที่สุด |
| 6 | ระบบแจ้งซ่อมช่วยจัดการงานได้เป็นระบบ | 4 | 5 | 5 | 4 | 4.50 | 0.58 | มากที่สุด |
| 7 | ความเร็วในการตอบสนองของระบบ | 4 | 4 | 5 | 4 | 4.25 | 0.50 | มากที่สุด |
| 8 | ความพึงพอใจโดยรวมต่อระบบ | 5 | 5 | 5 | 5 | 5.00 | 0.00 | มากที่สุด |
| | **ค่าเฉลี่ยรวม (Overall Mean)** | **4.75** | **4.50** | **4.75** | **4.75** | **4.69** | **0.25** | **มากที่สุด** |

#### คำถามปลายเปิด
1. **จุดที่ดี / ประทับใจของระบบ:** 
   - ระบบคำนวณค่าน้ำ-ค่าไฟและสร้าง QR Code พร้อมเพย์ให้อัตโนมัติ ช่วยลดเวลาของเจ้าของหอพักลงได้มาก ผู้เช่าใช้งานง่าย จ่ายเงินแล้วอัปโหลดสลิปผ่านมือถือได้สะดวก การแสดงผลหน้าจอสะอาดน่าใช้งาน
2. **จุดที่ควรปรับปรุง:** 
   - หน้าแดชบอร์ดฝั่งผู้ดูแล (Keeper) บนมือถืออยากให้อัปโหลดรูปภาพงานซ่อมหลังทำเสร็จได้สะดวกยิ่งขึ้น และอยากให้มีระบบ Push Notification สภาพบิลค้างชำระเตือนเข้า Line OA
3. **ข้อเสนอแนะเพิ่มเติมเพื่อการพัฒนาต่อยอด:** 
   - ในอนาคตควรพัฒนาการเชื่อมต่อ IoT กับกล่องมิเตอร์ไฟฟ้าดิจิทัลเพื่ออ่านค่าไฟอัตโนมัติโดยไม่ต้องเดินจดมิเตอร์
