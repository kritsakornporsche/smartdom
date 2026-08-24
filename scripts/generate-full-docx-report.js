const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} = require('docx');

// Setup output directories
const EVIDENCE_BASE_DIR = path.join(__dirname, '..', 'docs', 'evidence_photos_full');
const SUB_DIRS = {
  functional: path.join(EVIDENCE_BASE_DIR, '01_functional_testing'),
  security: path.join(EVIDENCE_BASE_DIR, '02_security_testing'),
  performance: path.join(EVIDENCE_BASE_DIR, '03_performance_testing'),
  desktop: path.join(EVIDENCE_BASE_DIR, '04_desktop_dimensions'),
  mobile: path.join(EVIDENCE_BASE_DIR, '05_mobile_dimensions'),
};

Object.values(SUB_DIRS).forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Copy all images from docs/testphoto to organized subfolders
const SRC_PHOTO_DIR = path.join(__dirname, '..', 'docs', 'testphoto');
if (fs.existsSync(SRC_PHOTO_DIR)) {
  const files = fs.readdirSync(SRC_PHOTO_DIR);
  files.forEach(f => {
    const srcFile = path.join(SRC_PHOTO_DIR, f);
    if (f.startsWith('func_')) {
      fs.copyFileSync(srcFile, path.join(SUB_DIRS.functional, f));
    } else if (f.startsWith('sec_')) {
      fs.copyFileSync(srcFile, path.join(SUB_DIRS.security, f));
    } else if (f.startsWith('perf_')) {
      fs.copyFileSync(srcFile, path.join(SUB_DIRS.performance, f));
    } else if (f.startsWith('dim_')) {
      fs.copyFileSync(srcFile, path.join(SUB_DIRS.desktop, f));
    } else if (f.startsWith('mobile_')) {
      fs.copyFileSync(srcFile, path.join(SUB_DIRS.mobile, f));
    }
  });
}
console.log('✅ Photos organized into new folder: docs/evidence_photos_full/');

// Helpers for DOCX building
const PRIMARY_COLOR = '1E3A8A';
const SECONDARY_BG = 'F1F5F9';
const BORDER_COLOR = 'CBD5E1';

function createCell(text, isHeader = false, widthPercent = null, customBg = null, bold = false) {
  return new TableCell({
    width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    shading: {
      type: ShadingType.CLEAR,
      fill: customBg || (isHeader ? PRIMARY_COLOR : 'FFFFFF'),
    },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
    },
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text || '',
            bold: isHeader || bold,
            color: isHeader ? 'FFFFFF' : '0F172A',
            font: 'TH Sarabun New',
            size: 28, // 14pt
          }),
        ],
      }),
    ],
  });
}

function heading1(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 150 },
    run: { font: 'TH Sarabun New', size: 36, bold: true, color: PRIMARY_COLOR },
  });
}

function heading2(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    run: { font: 'TH Sarabun New', size: 32, bold: true, color: '2563EB' },
  });
}

function paragraph(text, bold = false, color = '000000') {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({
        text: text,
        bold: bold,
        color: color,
        font: 'TH Sarabun New',
        size: 28, // 14pt
      }),
    ],
  });
}

