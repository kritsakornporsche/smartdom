# 📈 บันทึกความคืบหน้าระบบ SmartDom (Progress Log)

**วันที่บันทึก:** 29 สิงหาคม 2026 (รอบค่ำ 22:15 น.)  
**เวอร์ชันปัจจุบัน:** `v2.4.0-b120` (`9fc8ce6` / `cc4bbd8`)  
**สถานะเซิร์ฟเวอร์:** 🟢 **Online & Permanent 24/7** (Windows Scheduled Service: `SmartDomServer` บนพอร์ต 3000 -> `http://kritsakorn.thddns.net:5993`)  
**สถานะ Git:** 🟢 **Up to date with `origin/main`**

---

## 🎯 สรุปงานและปัญหาที่แก้ไขสำเร็จ (29 ส.ค. 2569)

### 1. ⚡ ปรับแต่งความเร็วฐานข้อมูลและระบบ (Database & API Performance Optimization)
- **แก้ไขปัญหาความหน่วงหลัก (Network Latency Hop):**
  - ตรวจพบไฟล์ `.env.local` บนเซิร์ฟเวอร์เดิมกำหนดให้ยิงคำสั่ง SQL ออกไปหาโดเมนภายนอก `kritsakorn.thddns.net:5994` ทำให้ทุก Query บวก Network Latency 100-300ms
  - ทำการปรับให้เชื่อมต่อ `localhost:3306/smartdomdb` โดยตรงภายในเครื่องเซิร์ฟเวอร์ ลด Latency เหลือเพียง **1 - 5ms**
- **ปรับปรุง Persistent Connection Pool (`lib/mysql-adapter.js`):**
  - กำหนด Connection Pool ขนาด 25 Connections พร้อมเปิด Keep-Alive
  - ยกเลิกการเรียก `CREATE DATABASE IF NOT EXISTS` และ `SET SESSION sql_mode` ซ้ำซ้อนในทุกๆ Query
- **แก้ไข N+1 Query Problem ใน `/api/dorms`:**
  - เปลี่ยนจากการดึงหอพักแล้ววนลูป `for` ยิงหาห้องพักทีละหอพัก มาเป็นการใช้ **1 Single SQL Query** ด้วย `LEFT JOIN` และ `GROUP BY` รวมคำนวณ `MIN(price)` และ `COUNT(available_rooms)` พร้อมกันในคำสั่งเดียว
- **ผลลัพธ์ความเร็ว (Speed Benchmark):**
  - Homepage โหลดเร็วขึ้นเหลือเพียง **`27 ms`** ⚡

---

### 2. 🛡️ ตั้งค่า Permanent Windows Background Service (แก้ปัญหา Process ดับเมื่อ SSH หลุด)
- **ปัญหาเดิม:** เมื่อเชื่อมต่อผ่าน SSH บน Windows แล้วสั่งรัน เมื่อ SSH ตัดการเชื่อมต่อ Windows จะ Terminate Child Process ทิ้ง ทำให้เว็บขึ้น `ERR_CONNECTION_REFUSED`
- **การแก้ไข:**
  - สร้างสคริปต์ `C:\kritsakorn\smartdom\start-server.bat`
  - ติดตั้งลงใน **Windows Task Scheduler** เป็น Service ชื่อ **`SmartDomServer`** (รันอิสระใน Session 0 / Desktop Session)
  - ผูกพอร์ต `0.0.0.0:3000` อย่างสมบูรณ์ ทำให้เซิร์ฟเวอร์ **ทำงานออนไลน์ต่อเนื่อง 24 ชั่วโมง 🟢** ไม่ดับแม้ปิดโปรแกรมหรือตัด SSH

---

### 3. 🏢 ศูนย์จัดการการจองห้องพัก & ระบบบิล (`/owner/bookings` & `/tenant/billing`)
- **ระบบจองห้องพัก (1-Month Deposit Policy):** คำนวณเงินประกัน 1 เดือน สร้าง QR Code พร้อมเพย์แบบเรียลไทม์ และระบบอัปโหลดสลิป
- **แดชบอร์ดเจ้าของหอพัก (`/owner/bookings`):**
  - อนุมัติการจองพร้อมตัวเลือกออกบิลค่าเช่าเดือนแรกทันที
  - ปฏิเสธการจองพร้อมระบุเหตุผลและคืนห้องว่าง
  - แก้ไขข้อมูลการจอง / บันทึกการจอง Walk-in
  - พิมพ์ใบเสร็จรับเงินมัดจำการจองฟอร์แมต A4 / Export PDF
  - สลับดูข้อมูลตามรายหอพัก (`Multi-Dorm Selector`)
- **ระบบบิลผู้เช่า (`/tenant/billing`):**
  - แก้ไขปัญหา Unauthorized 401 และข้อผิดพลาด Column ฐานข้อมูล
  - ดึงข้อมูลบิลตาม `user_id` และ `email` อัตโนมัติ พร้อม Modal สแกน QR พร้อมเพย์คมชัดสูง

---

## 🔑 ข้อมูลบัญชีสำหรับทดสอบระบบ (Verified Accounts)

| บทบาท (Role) | อีเมล / ชื่อบัญชี (Email) | รหัสผ่าน (Password) | รายละเอียดข้อมูลในระบบ | หน้าแดชบอร์ด |
| :--- | :--- | :--- | :--- | :--- |
| **Tenant #1** | `tenant@gmail.com` | `smartdom` | หอพักเกษตร 2 / ห้อง 101 (มี 2 บิล: Unpaid ฿3,850 + Paid ฿3,720) | `/tenant/billing` |
| **Tenant #2** | `tenant@kaset2.com` | `smartdom` | หอพักเกษตร 2 / ห้อง 101 (มี 6 บิลย้อนหลัง) | `/tenant/billing` |
| **Tenant #3 (Kritsakorn)** | `kritsakorn8011@gmail.com` | `smartdom` | หอพักเกษตร 2 / ห้อง 407 (บิล #784 ฿3,900 รอตรวจสลิป + บิล #783) | `/tenant/billing` |
| **Dorm Owner** | `kritsakorn801@gmail.com` | `smartdom` | เจ้าของหอพักหลัก & เกษตร 2 (ดูการจองและบิลได้ครบทุกห้อง) | `/owner/bookings` |
| **Super Admin** | `admin` | `admin` | ผู้ดูแลระบบสูงสุด แพลตฟอร์ม & หอพักทุกแห่ง | `/platform` |

---

## 📋 แผนงานถัดไป (Next Steps)
1. ทดสอบ End-to-End User Flow (จอง -> โอนมัดจำ -> อนุมัติ -> ออกบิลค่าเช่าเดือนแรก -> สแกนจ่าย -> ยืนยันชำระเงิน)
2. รันการวัดผลประสิทธิภาพ (Lighthouse Flow Benchmark)
3. รวบรวมสรุปผลการทดสอบระบบสำหรับรายงานวิทยานิพนธ์ (Thesis Report)
