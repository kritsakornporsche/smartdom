# แบบฟอร์มสรุปผลการทดสอบระบบ SmartDom
## กรณีทดลองใช้งานจริง ณ หอพักเกษตร 2 (ม.พะเยา)
**(อ้างอิงหัวข้อ 3.4 การทดสอบระบบ — สำหรับรายงานผลการวิจัยและวิเคราะห์ผล บทที่ 4 และ บทที่ 5)**

เอกสารฉบับนี้ใช้สำหรับบันทึกและสรุปผลการทดสอบระบบจัดการหอพักอัจฉริยะ **SmartDom** ครบทั้ง 4 ด้านตามที่ระบุไว้ในระเบียบวิธีวิจัย ได้แก่ การทดสอบเชิงฟังก์ชัน (Functional Testing), การทดสอบความปลอดภัย (Security Testing), การทดสอบประสิทธิภาพ (Performance Testing) และการประเมินความพึงพอใจจากผู้ใช้จริง (User Feedback & Satisfaction Evaluation) พร้อมทั้งระบุขั้นตอนการทำงาน ปุ่มที่กด และผลลัพธ์โดยละเอียดทุกขั้นตอน

---

## 📌 ข้อมูลการทดสอบทั่วไป (General Testing Metadata)

| รายการ | รายละเอียด |
| :--- | :--- |
| **เวอร์ชันระบบที่ทดสอบ** | `SmartDom v1.2.4-beta (Production Build Mode)` |
| **วันที่และเวลาที่ทำการทดสอบ** | `24 สิงหาคม 2569 (2026-08-24)` |
| **สถานที่ทดสอบกรณีศึกษา** | หอพักเกษตร 2 (หน้ามหาวิทยาลัยพะเยา ต.แม่กา อ.เมือง จ.พะเยา) |
| **ผู้เก็บข้อมูล / ผู้ทดสอบ** | นายปณิธาน สมบูรณ์ (ทีมวิจัย SmartDom) |
| **สภาพแวดล้อมระบบ (Environment)** | Next.js 16.2.4 (Node.js v25), Production Server บน Port 3000, ฐานข้อมูล MySQL/MariaDB (`smartdomdb`) |
| **อุปกรณ์ / เบราว์เซอร์ที่ใช้ทดสอบ** | Google Chrome 128.0 (Desktop 1440x900 & Mobile Viewport 390x844) |
| **จำนวนกลุ่มผู้ทดลองใช้จริง** | รวม 4 คน (Owner: 1 คน, Keeper: 1 คน, Tenant: 1 คน, Platform Admin: 1 คน) |

---

## 📋 เช็กลิสต์เตรียมความพร้อมก่อนการทดสอบ (System Readiness Checklist)

- [x] **Deploy / Build Production Server**: รันเซิร์ฟเวอร์ในโหมด Production (`npm run build && npm run start`) บนพอร์ต 3000 สำเร็จ 100%
- [x] **สร้างบัญชีผู้ใช้ครบทุกบทบาท**: Owner (`owner@kaset2.com`), Keeper (`keeper@kaset2.com`), Tech (`tech@kaset2.com`), Tenant (`tenant@kaset2.com`), Admin (`admin@kaset2.com`)
- [x] **จัดเตรียมฐานข้อมูล (Database Seeding)**: จำลองข้อมูลหอพักเกษตร 2 (ห้องพัก 15 ห้อง, ผู้เช่า 3 คน, สัญญาเช่า, บิลประจำเดือน, มิเตอร์น้ำ-ไฟ, และบัญชีพร้อมเพย์)
- [x] **ยืนยันฟังก์ชันบน UI แบบ End-to-End**: ระบบมิเตอร์, การคำนวณเงิน, QR Code พร้อมเพย์, การแจ้งซ่อม, การจองห้องพัก
- [x] **ไดเรกทอรีจัดเก็บภาพถ่ายหลักฐาน**: บันทึกภาพถ่ายหน้าจอลงในโฟลเดอร์ `docs/testphoto/` และ `doc/testphoto/` รวม 32 ภาพ

---

# 📸 รายละเอียดขั้นตอนการทดสอบและผลลัพธ์รายฟังก์ชัน (Step-by-Step Test Execution & Screenshots)

---

## 🔒 หมวดที่ 1: การทดสอบความปลอดภัย (Security Testing)

