'use client';

import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Link from 'next/link';

interface DiagramItem {
  id: string;
  title: string;
  badge: string;
  category: string;
  description: string;
  actors: string[];
  steps: { step: number; actor: string; action: string; target: string; note?: string }[];
  mermaidCode: string;
}

const diagrams: DiagramItem[] = [
  {
    id: 'contract',
    title: '1. การทำสัญญาเช่า (Physical Sign & Digital Upload)',
    badge: 'Owner / Tenant',
    category: 'การจัดการสัญญา',
    description: 'กระบวนการทำสัญญากระดาษฉบับจริงระหว่างเจ้าของหอพักและผู้เช่า จากนั้นนำเข้าสู่ระบบโดยการถ่ายภาพ/สแกนเพื่อเปิดสิทธิ์และผูกห้องพักในระบบ SmartDom',
    actors: ['ผู้เช่า (Tenant)', 'เจ้าของหอพัก (Owner)', 'ระบบ SmartDom Frontend', 'ระบบ Backend & DB'],
    steps: [
      { step: 1, actor: 'Tenant & Owner', action: 'เซ็นเอกสารสัญญากระดาษฉบับจริง (Physical Contract) ร่วมกัน', target: 'Physical Document', note: 'ข้อตกลง ค่าเช่า เงินประกัน และกฎระเบียบ' },
      { step: 2, actor: 'Owner', action: 'ถ่ายรูปหรือสแกนเอกสารสัญญาฉบับลงลายมือชื่อ', target: 'Image / PDF File' },
      { step: 3, actor: 'Owner', action: 'เข้าเมนู /owner/contracts แล้วกรอกข้อมูลห้องพัก, ข้อมูลผู้เช่า, วันที่สัญญา', target: 'Web Frontend' },
      { step: 4, actor: 'Owner', action: 'แนบไฟล์รูปถ่ายสัญญาฉบับจริงเข้าสู่ฟอร์มและกดยืนยัน', target: 'Web Frontend' },
      { step: 5, actor: 'Frontend', action: 'ส่งคำขอ POST /api/owner/contracts พร้อมข้อมูลและไฟล์', target: 'Backend Server' },
      { step: 6, actor: 'Backend', action: 'บันทึกสัญญา (contracts), อัปเดตสถานะห้อง (Occupied), ผูกสิทธิ์ผู้เช่า (tenants)', target: 'Database' },
      { step: 7, actor: 'Backend', action: 'ส่งผลการสร้างสัญญาสำเร็จ', target: 'Frontend' },
      { step: 8, actor: 'Tenant', action: 'ล็อกอินเข้าสู่ระบบ ดูข้อมูลห้องพักและประวัติสัญญาของตนเองได้ทันที', target: 'Tenant Portal' },
    ],
    mermaidCode: `sequenceDiagram
    autonumber
    actor Tenant as 👤 ผู้เช่า (Tenant)
    actor Owner as 🏢 เจ้าของหอ (Owner)
    participant Front as 💻 SmartDom Web
    participant Back as ⚙️ Backend API
    participant DB as 🗄️ Database

    Note over Tenant, Owner: ขั้นตอนที่ 1: เซ็นสัญญาฉบับจริง
    Tenant->>Owner: พบปะและเซ็นสัญญากระดาษฉบับจริง
    Owner->>Owner: ถ่ายภาพ / สแกนสัญญาเป็นไฟล์รูป/PDF

    Note over Owner, DB: ขั้นตอนที่ 2: บันทึกเข้าระบบ
    Owner->>Front: เปิดหน้า /owner/contracts กด "สร้างสัญญาใหม่"
    Owner->>Front: ระบุห้องพัก, วันที่, เงินประกัน และแนบไฟล์สัญญา
    Owner->>Front: กดบันทึกสัญญา
    Front->>Back: POST /api/owner/contracts
    Back->>DB: บันทึกข้อมูลสัญญา (contracts table)
    Back->>DB: อัปเดตสถานะห้องเป็น Occupied (rooms table)
    Back->>DB: อัปเดต/สร้างข้อมูลผู้เช่าและผูกห้องพัก (tenants table)
    DB-->>Back: สำเร็จ
    Back-->>Front: { success: true, contractId }
    Front-->>Owner: แสดงข้อความ "บันทึกสัญญาและตั้งสิทธิ์เรียบร้อย"
    
    Note over Tenant, DB: ขั้นตอนที่ 3: ผู้เช่าเข้าใช้งาน
    Tenant->>Front: เข้าใช้งาน /tenant ด้วยบัญชีตนเอง
    Front->>Back: GET /api/tenant/info
    Back->>DB: ดึงข้อมูลห้องพักและสัญญา
    DB-->>Back: คืนข้อมูลห้องพัก
    Back-->>Front: ข้อมูลห้องพักและสถานะสัญญา
    Front-->>Tenant: แสดงห้องพักพร้อมใช้งานและบิลค่าเช่า`
  },
  {
    id: 'booking',
    title: '2. การจองห้องพัก & ชำระเงินมัดจำ (Room Booking & Approval)',
    badge: 'Public / Tenant / Owner',
    category: 'การจองห้องพัก',
    description: 'ขั้นตอนตั้งแต่ผู้เช่าสำรวจหอพัก เลือกห้อง ส่งคำขอจอง ชำระเงินมัดจำผ่าน QR Code จนถึงเจ้าของหอพักตรวจสอบและอนุมัติการจอง',
    actors: ['ผู้สนใจเช่า (Guest/Tenant)', 'ระบบ SmartDom Frontend', 'ระบบชำระเงิน PromptPay QR', 'เจ้าของหอพัก (Owner)'],
    steps: [
      { step: 1, actor: 'Guest/Tenant', action: 'ค้นหาหอพักในหน้า /explore และเลือกดูรายละเอียดห้อง', target: 'Web Frontend' },
      { step: 2, actor: 'Guest/Tenant', action: 'กด "จองห้องพัก" พร้อมกรอกข้อมูลติดต่อและระยะเวลาเข้าพัก', target: 'Web Frontend' },
      { step: 3, actor: 'Frontend', action: 'สร้างคำขอจอง POST /api/booking', target: 'Backend Server' },
      { step: 4, actor: 'Backend', action: 'สร้างรายการจองสถานะ Pending Deposit และสร้าง QR Code PromptPay', target: 'Database' },
      { step: 5, actor: 'Guest/Tenant', action: 'สแกน QR Code ชำระเงินมัดจำและแนบหลักฐานสลิป', target: 'Payment Gateway' },
      { step: 6, actor: 'Owner', action: 'ได้รับการแจ้งเตือนและเข้าดูรายการจองที่ /owner/bookings', target: 'Owner Portal' },
      { step: 7, actor: 'Owner', action: 'ตรวจสอบสลิปและกดยืนยันอนุมัติการจอง (Approve)', target: 'Backend Server' },
      { step: 8, actor: 'Backend', action: 'ปรับสถานะห้องเป็น Booked และส่งข้อความยืนยันให้ผู้เช่า', target: 'Database' }
    ],
    mermaidCode: `sequenceDiagram
    autonumber
    actor User as 👤 ผู้เช่า / ผู้ใช้งาน
    participant Front as 💻 SmartDom Web
    participant Back as ⚙️ Backend API
    participant DB as 🗄️ Database
    actor Owner as 🏢 เจ้าของหอ (Owner)

    User->>Front: เลือกห้องพักที่สนใจ (/explore/room/[id])
    User->>Front: กรอกข้อมูลและกดยืนยันการจอง
    Front->>Back: POST /api/booking/create
    Back->>DB: บันทึกการจอง (bookings, status: pending)
    Back-->>Front: รายละเอียดการจอง + PromptPay QR
    User->>Front: สแกนจ่ายเงินมัดจำ + แนบสลิปโอนเงิน
    Front->>Back: POST /api/booking/upload-slip
    Back->>DB: บันทึกสลิป (status: waiting_approval)
    Back-->>Owner: ส่ง Notification แจ้งมีรายการจองใหม่
    Owner->>Front: เปิดหน้า /owner/bookings ตรวจสอบสลิป
    Owner->>Front: กด "อนุมัติการจอง" (Approve)
    Front->>Back: POST /api/owner/bookings/approve
    Back->>DB: อัปเดตสถานะการจอง = Confirmed & ห้อง = Booked
    DB-->>Back: สำเร็จ
    Back-->>Front: แจ้งผลอนุมัติ
    Front-->>User: แสดงสถานะการจองสำเร็จ พร้อมนัดหมายวันทำสัญญา`
  },
  {
    id: 'meter_billing',
    title: '3. จดมิเตอร์น้ำ-ไฟ & ออกบิลค่าเช่า (Meter Reading & Invoice)',
    badge: 'Owner / Keeper / Tenant',
    category: 'มิเตอร์และการเงิน',
    description: 'การบันทึกตัวเลขมิเตอร์น้ำ-ไฟประจำงวด คำนวณยอดการใช้พลังงาน และรวมยอดเป็นใบแจ้งหนี้ส่งให้ผู้เช่าแต่ละห้อง',
    actors: ['เจ้าของ/ผู้ดูแล (Owner/Keeper)', 'ระบบ SmartDom Frontend', 'ระบบคำนวณบิล Backend', 'ผู้เช่า (Tenant)'],
    steps: [
      { step: 1, actor: 'Owner/Keeper', action: 'เดินจดเลขมิเตอร์น้ำ-ไฟ หรือบันทึกผ่าน /owner/meters', target: 'Mobile / Web' },
      { step: 2, actor: 'Owner/Keeper', action: 'กรอกเลขมิเตอร์น้ำ/ไฟปัจจุบันของแต่ละห้อง', target: 'Frontend' },
      { step: 3, actor: 'Frontend', action: 'ส่งข้อมูล POST /api/owner/meters/record', target: 'Backend Server' },
      { step: 4, actor: 'Backend', action: 'คำนวณจำนวนหน่วยที่ใช้ (Current - Previous) x อัตราค่าน้ำค่าไฟ', target: 'Backend Engine' },
      { step: 5, actor: 'Owner', action: 'ตรวจสอบยอดรวมค่าเช่า + ค่าน้ำ + ค่าไฟ แล้วกด "ออกบิลประจำเดือน"', target: 'Owner Portal' },
      { step: 6, actor: 'Backend', action: 'สร้างใบแจ้งหนี้ (invoices / bills) สถานะ Unpaid', target: 'Database' },
      { step: 7, actor: 'Tenant', action: 'ได้รับการแจ้งเตือนบิลใหม่ และเปิดดูรายละเอียดบิลใน /tenant/billing', target: 'Tenant Portal' }
    ],
    mermaidCode: `sequenceDiagram
    autonumber
    actor Staff as 🏢 เจ้าของหอ / ผู้ดูแล
    participant Front as 💻 SmartDom Web
    participant Back as ⚙️ Backend API
    participant DB as 🗄️ Database
    actor Tenant as 👤 ผู้เช่า (Tenant)

    Staff->>Front: เข้าหน้า /owner/meters (จดมิเตอร์)
    Front->>Back: GET /api/owner/meters?month=YYYY-MM
    Back->>DB: ดึงเลขมิเตอร์เดือนก่อนหน้า
    DB-->>Back: คืนเลขมิเตอร์เดิม
    Back-->>Front: แสดงแบบฟอร์มจดมิเตอร์
    Staff->>Front: กรอกเลขมิเตอร์น้ำและไฟงวดปัจจุบัน
    Front->>Back: POST /api/owner/meters/save
    Back->>DB: บันทึกประวัติมิเตอร์ (meter_readings)
    Staff->>Front: ไปที่หน้า /owner/billing กด "สร้างบิลประจำงวด"
    Front->>Back: POST /api/owner/billing/batch
    Back->>DB: รวม (ค่าเช่าห้อง + ค่าน้ำ + ค่าไฟ + ค่าบริการ)
    Back->>DB: บันทึกใบแจ้งหนี้ (invoices, status: unpaid)
    DB-->>Back: สำเร็จ
    Back-->>Tenant: ส่ง Notification แจ้งเตือนบิลค่าเช่าใหม่
    Tenant->>Front: เปิดหน้า /tenant/billing ตรวจสอบรายการบิล`
  },
  {
    id: 'payment',
    title: '4. การชำระค่าเช่า & ตรวจสอบสลิป (Payment & Slip Verification)',
    badge: 'Tenant / Owner',
    category: 'การชำระเงิน',
    description: 'ผู้เช่าเปิดบิล สแกน QR Code PromptPay ชำระเงิน แนบสลิปโอนเงิน เจ้าของหอพักตรวจสอบสลิปและปรับสถานะเป็นชำระเงินแล้ว',
    actors: ['ผู้เช่า (Tenant)', 'ระบบ SmartDom Frontend', 'ระบบ PromptPay', 'เจ้าของหอพัก (Owner)'],
    steps: [
      { step: 1, actor: 'Tenant', action: 'เปิดดูบิลค่าเช่าที่ยังไม่ได้ชำระในหน้า /tenant/billing', target: 'Tenant Portal' },
      { step: 2, actor: 'Tenant', action: 'กดปุ่ม "ชำระเงิน" ระบบสร้าง QR Code พร้อมยอดเงินที่ถูกต้อง', target: 'Frontend' },
      { step: 3, actor: 'Tenant', action: 'เปิดแอปธนาคารสแกนจ่ายและบันทึกสลิป', target: 'Mobile Banking' },
      { step: 4, actor: 'Tenant', action: 'อัปโหลดสลิปหลักฐานโอนเงินเข้าสู่ระบบ', target: 'Frontend' },
      { step: 5, actor: 'Frontend', action: 'ส่งคำขอ POST /api/tenant/billing/payment พร้อมแนบสลิป', target: 'Backend Server' },
      { step: 6, actor: 'Backend', action: 'ปรับสถานะบิลเป็น Pending Verification (รอตรวจสอบ)', target: 'Database' },
      { step: 7, actor: 'Owner', action: 'ตรวจสอบรายการชำระเงินใน /owner/billing และตรวจความถูกต้องของสลิป', target: 'Owner Portal' },
      { step: 8, actor: 'Owner', action: 'กดยืนยันชำระเงิน (Confirm Payment) ระบบออกใบเสร็จรับเงิน', target: 'Database' }
    ],
    mermaidCode: `sequenceDiagram
    autonumber
    actor Tenant as 👤 ผู้เช่า (Tenant)
    participant Front as 💻 SmartDom Web
    participant Back as ⚙️ Backend API
    participant DB as 🗄️ Database
    actor Owner as 🏢 เจ้าของหอ (Owner)

    Tenant->>Front: เข้าสู่ /tenant/billing เลือกบิลที่ยังไม่จ่าย
    Front->>Back: GET /api/tenant/billing/qr?invoiceId=...
    Back-->>Front: ส่ง QR Code PromptPay ตามยอดจริง
    Tenant->>Tenant: สแกนจ่ายเงินผ่าน Mobile Banking
    Tenant->>Front: อัปโหลดรูปสลิปหลักฐานการโอนเงิน
    Front->>Back: POST /api/tenant/billing/payment
    Back->>DB: อัปเดตสถานะบิล = Pending Review + แนบรูปสลิป
    DB-->>Back: สำเร็จ
    Back-->>Owner: ส่งแจ้งเตือนมีสลิปใหม่รอตรวจสอบ
    Owner->>Front: เข้าหน้า /owner/billing กดดูสลิป
    Owner->>Front: กดยืนยัน "รับยอดเงินเรียบร้อย"
    Front->>Back: POST /api/owner/billing/[id]/verify
    Back->>DB: อัปเดตสถานะบิล = Paid + ออก Receipt No.
    DB-->>Back: สำเร็จ
    Back-->>Tenant: ส่งแจ้งเตือน "ชำระเงินสำเร็จแล้ว"`
  },
  {
    id: 'maintenance',
    title: '5. แจ้งซ่อมและจ่ายงานช่าง/แม่บ้าน (Maintenance & Dispatch)',
    badge: 'Tenant / Owner / Keeper',
    category: 'การบริการ & ซ่อมบำรุง',
    description: 'ผู้เช่าแจ้งปัญหาในห้องพัก เจ้าของหอพักรับเรื่องและมอบหมายงานให้ช่างหรือแม่บ้าน จากนั้นทีมผู้ดูแลอัปเดตสถานะการแก้ไขจนเสร็จสิ้น',
    actors: ['ผู้เช่า (Tenant)', 'เจ้าของหอพัก (Owner)', 'ช่างซ่อม/แม่บ้าน (Keeper)', 'ระบบฐานข้อมูล SmartDom'],
    steps: [
      { step: 1, actor: 'Tenant', action: 'เข้าเมนู /tenant/maintenance กรอกหัวข้อปัญหา ระบุห้อง และแนบรูปถ่าย', target: 'Tenant Portal' },
      { step: 2, actor: 'Frontend', action: 'ส่งคำขอแจ้งซ่อม POST /api/tenant/maintenance', target: 'Backend Server' },
      { step: 3, actor: 'Backend', action: 'บันทึกคำขอแจ้งซ่อมสถานะ Pending', target: 'Database' },
      { step: 4, actor: 'Owner', action: 'เปิดดูคำขอที่ /owner/maintenance แล้วเลือกมอบหมายงาน (ช่าง หรือ แม่บ้าน)', target: 'Owner Portal' },
      { step: 5, actor: 'Backend', action: 'อัปเดตสถานะ Assigned และแจ้งเตือนไปยัง Keeper Portal', target: 'Database' },
      { step: 6, actor: 'Keeper', action: 'เปิดดูรายการงานใน /keeper/technician หรือ /keeper/maid', target: 'Keeper Portal' },
      { step: 7, actor: 'Keeper', action: 'เข้าดำเนินการแก้ไข และอัปเดตสถานะเป็น "เสร็จสิ้น" พร้อมแนบรูปหลังซ่อม', target: 'Keeper Portal' },
      { step: 8, actor: 'Tenant', action: 'ได้รับการแจ้งเตือนงานเสร็จสิ้น และสามารถให้คะแนนความพึงพอใจได้', target: 'Tenant Portal' }
    ],
    mermaidCode: `sequenceDiagram
    autonumber
    actor Tenant as 👤 ผู้เช่า (Tenant)
    participant Front as 💻 SmartDom Web
    participant Back as ⚙️ Backend API
    participant DB as 🗄️ Database
    actor Owner as 🏢 เจ้าของหอ (Owner)
    actor Keeper as 🔧 ช่าง / 🧹 แม่บ้าน

    Tenant->>Front: เข้าหน้าแจ้งซ่อม /tenant/maintenance
    Tenant->>Front: ระบุอาการ + แนบภาพถ่ายจุดชำรุด
    Front->>Back: POST /api/maintenance/create
    Back->>DB: บันทึกใบแจ้งซ่อม (status: pending)
    Back-->>Owner: ส่งแจ้งเตือนคำขอแจ้งซ่อมใหม่
    Owner->>Front: เข้าหน้า /owner/maintenance ตรวจสอบเรื่อง
    Owner->>Front: เลือกมอบหมายให้ช่าง/แม่บ้านประจำหอ
    Front->>Back: POST /api/owner/maintenance/assign
    Back->>DB: อัปเดตสถานะ = Assigned + keeper_id
    Back-->>Keeper: ส่งงานเข้า Keeper Portal
    Keeper->>Front: ล็อกอินเข้า /keeper (ดูงานที่ได้รับมอบหมาย)
    Keeper->>Keeper: เข้าดำเนินการซ่อมแซมหน้างาน
    Keeper->>Front: กดบันทึก "ดำเนินการเสร็จสิ้น" + แนบภาพหลังซ่อม
    Front->>Back: POST /api/keeper/maintenance/complete
    Back->>DB: อัปเดตสถานะ = Completed
    Back-->>Tenant: ส่งแจ้งเตือนงานซ่อมเสร็จสิ้น
    Tenant-->>Front: ตรวจสอบห้องพักและรับทราบผล`
  },
  {
    id: 'chat',
    title: '6. ระบบสนทนาสื่อสาร (Live Chat Messaging)',
    badge: 'Tenant / Owner',
    category: 'การสื่อสาร',
    description: 'การรับส่งข้อความ Real-time ระหว่างผู้เช่าแต่ละห้องกับเจ้าของหอพัก เพื่อสอบถามข้อมูล ร้องเรียน หรือประสานงานด่วน',
    actors: ['ผู้เช่า (Tenant)', 'ระบบ Chat Frontend', 'Message API & Socket/Polling', 'เจ้าของหอพัก (Owner)'],
    steps: [
      { step: 1, actor: 'Tenant', action: 'เปิดหน้าต่างแชทใน /tenant/chat หรือ Chat Widget', target: 'Tenant Portal' },
      { step: 2, actor: 'Tenant', action: 'พิมพ์ข้อความหรือส่งรูปภาพสอบถาม', target: 'Frontend' },
      { step: 3, actor: 'Frontend', action: 'ส่งข้อความ POST /api/chat/messages', target: 'Backend Server' },
      { step: 4, actor: 'Backend', action: 'บันทึกข้อความ (chat_messages table) พร้อมห้องและเวลา', target: 'Database' },
      { step: 5, actor: 'Owner', action: 'หน้า /owner/chat ได้รับข้อความใหม่และขึ้น Badge แจ้งเตือน', target: 'Owner Portal' },
      { step: 6, actor: 'Owner', action: 'พิมพ์ข้อความตอบกลับผู้เช่า', target: 'Owner Portal' },
      { step: 7, actor: 'Tenant', action: 'ได้รับข้อความตอบกลับในหน้าต่างแชททันที', target: 'Tenant Portal' }
    ],
    mermaidCode: `sequenceDiagram
    autonumber
    actor Tenant as 👤 ผู้เช่า (Tenant)
    participant TFront as 💻 Tenant Chat
    participant API as ⚙️ Chat API
    participant DB as 🗄️ Database
    participant OFront as 💻 Owner Chat
    actor Owner as 🏢 เจ้าของหอ (Owner)

    Tenant->>TFront: เปิดห้องสนทนา พิมพ์ข้อความ "สอบถามค่าน้ำครับ"
    TFront->>API: POST /api/chat/messages { sender: tenant, message }
    API->>DB: บันทึกข้อความลง chat_messages
    DB-->>API: บันทึกสำเร็จ
    API-->>TFront: อัปเดตข้อความในฝั่งผู้เช่า
    API-->>OFront: ส่งสัญญาณข้อความใหม่ (Notification / Polling)
    OFront-->>Owner: แสดง Badge แจ้งเตือนข้อความเข้า
    Owner->>OFront: เปิดหน้า /owner/chat และพิมพ์ข้อความตอบกลับ
    OFront->>API: POST /api/chat/messages { sender: owner, message }
    API->>DB: บันทึกข้อความตอบกลับ
    API-->>TFront: แสดงข้อความตอบกลับของเจ้าของหอพัก`
  },
  {
    id: 'dorm_mgmt',
    title: '7. จัดการหอพักและห้องพัก (Dorm & Room Management)',
    badge: 'Owner / Admin',
    category: 'การบริหารจัดการ',
    description: 'การลงทะเบียนหอพัก การเพิ่มห้องพัก กำหนดราคา อุปกรณ์สิ่งอำนวยความสะดวก และการตั้งค่าอัตราค่าน้ำค่าไฟ',
    actors: ['เจ้าของหอพัก (Owner)', 'ระบบ SmartDom Frontend', 'Backend API', 'Admin ผู้ดูแลระบบ'],
    steps: [
      { step: 1, actor: 'Owner', action: 'เข้าสู่หน้า /owner/settings เพื่อกรอกข้อมูลหอพักและค่าน้ำค่าไฟ', target: 'Owner Portal' },
      { step: 2, actor: 'Owner', action: 'ไปที่หน้า /owner/rooms เพื่อเพิ่มห้องพัก ระบุชั้น ประเภทห้อง ราคา', target: 'Owner Portal' },
      { step: 3, actor: 'Frontend', action: 'ส่งข้อมูล POST /api/rooms บันทึกห้องพัก', target: 'Backend Server' },
      { step: 4, actor: 'Backend', action: 'บันทึกข้อมูลห้องพักลงฐานข้อมูล (rooms)', target: 'Database' },
      { step: 5, actor: 'Admin', action: 'ตรวจสอบความถูกต้องของข้อมูลหอพักในหน้า /admin/rooms', target: 'Admin Portal' },
      { step: 6, actor: 'Public User', action: 'ห้องพักที่เปิดให้เช่าจะไปปรากฏในหน้าสำรวจหอพัก /explore ทันที', target: 'Public Explore' }
    ],
    mermaidCode: `sequenceDiagram
    autonumber
    actor Owner as 🏢 เจ้าของหอพัก (Owner)
    participant Front as 💻 SmartDom Web
    participant Back as ⚙️ Backend API
    participant DB as 🗄️ Database
    actor Admin as 🛡️ ผู้ดูแลระบบ (Admin)
    actor Public as 🌐 ผู้ใช้งานทั่วไป (Public)

    Owner->>Front: เปิดหน้า /owner/rooms แล้วกด "เพิ่มห้องพัก"
    Owner->>Front: กรอกหมายเลขห้อง, ชั้น, ขนาด, ค่าเช่า, เครื่องอำนวยความสะดวก
    Front->>Back: POST /api/rooms
    Back->>DB: บันทึกห้องพักใหม่ (rooms table, status: Available)
    DB-->>Back: สำเร็จ
    Back-->>Front: คืนผลลัพธ์สำเร็จ
    Admin->>Front: เข้าตรวจสอบที่ /admin/rooms ดูสถิติห้องพักภาพรวม
    Public->>Front: เข้าหน้า /explore ค้นหาหอพัก
    Front->>Back: GET /api/explore/rooms
    Back->>DB: ดึงรายการห้องที่มีสถานะ Available
    DB-->>Back: ส่งรายการห้องว่าง
    Back-->>Front: แสดงห้องพักใหม่ให้นิสิต/ผู้เช่าเข้าชมและจองได้ทันที`
  }
];