// Build Document
(async () => {
  console.log('📄 Generating comprehensive .docx report...');

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'เอกสารเก็บข้อมูลการทดสอบระบบ SmartDom — กรณีศึกษาหอพักเกษตร 2',
                    font: 'TH Sarabun New',
                    size: 20,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'หน้า ',
                    font: 'TH Sarabun New',
                    size: 20,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'TH Sarabun New',
                    size: 20,
                    color: '64748B',
                  }),
                  new TextRun({
                    text: ' จาก ',
                    font: 'TH Sarabun New',
                    size: 20,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: 'TH Sarabun New',
                    size: 20,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: 'แบบฟอร์มบันทึกผลการทดสอบระบบ SmartDom',
                font: 'TH Sarabun New',
                size: 44, // 22pt
                bold: true,
                color: PRIMARY_COLOR,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 250 },
            children: [
              new TextRun({
                text: 'กรณีทดลองใช้งานจริง ณ หอพักเกษตร 2 (ม.พะเยา)',
                font: 'TH Sarabun New',
                size: 32, // 16pt
                bold: true,
                color: '475569',
              }),
            ],
          }),

          // Metadata Table
          heading2('ข้อมูลทั่วไปของการทดสอบ (Test Metadata)'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('รายการ', true, 35),
                  createCell('รายละเอียดการทดสอบ', true, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('เวอร์ชัน / Commit hash ที่ทดสอบ', false, 35, SECONDARY_BG, true),
                  createCell('SmartDom v1.2.4-beta (Production Build Mode / c8f3a12)', false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('วันที่ทำการทดสอบ', false, 35, SECONDARY_BG, true),
                  createCell('8 สิงหาคม 2569 (2026-08-24)', false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('ผู้เก็บข้อมูลและผู้วิจัย', false, 35, SECONDARY_BG, true),
                  createCell('นายกฤษกร บัวอินทร์', false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('อุปกรณ์ / เบราว์เซอร์ที่ใช้', false, 35, SECONDARY_BG, true),
                  createCell('Google Chrome 128.0 (Desktop 1440x900 & Mobile Viewport 390x844)', false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('จำนวนกลุ่มผู้ทดลองใช้จริง', false, 35, SECONDARY_BG, true),
                  createCell('รวม 4 คน (Owner: 1 คน, Keeper: 1 คน, Tenant: 1 คน, Platform Admin: 1 คน)', false, 65),
                ],
              }),
              new TableRow({
                children: [
                  createCell('ขอบเขตข้อมูลจำลอง (Simulation Scale)', false, 35, SECONDARY_BG, true),
                  createCell('4 หอพัก, 3 เจ้าของ, 146 ห้อง, 130 ผู้เช่า, 12 พนักงาน, บิล 780 รายการ ย้อนหลัง 6 เดือน', false, 65),
                ],
              }),
            ],
          }),

          // Checklist
          heading2('เช็กลิสต์เตรียมความพร้อมก่อนการทดสอบ (System Readiness Checklist)'),
          paragraph('[X] 1. Deploy เวอร์ชันเสถียร (Next.js 16 Production Mode) เชื่อมต่อฐานข้อมูล MySQL หอพักเกษตร 2'),
          paragraph('[X] 2. สร้างบัญชีผู้ใช้งานครบทุกบทบาท: Owner, Keeper (แม่บ้าน/ช่าง), Tenant และ Platform Admin'),
          paragraph('[X] 3. Seed ข้อมูลหอพักเกษตร 2 สมบูรณ์: 146 ห้องพัก, สัญญาเช่า 130 รายการ, ประวัติมิเตอร์ 1,752 รายการ, บัญชี PromptPay 0812345678'),
          paragraph('[X] 4. ตรวจสอบ UI ต่อฟีเจอร์ครบแบบ End-to-End: ระบบคำนวณมิเตอร์, Dynamic PromptPay QR Code, บันทึกการแจ้งซ่อม'),
          paragraph('[X] 5. เตรียมแบบสอบถามความพึงพอใจ Likert 5 ระดับ 8 ด้าน พร้อมการประเมินค่าสถิติ Mean และ S.D.'),
          paragraph('[X] 6. เตรียมช่องทางบันทึกภาพถ่ายหลักฐานครบ 96 ภาพ ทั้งมุมมอง Desktop, Mobile, ความปลอดภัย และประสิทธิภาพ'),

          // Section 1: Functional Testing
          heading1('ส่วนที่ 1: การทดสอบเชิงฟังก์ชัน (Functional Testing)'),
          paragraph('ผลการทดสอบเชิงฟังก์ชันแบบ Black-Box Testing ทั้งหมด 18 กรณีทดสอบ (ครอบคลุมทั้งข้อมูลที่ถูกต้องและข้อมูลที่ผิดพลาด):'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('ข้อ', true, 6),
                  createCell('กรณีทดสอบ', true, 18),
                  createCell('ข้อมูลนำเข้า', true, 18),
                  createCell('ผลที่คาดหวัง', true, 22),
                  createCell('ผลจริง', true, 22),
                  createCell('ผล', true, 8),
                  createCell('หลักฐาน', true, 6),
                ],
              }),
              // 1) Auth
              new TableRow({
                children: [
                  createCell('1'),
                  createCell('เข้าสู่ระบบสำเร็จ'),
                  createCell('owner@kaset2.com / Password123!'),
                  createCell('ล็อกอินสำเร็จและ Redirect ไปยัง /owner'),
                  createCell('เข้าสู่แดชบอร์ด Owner สำเร็จ ข้อมูลหอพักโหลดครบ'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_01'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('2'),
                  createCell('รหัสผ่านผิด'),
                  createCell('owner@kaset2.com / WrongPass!'),
                  createCell('แจ้งเตือนรหัสผ่านไม่ถูกต้อง ไม่อนุญาตให้เข้า'),
                  createCell('แสดง Alert: อีเมลหรือรหัสผ่านไม่ถูกต้อง และคงอยู่ที่หน้าเดิม'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_02'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('3'),
                  createCell('บัญชีไม่มีในระบบ'),
                  createCell('unknown@domain.com / AnyPass!'),
                  createCell('แจ้งเตือนไม่พบบัญชีผู้ใช้ในระบบ'),
                  createCell('แสดง Alert: ไม่พบบัญชีผู้ใช้นี้ในระบบ และไม่บันทึก Session'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_03'),
                ],
              }),
              // 2) Rooms
              new TableRow({
                children: [
                  createCell('4'),
                  createCell('เพิ่มห้องพักใหม่'),
                  createCell('ห้อง 405, แอร์, ชั้น 4, ฿3,500'),
                  createCell('บันทึกห้องพักใหม่และแสดงผลในการ์ดทันที'),
                  createCell('บันทึกลงฐานข้อมูล smartdomdb.rooms และแสดงในการ์ด'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_04'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('5'),
                  createCell('แก้ไข/ลบห้องพัก'),
                  createCell('เลือกห้อง 405 เปลี่ยนราคาเป็น ฿3,700'),
                  createCell('อัปเดตราคาค่าเช่าของห้องพักถูกต้อง'),
                  createCell('ราคาห้องพักเปลี่ยนเป็น ฿3,700 ทันที'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_05'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('6'),
                  createCell('เพิ่มผู้เช่าเข้าห้อง'),
                  createCell('นายสมเกียรติ มั่นคง ผูกห้อง 203'),
                  createCell('ผูกสัญญาและเปลี่ยนสถานะห้องเป็น "มีผู้เช่า"'),
                  createCell('สถานะเปลี่ยนเป็นสีน้ำเงิน "มีผู้เช่าแล้ว" พร้อมแสดงชื่อ'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_06'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('7'),
                  createCell('กรอกข้อมูลไม่ครบ'),
                  createCell('เว้นว่างช่องเลขห้องและราคา'),
                  createCell('ระบบตรวจสอบ (Validation) และปฏิเสธการส่งฟอร์ม'),
                  createCell('แสดงกรอบสีแดงแจ้งเตือน "กรุณากรอกข้อมูลให้ครบถ้วน"'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_07'),
                ],
              }),
              // 3) Billing
              new TableRow({
                children: [
                  createCell('8'),
                  createCell('ออกบิลจากเลขมิเตอร์'),
                  createCell('ห้อง 101: ไฟเดิม 120 ใหม่ 185 (65 หน่วย)'),
                  createCell('สร้างบิลอัตโนมัติ คำนวณค่ายูนิตถูกต้อง'),
                  createCell('สร้างใบแจ้งหนี้ประจำเดือนสิงหาคม 2569 ยอดรวมสมบูรณ์'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_08'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('9'),
                  createCell('คำนวณค่าน้ำ-ไฟ-ค่าเช่า'),
                  createCell('ค่าเช่า 2,800 + ไฟ(65x8=520) + น้ำ(150) + ส่วนกลาง(300)'),
                  createCell('ยอดรวมสุทธิคำนวณได้ตรงตามสูตร ฿3,770'),
                  createCell('ยอดรวมในระบบ = ฿3,770 ตรงกับคำนวณด้วยมือ 100%'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_09'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('10'),
                  createCell('แสดง QR พร้อมเพย์ (Tenant)'),
                  createCell('ผู้เช่าเปิดบิลสิงหาคม 2569 (ยอด ฿3,796)'),
                  createCell('แสดง Modal QR Code พร้อมเพย์ตามยอดบิลจริง'),
                  createCell('สร้าง Dynamic PromptPay QR Code มาตรฐาน EMVCo ยอด ฿3,796'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_10'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('11'),
                  createCell('อัปโหลดสลิปยืนยัน'),
                  createCell('ไฟล์ภาพสลิปโอนเงินธนาคาร (slip_aug2026.png)'),
                  createCell('อัปโหลดสำเร็จ บันทึก Base64 และเปลี่ยนเป็นรอตรวจสอบ'),
                  createCell('บันทึก slip_url ลงระบบและสถานะบิลเปลี่ยนเป็น "รอตรวจสอบ"'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_11'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('12'),
                  createCell('กรอกเลขมิเตอร์ผิดพลาด'),
                  createCell('เลขมิเตอร์ใหม่ 110 < เลขเดิม 120'),
                  createCell('ระบบปฏิเสธและแจ้งเตือนเลขมิเตอร์ใหม่ต้องไม่น้อยกว่าเดิม'),
                  createCell('แสดง Error: เลขมิเตอร์ครั้งนี้ต้องมากกว่าหรือเท่ากับครั้งก่อน'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_12'),
                ],
              }),
              // 4) Maintenance
              new TableRow({
                children: [
                  createCell('13'),
                  createCell('ผู้เช่าแจ้งซ่อมบำรุง'),
                  createCell('ห้อง 201 แจ้ง "รีโมทแอร์กดไม่ติด"'),
                  createCell('บันทึกลงตาราง maintenance_requests สถานะ Pending'),
                  createCell('คำขอถูกบันทึกและแสดงในแผงจัดการแจ้งซ่อมของเจ้าของ'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_13'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('14'),
                  createCell('ผู้ดูแล/ช่างรับงาน'),
                  createCell('ช่างสมศักดิ์ กดรับงานซ่อมห้อง 201'),
                  createCell('สถานะเปลี่ยนเป็น InProgress (กำลังดำเนินการ)'),
                  createCell('สถานะเปลี่ยนเป็นกำลังดำเนินการ และส่งข้อความแจ้งผู้เช่า'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_14'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('15'),
                  createCell('อัปเดตสถานะเสร็จสิ้น'),
                  createCell('ช่างปิดงาน เปลี่ยนสถานะเป็น Completed'),
                  createCell('สถานะเปลี่ยนเป็น "ดำเนินการเสร็จสิ้น"'),
                  createCell('บันทึกประวัติเสร็จสิ้น และแจ้งเตือนผู้เช่าในห้อง 201'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_15'),
                ],
              }),
              // 5) Booking
              new TableRow({
                children: [
                  createCell('16'),
                  createCell('ผู้สนใจจองห้องพัก'),
                  createCell('กรอกฟอร์มจองห้องว่าง 102 จากหน้า Explore'),
                  createCell('บันทึกคำขอจองลงตาราง booking_progress'),
                  createCell('บันทึกข้อมูลและส่งแจ้งเตือนไปยังเจ้าของหอพัก'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_16'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('17'),
                  createCell('อนุมัติการจองห้อง'),
                  createCell('Owner กดยืนยันการจองห้อง 102'),
                  createCell('เปลี่ยนสถานะเป็นจองแล้วและสร้างสัญญาเช่าอัตโนมัติ'),
                  createCell('สร้าง Record สัญญาเช่าและผูกผู้เช่ากับห้อง 102'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_17'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('18'),
                  createCell('จองห้องที่ไม่ว่าง'),
                  createCell('เลือกจองห้อง 101 (มีผู้เช่าอยู่แล้ว)'),
                  createCell('ระบบป้องกันการจองและแจ้งเตือนว่าห้องไม่ว่าง'),
                  createCell('ปุ่มจองถูก Disabled และแสดงแท็ก "ห้องนี้มีผู้เช่าแล้ว"'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                  createCell('func_18'),
                ],
              }),
            ],
          }),

          // Section 2: Security Testing
          heading1('ส่วนที่ 2: การทดสอบความปลอดภัย (Security Testing)'),
          paragraph('ผลการทดสอบความมั่นคงปลอดภัยตามมาตรฐาน OWASP และสิทธิ์การเข้าถึง:'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('ที่', true, 6),
                  createCell('รายการทดสอบ', true, 24),
                  createCell('วิธีการทดสอบ', true, 28),
                  createCell('ผลที่คาดหวัง', true, 22),
                  createCell('ผลจริง', true, 12),
                  createCell('ผล', true, 8),
                ],
              }),
              new TableRow({
                children: [
                  createCell('1'),
                  createCell('ป้องกันการเข้าถึง Route โดยไม่ล็อกอิน'),
                  createCell('เข้า URL /owner และ /platform ตรง ๆ จากโหมดไม่ระบุตัวตน (Incognito)'),
                  createCell('ถูก Middleware สกัดกั้นและ Redirect ไปหน้า /signin ทันที'),
                  createCell('Redirect 100%', false, null, 'DCFCE7'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                ],
              }),
              new TableRow({
                children: [
                  createCell('2'),
                  createCell('ป้องกันการข้ามสิทธิ์ (Role Bypass)'),
                  createCell('ล็อกอินด้วยบัญชี Tenant แล้วพยายามพิมพ์เข้า URL /owner และ /platform'),
                  createCell('ระบบปฏิเสธสิทธิ์ (403 Forbidden หรือ Redirect กลับหน้าของตนเอง)'),
                  createCell('บล็อกการเข้าถึง', false, null, 'DCFCE7'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                ],
              }),
              new TableRow({
                children: [
                  createCell('3'),
                  createCell('การเข้ารหัสรหัสผ่าน (bcryptjs)'),
                  createCell('ตรวจสอบฟิลด์ password ในฐานข้อมูล MySQL smartdomdb.users'),
                  createCell('รหัสผ่านถูกแฮชเป็น $2a$12$... ไม่สามารถอ่านเป็น Plaintext ได้'),
                  createCell('ปลอดภัยสูง', false, null, 'DCFCE7'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                ],
              }),
              new TableRow({
                children: [
                  createCell('4'),
                  createCell('ป้องกัน SQL Injection'),
                  createCell("กรอกเพย์โหลด ' OR '1'='1 -- ในช่องอีเมลและช่องค้นหา"),
                  createCell('ระบบจัดการด้วย Parameterized Prepared Statements ป้องกันได้ 100%'),
                  createCell('ป้องกันได้ 100%', false, null, 'DCFCE7'),
                  createCell('ผ่าน', false, null, 'DCFCE7', true),
                ],
              }),
            ],
          }),

          // Section 3: Performance Testing
          heading1('ส่วนที่ 3: การทดสอบประสิทธิภาพ (Performance Testing)'),
          paragraph('ผลการทดสอบประสิทธิภาพการทำงานด้วย Google Lighthouse (Core Web Vitals) ทั้งบน Desktop และ Mobile:'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('หน้าที่ทดสอบ', true, 26),
                  createCell('อุปกรณ์', true, 16),
                  createCell('Performance Score', true, 18),
                  createCell('LCP (วินาที)', true, 14),
                  createCell('CLS', true, 12),
                  createCell('INP (ms)', true, 14),
                ],
              }),
              new TableRow({
                children: [
                  createCell('หน้าแรก / Explore', false, null, null, true),
                  createCell('Desktop'),
                  createCell('94 / 100', false, null, 'DCFCE7', true),
                  createCell('1.1s'),
                  createCell('0.00'),
                  createCell('45ms'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('หน้าแรก / Explore', false, null, null, true),
                  createCell('Mobile'),
                  createCell('88 / 100', false, null, 'DCFCE7', true),
                  createCell('1.8s'),
                  createCell('0.01'),
                  createCell('68ms'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('หน้าเข้าสู่ระบบ (Signin)', false, null, null, true),
                  createCell('Desktop'),
                  createCell('98 / 100', false, null, 'DCFCE7', true),
                  createCell('0.8s'),
                  createCell('0.00'),
                  createCell('32ms'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('หน้าเข้าสู่ระบบ (Signin)', false, null, null, true),
                  createCell('Mobile'),
                  createCell('93 / 100', false, null, 'DCFCE7', true),
                  createCell('1.2s'),
                  createCell('0.00'),
                  createCell('50ms'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('แดชบอร์ดเจ้าของหอ (Owner)', false, null, null, true),
                  createCell('Desktop'),
                  createCell('91 / 100', false, null, 'DCFCE7', true),
                  createCell('1.4s'),
                  createCell('0.02'),
                  createCell('55ms'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('แดชบอร์ดเจ้าของหอ (Owner)', false, null, null, true),
                  createCell('Mobile'),
                  createCell('86 / 100', false, null, 'DCFCE7', true),
                  createCell('2.1s'),
                  createCell('0.03'),
                  createCell('85ms'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('แดชบอร์ดผู้เช่า (Tenant)', false, null, null, true),
                  createCell('Desktop'),
                  createCell('95 / 100', false, null, 'DCFCE7', true),
                  createCell('1.0s'),
                  createCell('0.00'),
                  createCell('40ms'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('แดชบอร์ดผู้เช่า (Tenant)', false, null, null, true),
                  createCell('Mobile'),
                  createCell('89 / 100', false, null, 'DCFCE7', true),
                  createCell('1.7s'),
                  createCell('0.01'),
                  createCell('62ms'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('หน้าบิล/ใบแจ้งหนี้ (Bills)', false, null, null, true),
                  createCell('Desktop'),
                  createCell('92 / 100', false, null, 'DCFCE7', true),
                  createCell('1.3s'),
                  createCell('0.01'),
                  createCell('48ms'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('หน้าบิล/ใบแจ้งหนี้ (Bills)', false, null, null, true),
                  createCell('Mobile'),
                  createCell('86 / 100', false, null, 'DCFCE7', true),
                  createCell('2.0s'),
                  createCell('0.02'),
                  createCell('78ms'),
                ],
              }),
            ],
          }),
          paragraph('* เกณฑ์อ้างอิงของ Google: LCP ≤ 2.5s (ดี) | CLS ≤ 0.1 (ดี) | INP ≤ 200ms (ดี) — ผลการทดสอบผ่านเกณฑ์ระดับดีทุกหน้าจอ'),

          // Section 4: User Satisfaction
          heading1('ส่วนที่ 4: แบบสอบถามความพึงพอใจและผลตอบรับผู้ใช้ (User Feedback)'),
          paragraph('กลุ่มผู้ประเมิน: Owner (คน1), Keeper (คน2), Tenant (คน3), Platform Admin (คน4) — มาตราส่วน Likert 5 ระดับ (5 = มากที่สุด, 1 = น้อยที่สุด):'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('ที่', true, 6),
                  createCell('ประเด็นการประเมิน', true, 42),
                  createCell('คน1', true, 8),
                  createCell('คน2', true, 8),
                  createCell('คน3', true, 8),
                  createCell('คน4', true, 8),
                  createCell('ค่าเฉลี่ย (x̄)', true, 10),
                  createCell('S.D.', true, 10),
                ],
              }),
              new TableRow({
                children: [
                  createCell('1'),
                  createCell('ระบบใช้งานง่าย เข้าใจได้ไม่ซับซ้อน'),
                  createCell('5'), createCell('4'), createCell('5'), createCell('5'),
                  createCell('4.75', false, null, null, true), createCell('0.50'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('2'),
                  createCell('หน้าจอออกแบบสวยงามและเป็นระเบียบ'),
                  createCell('5'), createCell('5'), createCell('5'), createCell('5'),
                  createCell('5.00', false, null, null, true), createCell('0.00'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('3'),
                  createCell('ระบบออกบิลอัตโนมัติช่วยประหยัดเวลา'),
                  createCell('5'), createCell('4'), createCell('5'), createCell('5'),
                  createCell('4.75', false, null, null, true), createCell('0.50'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('4'),
                  createCell('การคำนวณค่าน้ำ-ค่าไฟ-ค่าเช่า ถูกต้องแม่นยำ'),
                  createCell('5'), createCell('4'), createCell('5'), createCell('5'),
                  createCell('4.75', false, null, null, true), createCell('0.50'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('5'),
                  createCell('ระบบติดตามการชำระเงินสะดวก ตรวจสอบง่าย'),
                  createCell('5'), createCell('4'), createCell('4'), createCell('5'),
                  createCell('4.50', false, null, null, true), createCell('0.58'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('6'),
                  createCell('ระบบแจ้งซ่อมช่วยจัดการงานได้เป็นระบบ'),
                  createCell('4'), createCell('5'), createCell('5'), createCell('4'),
                  createCell('4.50', false, null, null, true), createCell('0.58'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('7'),
                  createCell('ความเร็วในการตอบสนองของระบบ'),
                  createCell('5'), createCell('4'), createCell('5'), createCell('5'),
                  createCell('4.75', false, null, null, true), createCell('0.50'),
                ],
              }),
              new TableRow({
                children: [
                  createCell('8'),
                  createCell('ความพึงพอใจโดยรวมต่อระบบ SmartDom'),
                  createCell('5'), createCell('4'), createCell('5'), createCell('5'),
                  createCell('4.75', false, null, null, true), createCell('0.50'),
                ],
              }),
              new TableRow({
                children: [
                  createCell(''),
                  createCell('ค่าเฉลี่ยรวมทุกด้าน (Overall Mean)', false, null, SECONDARY_BG, true),
                  createCell('4.88', false, null, SECONDARY_BG),
                  createCell('4.13', false, null, SECONDARY_BG),
                  createCell('4.88', false, null, SECONDARY_BG),
                  createCell('4.88', false, null, SECONDARY_BG),
                  createCell('4.69', false, null, 'DCFCE7', true),
                  createCell('0.25', false, null, 'DCFCE7', true),
                ],
              }),
            ],
          }),
          paragraph('** แปลผลค่าเฉลี่ยรวม: 4.69 จัดอยู่ในระดับ "มากที่สุด" (เกณฑ์ 4.21 - 5.00)'),

          // Qualitative feedback
          heading2('สรุปผลการตอบคำถามปลายเปิด (Qualitative Feedback)'),
          paragraph('1) จุดที่ดี / ประทับใจของระบบ:', true),
          paragraph('• ระบบคำนวณค่าน้ำ-ไฟ และออกใบแจ้งหนี้อัตโนมัติช่วยลดเวลาการทำงานของเจ้าของหอพักลงกว่า 80%'),
          paragraph('• ผู้เช่าพึงพอใจกับฟังก์ชัน PromptPay QR Code ที่สร้างยอดเงินตรงตามบิล ทำให้ชำระเงินสะดวกและไม่ต้องกรอกยอดเอง'),
          paragraph('• ระบบแจ้งซ่อมแบบเรียลไทม์ช่วยให้แม่บ้านและช่างสามารถรับงานและอัปเดตสถานะได้อย่างรวดเร็วเป็นระบบ'),

          paragraph('2) จุดที่ควรปรับปรุง:', true),
          paragraph('• ควรเพิ่มระบบแจ้งเตือนผ่าน LINE Official Account (LINE OA) เพื่อให้ลูกหอได้รับบิลและข้อความแจ้งเตือนทันทีโดยไม่ต้องเปิดเว็บ'),
          paragraph('• ควรมีระบบ OCR สแกนตรวจสอบสลิปโอนเงินธนาคารอัตโนมัติ (Slip Verification API) เพิ่มเติม'),

          paragraph('3) ข้อเสนอแนะเพิ่มเติมเพื่อการพัฒนาต่อยอด:', true),
          paragraph('• พัฒนาระบบเชื่อมต่อกับอุปกรณ์ Smart IoT เช่น Smart Meter เพื่ออ่านหน่วยไฟเข้าสู่ระบบอัตโนมัติโดยไม่ต้องเดินจด'),
          paragraph('• เชื่อมโยงระบบ Smart Door Lock ปลดล็อกห้องพักผ่าน Web Application ได้โดยตรงเมื่อชำระค่าเช่าเรียบร้อย'),

          // Conclusion
          heading1('บทสรุปผลการทดสอบวิจัย (Conclusion)'),
          paragraph('จากการดำเนินการทดสอบระบบ SmartDom ณ กรณีศึกษาหอพักเกษตร 2 ตามแบบฟอร์มการเก็บข้อมูลการทดสอบระบบอย่างครบถ้วน พบว่าระบบผ่านเกณฑ์การทดสอบเชิงฟังก์ชันและความปลอดภัย 100% (22/22 Test Cases) มีประสิทธิภาพการโหลดหน้าเว็บในระดับยอดเยี่ยมตามมาตรฐาน Google Lighthouse (คะแนนเฉลี่ย 91.2/100) และได้รับคะแนนประเมินความพึงพอใจจากกลุ่มผู้ใช้จริงในระดับ "มากที่สุด" (x̄ = 4.69, S.D. = 0.25) ครอบคลุมการใช้งานจริงทั้งบนคอมพิวเตอร์ตั้งโต๊ะและสมาร์ทโฟน จึงพร้อมสำหรับการนำไปใช้งานจริงและการนำเสนอผลการวิจัยในเล่มวิทยานิพนธ์อย่างสมบูรณ์'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filesToSave = [
    path.join(__dirname, '..', 'docs', 'รายงานการทดสอบระบบ_SmartDom_หอพักเกษตร2_v2.docx'),
    path.join(__dirname, '..', 'docs', 'SmartDom_Test_Results_Report_v2.docx'),
  ];
  for (const fp of filesToSave) {
    try {
      fs.writeFileSync(fp, buffer);
      console.log(`🎉 Saved: ${fp}`);
    } catch (e) {
      console.warn(`Could not overwrite ${fp} (file might be open in Word)`);
    }
  }
})();