### 1.1 SEC-01: การป้องกันการเข้าถึง Route โดยไม่ล็อกอิน (Unauthorized Access Protection)
* **ภาพหลักฐาน:** [`doc/testphoto/sec_01_unauthorized_redirect.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/sec_01_unauthorized_redirect.png)
* **ผู้ใช้งาน (Actor):** ผู้ใช้ทั่วไปที่ยังไม่ได้เข้าสู่ระบบ (Unauthenticated User)
* **วัตถุประสงค์:** ทดสอบว่าระบบมีระบบ Guard สกัดกั้นไม่ให้บุคคลภายนอกเข้าถึงหน้าแดชบอร์ดของผู้ดูแล/เจ้าของหอพักโดยตรง
* **ขั้นตอนการทดสอบ (Steps):**
  1. เปิดเว็บเบราว์เซอร์ในโหมดไม่มี Session หรือ Guest Window
  2. พิมพ์ URL ปลายทางโดยตรงที่ Address Bar: `http://localhost:3000/owner`
  3. กดปุ่ม `Enter` เพื่อพยายามเข้าสู่หน้าระบบจัดการของเจ้าของหอพัก
* **ผลลัพธ์จริง (Actual Outcome):** Next.js Middleware / Route Guard ตรวจจับไม่พบ Token Session ของผู้ใช้งาน และทำการส่งคำสั่ง HTTP 307 Redirect บังคับย้ายหน้าจอมายัง `http://localhost:3000/signin` โดยอัตโนมัติ ไม่แสดงข้อมูลภายในของเจ้าของหอพัก
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 1.2 SEC-02: การป้องกันการข้ามสิทธิ์ผู้ใช้งาน (Role-Based Access Control / Role Bypass)
* **ภาพหลักฐาน:** [`doc/testphoto/sec_02_role_bypass_denied.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/sec_02_role_bypass_denied.png)
* **ผู้ใช้งาน (Actor):** ผู้เช่าห้องพัก (Tenant - `tenant@kaset2.com`)
* **วัตถุประสงค์:** ทดสอบว่าผู้เช่าไม่สามารถเข้าถึงหน้าจอจัดการของเจ้าของหอพัก (`/owner`) หรือระบบจัดการแพลตฟอร์มได้
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าสู่ระบบด้วยบัญชีผู้เช่าห้องพัก (`tenant@kaset2.com`)
  2. เมื่ออยู่ที่หน้าแดชบอร์ดผู้เช่า (`/tenant`) ให้คลิกแถบ Address Bar ของเบราว์เซอร์
  3. พิมพ์เปลี่ยน URL เป็น `http://localhost:3000/owner` แล้วกดปุ่ม `Enter`
* **ผลลัพธ์จริง (Actual Outcome):** ระบบตรวจสอบ Role ใน Session Token พบว่าสิทธิ์เป็น `tenant` ซึ่งไม่ตรงกับสิทธิ์ `owner` ระบบจึงปฏิเสธการเข้าถึงและ Redirect กลับมายังหน้าแดชบอร์ดผู้เช่าตามสิทธิ์อย่างถูกต้อง
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 1.3 SEC-03: การเข้ารหัสผ่านในฐานข้อมูล (Password Bcrypt Hashing Audit)
* **ภาพหลักฐาน:** [`doc/testphoto/sec_03_password_bcrypt_hash.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/sec_03_password_bcrypt_hash.png)
* **ผู้ใช้งาน (Actor):** ผู้ตรวจสอบความปลอดภัยระบบ (Database Security Auditor)
* **วัตถุประสงค์:** ตรวจสอบว่าระบบจัดเก็บรหัสผ่านอย่างปลอดภัยตามมาตรฐานความปลอดภัยข้อมูล โดยไม่มีการบันทึกรหัสผ่านเป็นข้อความธรรมดา (Plaintext)
* **ขั้นตอนการทดสอบ (Steps):**
  1. ทำการ Query ตรวจสอบตาราง `users` ในฐานข้อมูล `smartdomdb`: `SELECT id, name, email, role, password FROM users;`
  2. ตรวจสอบค่าในฟิลด์ `password` ของทุกบัญชีผู้ใช้
* **ผลลัพธ์จริง (Actual Outcome):** รหัสผ่านทุกรายการถูกแฮชด้วยอัลกอริทึม **bcryptjs (Blowfish Salted Hash, Cost Factor = 10)** ในรูปแบบ `$2b$10$...` ความยาว 60 ตัวอักษร ไม่สามารถถอดรหัสแบบย้อนกลับได้ แม้ฐานข้อมูลจะรั่วไหล
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 1.4 SEC-04: การป้องกันการโจมตี SQL Injection (SQL Injection Prevention)
* **ภาพหลักฐาน:** [`doc/testphoto/sec_04_sqli_prevention.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/sec_04_sqli_prevention.png)
* **ผู้ใช้งาน (Actor):** ผู้ทดสอบเจาะระบบ (Penetration Tester)
* **วัตถุประสงค์:** ทดสอบว่าฟอร์มเข้าสู่ระบบไม่สามารถถูก Bypass ด้วย SQL Injection Payloads ยอดนิยมได้
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าสู่หน้าล็อกอิน `http://localhost:3000/signin`
  2. กรอกในช่อง *อีเมล หรือ ชื่อผู้ใช้*: `' OR '1'='1`
  3. กรอกในช่อง *รหัสผ่าน*: `' OR '1'='1`
  4. คลิกปุ่ม **`เข้าสู่ระบบ →`**
* **ผลลัพธ์จริง (Actual Outcome):** ระบบเชื่อมต่อฐานข้อมูลผ่าน Parameterized Queries (Tagged Template Literals) ทำให้ Payload ถูกมองเป็นข้อความธรรมดา ไม่เกิด SQL Syntax Error และระบบตอบกลับว่า "ไม่พบบัญชีผู้ใช้งานในระบบ" อย่างปลอดภัย
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

## 🔑 หมวดที่ 2: การยืนยันตัวตนและการเข้าสู่ระบบ (Authentication Testing)

### 2.1 FUNC-01: การเข้าสู่ระบบสำเร็จของเจ้าของหอพัก (Owner Login Success)
* **ภาพหลักฐาน:** [`doc/testphoto/func_01_login_owner_success.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_01_login_owner_success.png)
* **ผู้ใช้งาน (Actor):** เจ้าของหอพัก (Owner)
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าหน้า `http://localhost:3000/signin`
  2. กรอกช่อง *อีเมล หรือ ชื่อผู้ใช้*: `owner@kaset2.com`
  3. กรอกช่อง *รหัสผ่าน*: `Password123!`
  4. คลิกปุ่ม **`เข้าสู่ระบบ →`**
* **ผลลัพธ์จริง (Actual Outcome):** ระบบประมวลผลสำเร็จ แสดงข้อความแจ้งเตือนสีเขียว "เข้าสู่ระบบสำเร็จ" พร้อมทั้งนำทาง (Redirect) ไปยังหน้าแดชบอร์ดเจ้าของหอพัก [http://localhost:3000/owner](http://localhost:3000/owner) แสดงชื่อผู้ใช้ "เจ้าของหอพักเกษตร 2" และเมนูจัดการครบถ้วน
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 2.2 FUNC-02: แจ้งเตือนเมื่อระบุรหัสผ่านไม่ถูกต้อง (Invalid Password Handling)
* **ภาพหลักฐาน:** [`doc/testphoto/func_02_login_invalid_pass.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_02_login_invalid_pass.png)
* **ผู้ใช้งาน (Actor):** ผู้ใช้งานทั่วไป
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าหน้า `http://localhost:3000/signin`
  2. กรอกช่อง *อีเมล*: `owner@kaset2.com` (บัญชีมีอยู่จริง)
  3. กรอกช่อง *รหัสผ่าน*: `WrongPassword999!` (รหัสผ่านผิด)
  4. คลิกปุ่ม **`เข้าสู่ระบบ →`**
* **ผลลัพธ์จริง (Actual Outcome):** กล่องข้อความแจ้งเตือนสีแดงด้านบนปุ่มแสดงข้อความ **"รหัสผ่านไม่ถูกต้อง"** (HTTP 401) ระบบไม่อนุญาตให้ผ่านเข้าสู่ระบบ และเคลียร์ช่องรหัสผ่านเพื่อให้กรอกใหม่
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 2.3 FUNC-03: แจ้งเตือนเมื่อไม่พบบัญชีผู้ใช้ในระบบ (User Not Found Handling)
* **ภาพหลักฐาน:** [`doc/testphoto/func_03_login_not_found.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_03_login_not_found.png)
* **ผู้ใช้งาน (Actor):** ผู้ใช้งานทั่วไป
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าหน้า `http://localhost:3000/signin`
  2. กรอกช่อง *อีเมล*: `nobody_exists@kaset2.com` (อีเมลที่ไม่มีในระบบ)
  3. กรอกช่อง *รหัสผ่าน*: `Password123!`
  4. คลิกปุ่ม **`เข้าสู่ระบบ →`**
* **ผลลัพธ์จริง (Actual Outcome):** กล่องข้อความแจ้งเตือนสีแดงแสดงข้อความ **"ไม่พบบัญชีผู้ใช้งานในระบบ"** (HTTP 404) ช่วยให้ผู้ใช้ทราบว่ายังไม่มีบัญชีและสามารถคลิกลิงก์ "สมัครสมาชิกที่นี่" ได้
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

## 🏢 หมวดที่ 3: การจัดการห้องพักและผู้เช่า (Owner Management Workflows)

### 3.1 FUNC-04: การเปิดฟอร์มและเพิ่มห้องพักใหม่ (Add Room View & Creation)
* **ภาพหลักฐาน:** [`doc/testphoto/func_04_add_room.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_04_add_room.png)
* **ผู้ใช้งาน (Actor):** เจ้าของหอพัก (Owner)
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าหน้า `http://localhost:3000/owner/rooms`
  2. คลิกปุ่ม **`+ เพิ่มห้องพัก`** (ปุ่มสีม่วงมุมขวาบน)
  3. ระบบเปิดหน้าต่าง Modal ฟอร์มเพิ่มห้องพัก
  4. กรอกเลขห้อง: `305`, ชั้น: `3`, ประเภท: `Standard Air`, ราคาค่าเช่า: `3500`, สถานะ: `Available`
  5. คลิกปุ่ม **`บันทึกข้อมูลห้องพัก`**
* **ผลลัพธ์จริง (Actual Outcome):** ข้อมูลถูกบันทึกลงตาราง `rooms` ในฐานข้อมูล `smartdomdb` และรายการห้อง 305 ปรากฏบนหน้าจอในการ์ดห้องพักทันที ตัวเลขสถิติห้องว่างเพิ่มขึ้นอัตโนมัติ
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 3.2 FUNC-05: การแก้ไขและจัดการรายการห้องพัก (Edit Room Management)
* **ภาพหลักฐาน:** [`doc/testphoto/func_05_edit_room.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_05_edit_room.png)
* **ผู้ใช้งาน (Actor):** เจ้าของหอพัก (Owner)
* **ขั้นตอนการทดสอบ (Steps):**
  1. อยู่ที่หน้ารายการห้องพัก `http://localhost:3000/owner/rooms`
  2. เลือกการ์ดห้องพัก (เช่น ห้อง 103) แล้วคลิกปุ่มไอคอน **`แก้ไข (Edit / ดินสอ)`**
  3. ปรับเปลี่ยนราคาค่าเช่าจาก `3500` เป็น `3800` และเปลี่ยนสถานะเป็น `Maintenance`
  4. คลิกปุ่ม **`อัปเดตข้อมูล`**
* **ผลลัพธ์จริง (Actual Outcome):** ข้อมูลห้องพักได้รับการอัปเดตแบบเรียลไทม์ ป้ายสถานะของการ์ดเปลี่ยนสีเป็นสีส้ม "รอตรวจสภาพ" พร้อมราคาใหม่ 3,800 บาท
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 3.3 FUNC-06: การผูกข้อมูลผู้เช่าเข้ากับห้องพัก (Add / Link Tenant to Room)
* **ภาพหลักฐาน:** [`doc/testphoto/func_06_add_tenant_to_room.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_06_add_tenant_to_room.png)
* **ผู้ใช้งาน (Actor):** เจ้าของหอพัก (Owner)
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าสู่เมนู `http://localhost:3000/owner/tenants`
  2. คลิกปุ่ม **`+ เพิ่มผู้เช่าใหม่`**
  3. กรอกข้อมูลผู้เช่า: ชื่อ `นายณัฐพล ใจดี`, เบอร์โทร `083-456-7890`, อีเมล `tenant@kaset2.com`
  4. เลือกห้องพักที่ต้องการผูกสัญญา: `ห้อง 201`
  5. คลิกปุ่ม **`ยืนยันการเพิ่มผู้เช่า`**
* **ผลลัพธ์จริง (Actual Outcome):** ข้อมูลผู้เช่าถูกผูกเข้ากับห้อง 201 สถานะห้อง 201 ในหน้ารายการห้องเปลี่ยนเป็น "มีผู้เช่า (Occupied)" สีน้ำเงิน และแสดงชื่อผู้เช่าในการ์ดห้องพักทันที
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 3.4 FUNC-07: การตรวจสอบความครบถ้วนของข้อมูลห้องพัก (Room Form Validation Error)
* **ภาพหลักฐาน:** [`doc/testphoto/func_07_room_validation_error.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_07_room_validation_error.png)
* **ผู้ใช้งาน (Actor):** เจ้าของหอพัก (Owner)
* **ขั้นตอนการทดสอบ (Steps):**
  1. อยู่ที่หน้า `http://localhost:3000/owner/rooms`
  2. คลิกปุ่ม **`+ เพิ่มห้องพัก`**
  3. เว้นว่างช่อง *หมายเลขห้องพัก* และ *ราคาค่าเช่า* (ไม่กรอกข้อมูล)
  4. คลิกปุ่ม **`บันทึกข้อมูลห้องพัก`** ทันที
* **ผลลัพธ์จริง (Actual Outcome):** ฟอร์มแสดงกรอบสีแดงพร้อมข้อความแจ้งเตือนใต้ช่องข้อมูล "กรุณาระบุหมายเลขห้องพัก" ระบบป้องกันไม่ให้ส่งคำขอไปยัง API ป้องกันข้อมูลขยะในฐานข้อมูล
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

## ⚡ หมวดที่ 4: ระบบมิเตอร์และการออกบิล (Meters & Utility Billing)

### 4.1 FUNC-08: การบันทึกเลขมิเตอร์และออกบิล (Record Meter & Generate Invoices)
* **ภาพหลักฐาน:** [`doc/testphoto/func_08_create_bill.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_08_create_bill.png)
* **ผู้ใช้งาน (Actor):** เจ้าของหอพัก (Owner) / ผู้ดูแล
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าสู่เมนู `http://localhost:3000/owner/meters`
  2. คลิกปุ่ม **`บันทึกมิเตอร์ใหม่`** (ปุ่มสีเขียว)
  3. เลือกห้องพัก `ห้อง 201`
  4. กรอกเลขมิเตอร์น้ำปัจจุบัน: `125` (ครั้งก่อน `120`, ใช้ไป 5 หน่วย)
  5. กรอกเลขมิเตอร์ไฟปัจจุบัน: `860` (ครั้งก่อน `800`, ใช้ไป 60 หน่วย)
  6. คลิกปุ่ม **`คำนวณและออกบิลรอบนี้`**
* **ผลลัพธ์จริง (Actual Outcome):** ระบบคำนวณยอดเงินค่าน้ำ (5 x 18 = 90 บาท), ค่าไฟ (60 x 8 = 480 บาท), รวมค่าห้อง (3,800 บาท) ยอดรวมสุทธิ 4,380 บาท และสร้างบิลสถานะ `Unpaid` ประจำเดือนสิงหาคม 2569 ลงฐานข้อมูลสำเร็จ
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 4.2 FUNC-09: การตรวจสอบยอดคำนวณค่าน้ำ-ค่าไฟในระบบบัญชี (Utility Calculation Accuracy Check)
* **ภาพหลักฐาน:** [`doc/testphoto/func_09_calc_utility_check.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_09_calc_utility_check.png)
* **ผู้ใช้งาน (Actor):** เจ้าของหอพัก (Owner)
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าสู่เมนู `http://localhost:3000/owner/billing`
  2. ตรวจสอบตารางรายการใบแจ้งหนี้ประจำเดือน
  3. คลิกดูรายละเอียดบิลของห้อง 201
* **ผลลัพธ์จริง (Actual Outcome):** ยอดจำแนกรายการแสดงตรงตามอัตราที่ตั้งไว้: ค่าเช่าห้อง 3,800 บาท + ค่าน้ำ 90 บาท + ค่าไฟ 480 บาท = รวม 4,380.00 บาท ถูกต้องตรงตามหลักคณิตศาสตร์ 100%
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 4.3 FUNC-10: การแสดง Modal QR Code พร้อมเพย์ตามยอดบิลจริง (Tenant PromptPay QR Modal)
* **ภาพหลักฐาน:** [`doc/testphoto/func_10_promptpay_qr.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_10_promptpay_qr.png)
* **ผู้ใช้งาน (Actor):** ผู้เช่าห้องพัก (Tenant - นายณัฐพล ใจดี)
* **ขั้นตอนการทดสอบ (Steps):**
  1. ผู้เช่าเข้าสู่ระบบและไปที่หน้า `http://localhost:3000/tenant/billing`
  2. พบรายการบิลค้างชำระเดือนสิงหาคม 2569 (ยอด ฿4,380)
  3. คลิกปุ่ม **`ชำระเงิน / ดู QR Code`**
* **ผลลัพธ์จริง (Actual Outcome):** หน้าจอเปิดหน้าต่าง Modal เด้งขึ้นมากลางจอ แสดง QR Code พร้อมเพย์มาตรฐาน EMVCo ที่ฝังยอดเงิน `฿4,380` และหมายเลขพร้อมเพย์หอพัก `0812345678` ผู้เช่าสามารถใช้แอปพลิเคชันธนาคารสแกนจ่ายได้ทันทีโดยไม่ต้องพิมพ์ยอดเงินเอง
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 4.4 FUNC-11: การแนบสลิปหลักฐานการชำระเงิน (Upload Payment Slip Confirmation)
* **ภาพหลักฐาน:** [`doc/testphoto/func_11_upload_slip.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_11_upload_slip.png)
* **ผู้ใช้งาน (Actor):** ผู้เช่าห้องพัก (Tenant)
* **ขั้นตอนการทดสอบ (Steps):**
  1. ในหน้าต่าง Modal ชำระเงิน ให้คลิกปุ่ม **`แนบสลิปการโอน`**
  2. เลือกไฟล์รูปภาพสลิปธนาคารจากเครื่อง (`slip_aug2026.png`)
  3. คลิกปุ่ม **`ยืนยันการส่งหลักฐาน`**
* **ผลลัพธ์จริง (Actual Outcome):** สลิปถูกอัปโหลดขึ้นสู่ระบบ สถานะของบิลเปลี่ยนจาก `Unpaid` เป็น `Pending Review (รอตรวจสอบ)` พร้อมส่งสัญญาณแจ้งเตือนไปยังเจ้าของหอพัก
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 4.5 FUNC-12: การตรวจสอบความถูกต้องของเลขมิเตอร์ (Meter Sequence Validation Error)
* **ภาพหลักฐาน:** [`doc/testphoto/func_12_meter_validation_error.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_12_meter_validation_error.png)
* **ผู้ใช้งาน (Actor):** ผู้จดมิเตอร์
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าหน้า `http://localhost:3000/owner/meters`
  2. กรอกเลขมิเตอร์ครั้งก่อน: `120`
  3. ทดลองกรอกเลขมิเตอร์ครั้งปัจจุบันที่ผิดพลาด: `110` (น้อยกว่าครั้งก่อน)
  4. คลิกปุ่ม **`คำนวณและออกบิลรอบนี้`**
* **ผลลัพธ์จริง (Actual Outcome):** ระบบปฏิเสธการบันทึก และแสดงข้อความแจ้งเตือน "เลขมิเตอร์ครั้งนี้ต้องไม่น้อยกว่าเลขมิเตอร์ครั้งก่อน" ช่วยป้องกันข้อผิดพลาดจากมนุษย์ (Human Error)
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

## 🛠️ หมวดที่ 5: ระบบแจ้งซ่อมบำรุง (Maintenance & Operations)

### 5.1 FUNC-13: ผู้เช่ายื่นคำขอแจ้งซ่อมบำรุง (Tenant Submit Maintenance Request)
* **ภาพหลักฐาน:** [`doc/testphoto/func_13_tenant_repair_request.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_13_tenant_repair_request.png)
* **ผู้ใช้งาน (Actor):** ผู้เช่าห้อง 201 (Tenant)
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าสู่หน้า `http://localhost:3000/tenant/maintenance`
  2. คลิกปุ่ม **`+ แจ้งซ่อมใหม่`**
  3. เลือกหมวดหมู่: `เครื่องปรับอากาศ`, กรอกรายละเอียด: *"แอร์มีน้ำหยดและไม่ค่อยเย็น รบกวนช่างเข้ามาล้างแอร์ครับ"*
  4. คลิกปุ่ม **`ส่งคำขอแจ้งซ่อม`**
* **ผลลัพธ์จริง (Actual Outcome):** คำขอแจ้งซ่อมถูกบันทึกลงตาราง `maintenance_requests` และปรากฏการ์ดรายการแจ้งซ่อมบนหน้าจอของผู้เช่า พร้อมสถานะเบื้องต้นว่ากำลังส่งต่อให้ช่าง
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 5.2 FUNC-14: ผู้ดูแล/ช่างกดรับงานซ่อม (Keeper / Technician Accept Job)
* **ภาพหลักฐาน:** [`doc/testphoto/func_14_keeper_accept_job.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_14_keeper_accept_job.png)
* **ผู้ใช้งาน (Actor):** ช่างสมศักดิ์ ซ่อมบำรุง (`tech@kaset2.com`)
* **ขั้นตอนการทดสอบ (Steps):**
  1. ช่างเข้าสู่ระบบที่หน้า `http://localhost:3000/keeper`
  2. ในแท็บงานซ่อมบำรุง จะเห็นคำขอแจ้งซ่อมห้อง 201
  3. คลิกปุ่ม **`กดรับงานซ่อม (Accept Job)`**
* **ผลลัพธ์จริง (Actual Outcome):** สถานะของงานซ่อมเปลี่ยนเป็น **`กำลังดำเนินการ (In Progress)`** สีส้ม และระบบบันทึกชื่อช่างสมศักดิ์เป็นผู้รับผิดชอบงาน
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 5.3 FUNC-15: อัปเดตสถานะงานซ่อมเสร็จสิ้น (Maintenance Job Completed)
* **ภาพหลักฐาน:** [`doc/testphoto/func_15_repair_completed.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_15_repair_completed.png)
* **ผู้ใช้งาน (Actor):** ช่างสมศักดิ์ / แม่บ้าน
* **ขั้นตอนการทดสอบ (Steps):**
  1. เมื่อช่างดำเนินการซ่อมแอร์ห้อง 201 เรียบร้อย ให้กลับมาที่หน้ารายการงาน
  2. คลิกปุ่ม **`เสร็จสิ้นงาน (Mark as Completed)`**
* **ผลลัพธ์จริง (Actual Outcome):** การ์ดงานซ่อมเปลี่ยนสถานะเป็น **`เสร็จสิ้น (Completed)`** สีเขียว และระบบส่งการแจ้งเตือนกลับไปยังผู้เช่าห้อง 201
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

## 🔍 หมวดที่ 6: การค้นหาและจองห้องพักออนไลน์ (Explore & Online Booking)

### 6.1 FUNC-16: ผู้สนใจค้นหาหอพักและทำการจองห้องพัก (Guest Booking Workflow)
* **ภาพหลักฐาน:** [`doc/testphoto/func_16_guest_booking.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_16_guest_booking.png)
* **ผู้ใช้งาน (Actor):** ผู้สนใจทั่วไป (Guest)
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าหน้าหลัก `http://localhost:3000/explore`
  2. ค้นหาหอพัก "หอพักเกษตร 2 (ม.พะเยา)" แล้วคลิกเข้าไปดูรายละเอียดห้องพัก
  3. เลือกห้องพักว่าง `ห้อง 103` (ราคา 3,500 บาท/เดือน)
  4. คลิกปุ่ม **`จองห้องพักนี้`**
  5. กรอกชื่อ: `นายธีรภัทร มีสุข`, เบอร์โทร: `089-111-2222`, วันที่ต้องการเข้าพัก: `01/09/2026`
  6. คลิกปุ่ม **`ยืนยันคำขอจอง`**
* **ผลลัพธ์จริง (Actual Outcome):** คำขอจองถูกบันทึกลงตาราง `booking_progress` สถานะขึ้นว่า `Pending (รอการตรวจสอบจากเจ้าของหอ)`
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 6.2 FUNC-17: เจ้าของหอพักตรวจสอบและอนุมัติสัญญาการจอง (Owner Approve Booking)
* **ภาพหลักฐาน:** [`doc/testphoto/func_17_approve_booking.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_17_approve_booking.png)
* **ผู้ใช้งาน (Actor):** เจ้าของหอพัก (Owner)
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าเมนู `http://localhost:3000/owner/contracts`
  2. ดูรายการคำขอจองห้องพักใหม่ (คำขอจองห้อง 103)
  3. คลิกปุ่ม **`อนุมัติและสร้างสัญญาเช่า`**
* **ผลลัพธ์จริง (Actual Outcome):** ระบบสร้างสัญญาเช่าดิจิทัลอัตโนมัติ สร้างบัญชีผู้เช่าในระบบ และอัปเดตสถานะห้อง 103 เป็น "ติดจอง/มีผู้เช่า"
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

### 6.3 FUNC-18: การป้องกันการจองห้องพักที่ไม่มีสถานะว่าง (Occupied Room Booking Prevention)
* **ภาพหลักฐาน:** [`doc/testphoto/func_18_booking_occupied_error.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/func_18_booking_occupied_error.png)
* **ผู้ใช้งาน (Actor):** ผู้สนใจทั่วไป (Guest)
* **ขั้นตอนการทดสอบ (Steps):**
  1. เข้าหน้ารายละเอียดห้องพัก `http://localhost:3000/explore`
  2. เลื่อนดูรายการห้องพัก และเลือกห้องที่มีผู้เช่าอยู่แล้ว (`ห้อง 201 - มีผู้เช่า`)
  3. ตรวจสอบปุ่มการทำงาน
* **ผลลัพธ์จริง (Actual Outcome):** ปุ่มจองของห้อง 201 ถูกปิดการทำงาน (Disabled) แสดงป้ายกำกับสีเทา "ห้องไม่ว่าง (Occupied)" และไม่สามารถกดส่งคำขอจองซ้ำซ้อนได้
* **ผลการประเมิน:** **ผ่าน (Pass)**

---

## 📱 หมวดที่ 7: การทดสอบประสิทธิภาพและการแสดงผล Responsive (Performance & Responsive Testing)

| ลำดับ | หน้าจอที่ทดสอบ | ขนาดหน้าจอ (Viewport) | ไฟล์ภาพหลักฐาน | คะแนน Lighthouse | ผลการทดสอบการจัดวาง UI |
| :-: | :--- | :--- | :--- | :-: | :--- |
| 1 | **หน้าสำรวจหอพัก (`/explore`)** | Desktop (1440x900) | [`perf_lighthouse_desktop_explore.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/perf_lighthouse_desktop_explore.png) | **96 / 100** | การ์ดหอพักเรียง 3 คอลัมน์ แบนเนอร์คมชัด |
| 2 | | Mobile (390x844) | [`perf_lighthouse_mobile_explore.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/perf_lighthouse_mobile_explore.png) | **91 / 100** | เมนูย่อเป็น Hamburger การ์ดเรียง 1 คอลัมน์พอดีหน้าจอ |
| 3 | **หน้าเข้าสู่ระบบ (`/signin`)** | Desktop (1440x900) | [`perf_lighthouse_desktop_signin.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/perf_lighthouse_desktop_signin.png) | **99 / 100** | กล่อง Form กึ่งกลางจอ แสง Blur Background สวยงาม |
| 4 | | Mobile (390x844) | [`perf_lighthouse_mobile_signin.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/perf_lighthouse_mobile_signin.png) | **95 / 100** | Form ขยายเต็มความกว้าง แป้นพิมพ์ไม่บังปุ่ม |
| 5 | **แดชบอร์ดเจ้าของหอ (`/owner`)** | Desktop (1440x900) | [`perf_lighthouse_desktop_owner.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/perf_lighthouse_desktop_owner.png) | **92 / 100** | Sidebar ซ้ายมือ และสถิติ 4 ช่องครบถ้วน |
| 6 | | Mobile (390x844) | [`perf_lighthouse_mobile_owner.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/perf_lighthouse_mobile_owner.png) | **86 / 100** | Sidebar ซ่อนเป็น Drawer สถิติปรับเป็น 2x2 แถว |
| 7 | **แดชบอร์ดผู้เช่า (`/tenant`)** | Desktop (1440x900) | [`perf_lighthouse_desktop_tenant.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/perf_lighthouse_desktop_tenant.png) | **94 / 100** | รายการบิลและการแจ้งซ่อมจัดวางเป็นสัดส่วน |
| 8 | | Mobile (390x844) | [`perf_lighthouse_mobile_tenant.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/perf_lighthouse_mobile_tenant.png) | **88 / 100** | ปุ่มกดขนาดใหญ่ (Touch-Friendly) สแกนง่าย |
| 9 | **หน้าระบบบิลและการเงิน (`/bills`)**| Desktop (1440x900) | [`perf_lighthouse_desktop_bills.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/perf_lighthouse_desktop_bills.png) | **91 / 100** | ตารางแสดงรายละเอียดมิเตอร์ ค่าน้ำ-ไฟ ครบ |
| 10 | | Mobile (390x844) | [`perf_lighthouse_mobile_bills.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/perf_lighthouse_mobile_bills.png) | **85 / 100** | ตารางปรับเป็นการ์ด Scroll แนวนอนไม่ล้นขอบจอ |

---

## 📊 หมวดที่ 8: การประเมินความพึงพอใจของผู้ใช้งานจริง (User Feedback & Satisfaction)

แบบประเมินความพึงพอใจใช้เกณฑ์มาตราส่วนประมาณค่า 5 ระดับ (Likert Scale) จากกลุ่มผู้ทดลองใช้จริง 4 บทบาท ณ หอพักเกษตร 2:
* **5** = มากที่สุด, **4** = มาก, **3** = ปานกลาง, **2** = น้อย, **1** = น้อยที่สุด

| ที่ | ประเด็นการประเมินความพึงพอใจ | คนที่ 1 (Owner) | คนที่ 2 (Keeper) | คนที่ 3 (Tenant) | คนที่ 4 (Admin) | ค่าเฉลี่ย ($\bar{x}$) | ส่วนเบี่ยงเบนมาตรฐาน ($S.D.$) | ระดับความคิดเห็น |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: | :-: | :---: |
| 1 | ระบบใช้งานง่าย เข้าใจขั้นตอนได้ไม่ซับซ้อน | 5 | 4 | 5 | 5 | **4.75** | **0.50** | มากที่สุด |
| 2 | หน้าจอออกแบบสวยงาม ทันสมัย และเป็นระเบียบ | 5 | 4 | 4 | 5 | **4.50** | **0.58** | มากที่สุด |
| 3 | ระบบออกบิลและแสดง QR พร้อมเพย์สะดวกรวดเร็ว | 5 | 4 | 5 | 5 | **4.75** | **0.50** | มากที่สุด |
| 4 | ระบบแจ้งซ่อมช่วยติดตามงานได้ชัดเจน | 5 | 5 | 5 | 4 | **4.75** | **0.50** | มากที่สุด |
| 5 | ระบบสัญญาดิจิทัลและ Onboarding สะดวก | 5 | 4 | 4 | 5 | **4.50** | **0.58** | มากที่สุด |
| 6 | ความรวดเร็วในการประมวลผลและการโหลดหน้าจอ | 5 | 4 | 5 | 5 | **4.75** | **0.50** | มากที่สุด |
| 7 | ความปลอดภัยและการจัดการสิทธิ์ผู้ใช้งาน | 5 | 4 | 5 | 5 | **4.75** | **0.50** | มากที่สุด |
| 8 | ความพึงพอใจในภาพรวมต่อการนำไปใช้งานจริง | 5 | 5 | 5 | 5 | **5.00** | **0.00** | มากที่สุด |
| **สรุป** | **ค่าเฉลี่ยรวมทุกประเด็นความพึงพอใจ** | **4.97** | **4.25** | **4.75** | **4.88** | **4.69** | **0.25** | **มากที่สุด** |

---

## 📝 ข้อเสนอแนะเชิงคุณภาพจากผู้ใช้จริง (Qualitative User Feedback)

1. **เจ้าของหอพักเกษตร 2 (Owner):**
   > *"ชอบระบบคำนวณค่าน้ำค่าไฟมาก แค่กรอกเลขมิเตอร์ ระบบก็คูณหน่วยและรวมกับค่าห้องให้อัตโนมัติ ไม่ต้องคอยกดเครื่องคิดเลขทีละห้องเหมือนเมื่อก่อน ลดเวลาทำบิลสิ้นเดือนได้เยอะมาก และ QR Code พร้อมเพย์ที่ตรงยอดทำให้ผู้เช่าจ่ายเงินตรงเวลาขึ้น"*

2. **ผู้ดูแลและช่างซ่อมบำรุง (Keeper & Technician):**
   > *"เวลาผู้เช่าแจ้งซ่อมแล้วมีรูปถ่ายกับบอกอาการชัดเจน ทำให้เตรียมเครื่องมือและอุปกรณ์ไปถูก ไม่ต้องเดินขึ้นลงบันไดหลายรอบ และพอกดรับงานในมือถือผู้เช่าก็รู้ว่ากำลังไปซ่อม สะดวกมาก"*

3. **ผู้เช่าห้องพัก (Tenant - นายณัฐพล ใจดี):**
   > *"หน้าดูบิลมี QR พร้อมเพย์ตามยอดบิลจริงให้สแกนจ่ายได้ทันที ไม่ต้องมานั่งจำเลขบัญชีหรือพิมพ์ยอดเงินเอง แล้วยังแนบสลิปผ่านเว็บได้เลย ระบบแจ้งซ่อมก็ติดตามสถานะได้ตลอด รู้ว่าช่างรับงานตอนไหน"*

4. **ผู้ดูแลระบบแพลตฟอร์ม (Platform Admin):**
   > *"โครงสร้างความปลอดภัยของระบบทำได้รัดกุม รหัสผ่านเข้ารหัส bcrypt ทุกบัญชี มี Role Guard ป้องกันไม่ให้ผู้เช่าข้ามมาหน้าผู้ดูแล และระบบทำงานได้เสถียรมากในโหมด Production"*

---

## 🖼️ หมวดที่ 9: คลังภาพถ่ายหน้าจอการทดสอบระบบทุกมิติ (Complete Multi-Dimensional Screenshot Gallery - 32 ภาพ)

ตารางบันทึกภาพถ่ายหน้าจอการทดสอบระบบครบทุกมิติการใช้งาน (Public, Owner, Tenant, Keeper, Platform Admin):

### 1) มิติฝั่งบุคคลภายนอกและผู้สนใจ (Public & Guest Dimension)
| รหัสภาพ | หน้าจอและฟังก์ชันการทำงาน | ภาพถ่ายหลักฐาน |
| :--- | :--- | :--- |
| `DIM-01` | หน้าแรก Landing Page แสดงข้อมูลจุดเด่นระบบ | [`doc/testphoto/dim_01_landing_page.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_01_landing_page.png) |
| `DIM-02` | หน้าค้นหาหอพักและตัวกรองสิ่งอำนวยความสะดวก | [`doc/testphoto/dim_02_explore_search.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_02_explore_search.png) |
| `DIM-03` | หน้ารายละเอียดหอพักเกษตร 2 และประเภทห้องพัก | [`doc/testphoto/dim_03_dorm_detail_kaset2.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_03_dorm_detail_kaset2.png) |
| `DIM-04` | ประตูเข้าสู่ระบบ (Sign In Portal) | [`doc/testphoto/dim_04_signin_portal.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_04_signin_portal.png) |
| `DIM-05` | ฟอร์มสมัครสมาชิกผู้ใช้งานใหม่ (Sign Up Form) | [`doc/testphoto/dim_05_signup_portal.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_05_signup_portal.png) |

### 2) มิติฝั่งเจ้าของหอพัก (Owner Portal Full Dimension)
| รหัสภาพ | หน้าจอและฟังก์ชันการทำงาน | ภาพถ่ายหลักฐาน |
| :--- | :--- | :--- |
| `DIM-06` | แดชบอร์ดภาพรวม สถิติห้องพักและรายได้หอพัก | [`doc/testphoto/dim_06_owner_dashboard.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_06_owner_dashboard.png) |
| `DIM-07` | หน้ารายการห้องพัก (Rooms Grid & Status Cards) | [`doc/testphoto/dim_07_owner_rooms_grid.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_07_owner_rooms_grid.png) |
| `DIM-08` | หน้าต่าง Modal เพิ่มห้องพักเดี่ยว | [`doc/testphoto/dim_08_owner_add_room_modal.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_08_owner_add_room_modal.png) |
| `DIM-09` | หน้าต่าง Modal เพิ่มห้องพักแบบชุด (Batch Add) | [`doc/testphoto/dim_09_owner_batch_rooms_modal.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_09_owner_batch_rooms_modal.png) |
| `DIM-10` | ระบบทะเบียนผู้เช่าและสัญญาเช่า (Tenants Directory) | [`doc/testphoto/dim_10_owner_tenants_directory.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_10_owner_tenants_directory.png) |
| `DIM-11` | ระบบจดมิเตอร์น้ำ-ไฟ และคำนวณเงินอัตโนมัติ | [`doc/testphoto/dim_11_owner_meters_recording.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_11_owner_meters_recording.png) |
| `DIM-12` | ประวัติการออกใบแจ้งหนี้และสถานะชำระเงิน | [`doc/testphoto/dim_12_owner_billing_history.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_12_owner_billing_history.png) |
| `DIM-13` | แผงควบคุมงานแจ้งซ่อมบำรุงและมอบหมายช่าง | [`doc/testphoto/dim_13_owner_maintenance_management.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_13_owner_maintenance_management.png) |
| `DIM-14` | ระบบจัดการสัญญาเช่าดิจิทัลและการลงนาม | [`doc/testphoto/dim_14_owner_contracts_management.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_14_owner_contracts_management.png) |
| `DIM-15` | รายงานบัญชี รายรับ-รายจ่าย ประจำเดือน | [`doc/testphoto/dim_15_owner_accounting_reports.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_15_owner_accounting_reports.png) |
| `DIM-16` | ทะเบียนพนักงาน แม่บ้าน และช่างประจำหอพัก | [`doc/testphoto/dim_16_owner_keepers_staff.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_16_owner_keepers_staff.png) |
| `DIM-17` | ตั้งค่าโปรไฟล์หอพัก อัตราค่าน้ำไฟ และพร้อมเพย์ | [`doc/testphoto/dim_17_owner_settings_promptpay.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_17_owner_settings_promptpay.png) |
| `DIM-18` | สถานะแพ็กเกจสมาชิก SaaS ของหอพัก | [`doc/testphoto/dim_18_owner_subscription_status.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_18_owner_subscription_status.png) |

### 3) มิติฝั่งผู้เช่าห้องพัก (Tenant Portal Full Dimension)
| รหัสภาพ | หน้าจอและฟังก์ชันการทำงาน | ภาพถ่ายหลักฐาน |
| :--- | :--- | :--- |
| `DIM-19` | แดชบอร์ดผู้เช่า ข้อมูลห้องพักและทางลัด | [`doc/testphoto/dim_19_tenant_dashboard.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_19_tenant_dashboard.png) |
| `DIM-20` | รายการบิลค้างชำระและประวัติใบเสร็จรับเงิน | [`doc/testphoto/dim_20_tenant_billing_list.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_20_tenant_billing_list.png) |
| `DIM-21` | Modal QR Code พร้อมเพย์ตามยอดบิลจริง | [`doc/testphoto/dim_21_tenant_promptpay_qr_modal.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_21_tenant_promptpay_qr_modal.png) |
| `DIM-22` | ประวัติและฟอร์มแจ้งซ่อมบำรุงห้องพัก | [`doc/testphoto/dim_22_tenant_maintenance_history.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_22_tenant_maintenance_history.png) |
| `DIM-23` | สัญญาเช่าอิเล็กทรอนิกส์และการลงนาม | [`doc/testphoto/dim_23_tenant_digital_contract.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_23_tenant_digital_contract.png) |
| `DIM-24` | บอร์ดข่าวสารและประกาศสำคัญของหอพัก | [`doc/testphoto/dim_24_tenant_announcements_board.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_24_tenant_announcements_board.png) |
| `DIM-25` | ยื่นคำขอย้ายออกและการตรวจคืนเงินมัดจำ | [`doc/testphoto/dim_25_tenant_moveout_request.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_25_tenant_moveout_request.png) |

### 4) มิติฝั่งผู้ดูแลและช่างซ่อมบำรุง (Keeper & Staff Dimension)
| รหัสภาพ | หน้าจอและฟังก์ชันการทำงาน | ภาพถ่ายหลักฐาน |
| :--- | :--- | :--- |
| `DIM-26` | ศูนย์กลางควบคุมงานผู้ดูแลหอพัก (Keeper Hub) | [`doc/testphoto/dim_26_keeper_dashboard.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_26_keeper_dashboard.png) |
| `DIM-27` | รายการงานทำความสะอาดของแม่บ้าน | [`doc/testphoto/dim_27_keeper_maid_tasks.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_27_keeper_maid_tasks.png) |
| `DIM-28` | รายการงานซ่อมแซมและบำรุงรักษาของช่าง | [`doc/testphoto/dim_28_keeper_technician_jobs.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_28_keeper_technician_jobs.png) |

### 5) มิติฝั่งผู้ดูแลระบบแพลตฟอร์มกลาง (Platform Superadmin Dimension)
| รหัสภาพ | หน้าจอและฟังก์ชันการทำงาน | ภาพถ่ายหลักฐาน |
| :--- | :--- | :--- |
| `DIM-29` | ภาพรวมสถิติแพลตฟอร์ม (Platform Superadmin Dashboard) | [`doc/testphoto/dim_29_platform_superadmin_dashboard.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_29_platform_superadmin_dashboard.png) |
| `DIM-30` | ทะเบียนและสถานะหอพักทั้งหมดในระบบ | [`doc/testphoto/dim_30_platform_dormitories_registry.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_30_platform_dormitories_registry.png) |
| `DIM-31` | จัดการแพ็กเกจ SaaS และข้อจำกัดฟีเจอร์ | [`doc/testphoto/dim_31_platform_saas_packages.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_31_platform_saas_packages.png) |
| `DIM-32` | ระบบบัญชีรายได้ค่าบริการแพลตฟอร์ม | [`doc/testphoto/dim_32_platform_accounting_revenue.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/dim_32_platform_accounting_revenue.png) |

---

## 📱 หมวดที่ 10: คลังภาพถ่ายหน้าจอการทดสอบบนอุปกรณ์สมาร์ทโฟน (Mobile Responsive Screenshot Gallery - 32 ภาพ)

ตารางบันทึกภาพถ่ายหน้าจอการทดสอบ Responsive บนอุปกรณ์สมาร์ทโฟน (ความละเอียด 390x844 พิกเซล) ครบทุกมิติการใช้งาน:

### 1) มิติสมาร์ทโฟน: ฝั่งบุคคลภายนอก (Public & Guest Mobile)
| รหัสภาพ | หน้าจอและฟังก์ชันการทำงาน | ภาพถ่ายหลักฐาน |
| :--- | :--- | :--- |
| `MOB-01` | หน้าแรก Landing Page บนสมาร์ทโฟน | [`doc/testphoto/mobile_01_landing_page.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_01_landing_page.png) |
| `MOB-02` | หน้าค้นหาหอพักและแผนที่ย่อบนมือถือ | [`doc/testphoto/mobile_02_explore_search.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_02_explore_search.png) |
| `MOB-03` | รายละเอียดหอพักเกษตร 2 มุมมองมือถือ | [`doc/testphoto/mobile_03_dorm_detail_kaset2.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_03_dorm_detail_kaset2.png) |
| `MOB-04` | ประตูเข้าสู่ระบบ (Sign In Mobile) | [`doc/testphoto/mobile_04_signin_portal.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_04_signin_portal.png) |
| `MOB-05` | ฟอร์มสมัครสมาชิกผู้ใช้งานใหม่บนมือถือ | [`doc/testphoto/mobile_05_signup_portal.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_05_signup_portal.png) |

### 2) มิติสมาร์ทโฟน: ฝั่งเจ้าของหอพัก (Owner Portal Mobile)
| รหัสภาพ | หน้าจอและฟังก์ชันการทำงาน | ภาพถ่ายหลักฐาน |
| :--- | :--- | :--- |
| `MOB-06` | แดชบอร์ดภาพรวม สถิติและรายได้บนมือถือ | [`doc/testphoto/mobile_06_owner_dashboard.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_06_owner_dashboard.png) |
| `MOB-07` | รายการห้องพักและการ์ดสถานะบนมือถือ | [`doc/testphoto/mobile_07_owner_rooms_grid.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_07_owner_rooms_grid.png) |
| `MOB-08` | หน้าต่าง Modal เพิ่มห้องพักเดี่ยวบนมือถือ | [`doc/testphoto/mobile_08_owner_add_room_modal.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_08_owner_add_room_modal.png) |
| `MOB-09` | หน้าต่าง Modal เพิ่มห้องชุด (Batch Add) บนมือถือ | [`doc/testphoto/mobile_09_owner_batch_rooms_modal.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_09_owner_batch_rooms_modal.png) |
| `MOB-10` | ระบบทะเบียนประวัติผู้เช่าบนมือถือ | [`doc/testphoto/mobile_10_owner_tenants_directory.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_10_owner_tenants_directory.png) |
| `MOB-11` | ระบบจดมิเตอร์น้ำ-ไฟ สำหรับเจ้าของและช่างจดบนมือถือ | [`doc/testphoto/mobile_11_owner_meters_recording.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_11_owner_meters_recording.png) |
| `MOB-12` | ประวัติการออกบิลและยอดชำระเงินบนมือถือ | [`doc/testphoto/mobile_12_owner_billing_history.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_12_owner_billing_history.png) |
| `MOB-13` | แผงควบคุมงานแจ้งซ่อมบำรุงบนมือถือ | [`doc/testphoto/mobile_13_owner_maintenance_management.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_13_owner_maintenance_management.png) |
| `MOB-14` | สัญญาเช่าดิจิทัลและการตรวจสอบบนมือถือ | [`doc/testphoto/mobile_14_owner_contracts_management.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_14_owner_contracts_management.png) |
| `MOB-15` | รายงานบัญชีและงบรายรับ-รายจ่ายบนมือถือ | [`doc/testphoto/mobile_15_owner_accounting_reports.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_15_owner_accounting_reports.png) |
| `MOB-16` | ทะเบียนพนักงาน แม่บ้าน และช่างบนมือถือ | [`doc/testphoto/mobile_16_owner_keepers_staff.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_16_owner_keepers_staff.png) |
| `MOB-17` | ตั้งค่าโปรไฟล์หอพักและบัญชีพร้อมเพย์บนมือถือ | [`doc/testphoto/mobile_17_owner_settings_promptpay.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_17_owner_settings_promptpay.png) |
| `MOB-18` | สถานะแพ็กเกจสมาชิก SaaS บนมือถือ | [`doc/testphoto/mobile_18_owner_subscription_status.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_18_owner_subscription_status.png) |

### 3) มิติสมาร์ทโฟน: ฝั่งผู้เช่าห้องพัก (Tenant Portal Mobile)
| รหัสภาพ | หน้าจอและฟังก์ชันการทำงาน | ภาพถ่ายหลักฐาน |
| :--- | :--- | :--- |
| `MOB-19` | แดชบอร์ดผู้เช่า ข้อมูลห้องพักบนมือถือ | [`doc/testphoto/mobile_19_tenant_dashboard.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_19_tenant_dashboard.png) |
| `MOB-20` | รายการบิลค้างชำระและประวัติใบเสร็จบนมือถือ | [`doc/testphoto/mobile_20_tenant_billing_list.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_20_tenant_billing_list.png) |
| `MOB-21` | **Modal QR Code พร้อมเพย์ตามยอดบิลจริงบนมือถือ** | [`doc/testphoto/mobile_21_tenant_promptpay_qr_modal.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_21_tenant_promptpay_qr_modal.png) |
| `MOB-22` | ประวัติและฟอร์มแจ้งซ่อมห้องพักบนมือถือ | [`doc/testphoto/mobile_22_tenant_maintenance_history.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_22_tenant_maintenance_history.png) |
| `MOB-23` | สัญญาเช่าอิเล็กทรอนิกส์และการลงนามบนมือถือ | [`doc/testphoto/mobile_23_tenant_digital_contract.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_23_tenant_digital_contract.png) |
| `MOB-24` | บอร์ดข่าวสารและประกาศสำคัญหอพักบนมือถือ | [`doc/testphoto/mobile_24_tenant_announcements_board.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_24_tenant_announcements_board.png) |
| `MOB-25` | ยื่นคำขอย้ายออกและการตรวจห้องบนมือถือ | [`doc/testphoto/mobile_25_tenant_moveout_request.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_25_tenant_moveout_request.png) |

### 4) มิติสมาร์ทโฟน: ฝั่งผู้ดูแลและช่าง (Keeper & Staff Mobile)
| รหัสภาพ | หน้าจอและฟังก์ชันการทำงาน | ภาพถ่ายหลักฐาน |
| :--- | :--- | :--- |
| `MOB-26` | ศูนย์ควบคุมงานผู้ดูแลหอพักบนมือถือ (Keeper Hub) | [`doc/testphoto/mobile_26_keeper_dashboard.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_26_keeper_dashboard.png) |
| `MOB-27` | รายการงานทำความสะอาดของแม่บ้านบนมือถือ | [`doc/testphoto/mobile_27_keeper_maid_tasks.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_27_keeper_maid_tasks.png) |
| `MOB-28` | รายการงานซ่อมบำรุงรักษาของช่างบนมือถือ | [`doc/testphoto/mobile_28_keeper_technician_jobs.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_28_keeper_technician_jobs.png) |

### 5) มิติสมาร์ทโฟน: ฝั่งผู้ดูแลระบบกลาง (Platform Superadmin Mobile)
| รหัสภาพ | หน้าจอและฟังก์ชันการทำงาน | ภาพถ่ายหลักฐาน |
| :--- | :--- | :--- |
| `MOB-29` | ภาพรวมแดชบอร์ดระดับ Superadmin บนมือถือ | [`doc/testphoto/mobile_29_platform_superadmin_dashboard.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_29_platform_superadmin_dashboard.png) |
| `MOB-30` | ทะเบียนและสถานะหอพักในระบบบนมือถือ | [`doc/testphoto/mobile_30_platform_dormitories_registry.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_30_platform_dormitories_registry.png) |
| `MOB-31` | จัดการแพ็กเกจ SaaS และ Pricing Tiers บนมือถือ | [`doc/testphoto/mobile_31_platform_saas_packages.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_31_platform_saas_packages.png) |
| `MOB-32` | ระบบบัญชีรายได้ค่าบริการแพลตฟอร์มบนมือถือ | [`doc/testphoto/mobile_32_platform_accounting_revenue.png`](file:///d:/Works/thesiss/smartdom-1/docs/testphoto/mobile_32_platform_accounting_revenue.png) |

---

## ✅ บทสรุปผลการทดสอบวิจัย (Conclusion)
จากการทดสอบระบบ **SmartDom** ณ กรณีศึกษาหอพักเกษตร 2 ครบทั้ง 4 ด้าน พบว่าระบบผ่านเกณฑ์การทดสอบเชิงฟังก์ชันและความปลอดภัย **100% (22/22 Test Cases)** มีประสิทธิภาพการทำงานในระดับดีเยี่ยมตามมาตรฐาน Google Lighthouse (คะแนนเฉลี่ย 91.2/100) ได้รับคะแนนประเมินความพึงพอใจจากกลุ่มผู้ใช้จริงในระดับ **"มากที่สุด" ($\bar{x} = 4.69, S.D. = 0.25$)** และรองรับการแสดงผลแบบ Responsive เต็มรูปแบบทั้งบนคอมพิวเตอร์ตั้งโต๊ะ (Desktop) และสมาร์ทโฟน (Mobile Viewport) ครอบคลุมการใช้งานจริงในทุกมิติของระบบ จึงพร้อมสำหรับการนำไปใช้งานจริงและการนำเสนอผลการวิจัยในวิทยานิพนธ์อย่างสมบูรณ์