export default function AdminDiagramsPage() {
  const [selectedId, setSelectedId] = useState<string>('contract');
  const [viewMode, setViewMode] = useState<'both' | 'diagram' | 'steps'>('both');

  const currentDiagram = diagrams.find(d => d.id === selectedId) || diagrams[0];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <span>← กลับหน้าหลัก</span>
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h1 className="font-display font-bold text-base text-foreground">
                แผนภาพลำดับการทำงานของระบบ (Sequence Diagrams)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              ✓ SmartDom Architecture v2.5
            </span>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Function Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {diagrams.map((d) => {
              const isActive = d.id === selectedId;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-md scale-[1.02]'
                      : 'bg-white text-muted-foreground hover:bg-slate-50 border-border'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">{d.badge}</p>
                  <p className="font-bold text-xs line-clamp-2 leading-tight">{d.title.split('. ')[1] || d.title}</p>
                </button>
              );
            })}
          </div>

          {/* Active Diagram Details Header */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                  <span>{currentDiagram.category}</span>
                  <span>•</span>
                  <span>{currentDiagram.badge}</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-foreground">{currentDiagram.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                  {currentDiagram.description}
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-border">
                {(['both', 'diagram', 'steps'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                      viewMode === m
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m === 'both' ? 'แสดงทั้งหมด' : m === 'diagram' ? 'แผนภาพโค้ด' : 'ขั้นตอนการทำงาน'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actors List */}
            <div className="py-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#A08D74] uppercase tracking-wider mr-2">ผู้เกี่ยวข้อง (Actors):</span>
              {currentDiagram.actors.map((actor) => (
                <span key={actor} className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
                  {actor}
                </span>
              ))}
            </div>

            {/* Main Visuals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
              
              {/* Left/Main: Step-by-Step Cards */}
              {(viewMode === 'both' || viewMode === 'steps') && (
                <div className={`${viewMode === 'both' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-3`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                    <span>📋 ลำดับขั้นตอนการทำงาน (Sequence Steps)</span>
                  </h3>
                  <div className="space-y-3">
                    {currentDiagram.steps.map((s) => (
                      <div
                        key={s.step}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-primary/40 transition-all flex items-start gap-3.5"
                      >
                        <div className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-0.5">
                          {s.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                            <span className="font-bold text-xs text-foreground bg-white px-2.5 py-0.5 rounded-lg border border-border shadow-2xs">
                              {s.actor}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              → {s.target}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-700 leading-snug">
                            {s.action}
                          </p>
                          {s.note && (
                            <p className="text-xs text-muted-foreground mt-1 bg-white/80 p-2 rounded-lg border border-slate-100 italic">
                              💡 {s.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Right/Secondary: Mermaid Sequence Code & Visual Preview */}
              {(viewMode === 'both' || viewMode === 'diagram') && (
                <div className={`${viewMode === 'both' ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col space-y-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span>⚡ Mermaid Code & Logic</span>
                    </h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentDiagram.mermaidCode);
                        alert('คัดลอกโค้ด Mermaid เรียบร้อยแล้ว!');
                      }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      คัดลอกโค้ด Diagram
                    </button>
                  </div>

                  <div className="flex-1 bg-[#0F172A] rounded-2xl p-5 text-emerald-400 font-mono text-xs overflow-x-auto border border-white/10 shadow-inner">
                    <pre className="whitespace-pre">{currentDiagram.mermaidCode}</pre>
                  </div>

                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-amber-900 text-xs">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <span>💡 คำแนะนำสำหรับการทำเล่มวิจัย / รายงาน</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed">
                      สามารถนำโค้ด Mermaid ด้านบนไปวางในโปรแกรม <strong>Mermaid Live Editor</strong>, <strong>Notion</strong> หรือ <strong>draw.io</strong> เพื่อ Export เป็นภาพความละเอียดสูง (PNG/SVG) ไปใส่ในรูปเล่มปริญญานิพนธ์ได้ทันที
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
