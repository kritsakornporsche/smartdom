export interface UpdateTask {
  id: string;
  title: string;
  category: 'Feature' | 'Fix' | 'Design' | 'Performance' | 'Security';
  details: string[];
}

export interface DailyUpdate {
  date: string;
  version?: string;
  tagline: string;
  isLatest?: boolean;
  tasks: UpdateTask[];
}

export const SYSTEM_UPDATES: DailyUpdate[] = [
  {
    date: '24 - 25 กรกฎาคม 2026',
    version: 'v2.4.0',
    tagline: 'ปรับปรุงเสถียรภาพระบบล็อกอิน การบิลด์ Tailwind v4 และระบบ Remote Deployment',
    isLatest: true,
    tasks: [
      {
        id: '2026-07-25-1',
        title: 'แก้ไขปัญหาระบบล็อกอิน และ NextAuth 0.0.0.0 Redirect',
        category: 'Security',
        details: [
          'ตั้งค่า Runtime Fallback บน auth.ts ป้องกันปัญหารีไดเรกต์ไป 0.0.0.0 ในสภาพแวดล้อม Production',
          'ปรับปรุง PM2 Ecosystem & Dynamic Reload รองรับทราฟฟิกพอร์ตคู่ 3000 และ 5993 สำหรับ THDDNS'
        ]
      },
      {
        id: '2026-07-25-2',
        title: 'แก้ไขปัญหา Tailwind CSS v4 ไม่ถูกคอมไพล์ใน Production Build',
        category: 'Performance',
        details: [
          'บังคับใช้ Webpack Build ใน package.json เพื่อแก้ปัญหา Turbopack ข้ามการประมวลผล PostCSS',
          'คอมไพล์สไตล์ Tailwind CSS v4 ได้สมบูรณ์ 100% (ขนาดไฟล์ ~133KB) พร้อมปรับปรุง app/globals.css'
        ]
      },
      {
        id: '2026-07-25-3',
        title: 'ล้าง Zombie Node Processes และแก้ไขการเคลียร์แคชบน Windows Server',
        category: 'Fix',
        details: [
          'ยุติโปรเซส node.exe ตกค้างในระบบกว่า 30 โปรเซสที่ถือครองพอร์ต',
          'แก้ไขไวยากรณ์ rmdir /s /q .next ใน deploy-remote.js ให้ลบแคชเก่าได้อย่าง 100%'
        ]
      },
      {
        id: '2026-07-25-4',
        title: 'ปรับปรุงสคริปต์ Remote Deploy และกระบวนการ Detached Process',
        category: 'Performance',
        details: [
          'ใช้ WMIC Process Creation ใน deploy-remote.js ป้องกัน Windows OpenSSH Job Object ตัดการทำงาน',
          'กำหนด Windows Firewall Inbound Rules เปิดปลดล็อก TCP พอร์ต 3000 และ 5993'
        ]
      },
      {
        id: '2026-07-25-5',
        title: 'แก้ไขข้อผิดพลาด TypeScript (Strict Type Audit)',
        category: 'Fix',
        details: [
          'แก้ไขการเปรียบเทียบ boolean กับตัวเลขใน app/page.tsx (TS2367 Error)',
          'ผ่านการตรวจสอบ Strict TypeScript (npx tsc --noEmit) สำเร็จ 100% ปราศจาก Error'
        ]
      }
    ]
  },
  {
    date: '23 กรกฎาคม 2026',
    version: 'v2.3.0',
    tagline: 'ปรับแต่งดีไซน์ธีมม่วง-ทอง มหาวิทยาลัยพะเยา และการแสดงผลหอพักคมชัดสูง',
    tasks: [
      {
        id: '2026-07-23-1',
        title: 'อัปเดตชื่อหอพักหลักและชื่อแบรนด์ระบบ (System Rebranding)',
        category: 'Design',
        details: [
          'แก้ไขชื่อหอพักหลักเป็น "หอพักหน้ามหาวิทยาลัยพะเยา"',
          'เปลี่ยนชื่อระบบเป็น "แพลตฟอร์มหอพักหน้ามหาวิทยาลัยพะเยา" ครอบคลุม Navbar, Sidebar และ Metadata'
        ]
      },
      {
        id: '2026-07-23-2',
        title: 'ธีมสีประจำมหาวิทยาลัยพะเยา (UP Purple & Gold Theme)',
        category: 'Design',
        details: [
          'กำหนดจานสีหลัก: สีม่วง มพ. (#8E24AA / #A855F7) และ สีทอง มพ. (#C59B63 / #D4AF37)',
          'ติดตั้งตราสัญลักษณ์มหาวิทยาลัยพะเยา (/up-logo.png) พร้อมเงานูนลอย Drop Shadow'
        ]
      },
      {
        id: '2026-07-23-3',
        title: 'ปรับปรุงการ์ดแสดงผลหอพักความคมชัดสูง (High-Contrast Redesign)',
        category: 'UI/UX' as any,
        details: [
          'แยกโครงสร้างการ์ดการแสดงผลภาพปกและกล่องเนื้อหาบนพื้นหลังทึบ อ่านง่าย 100%',
          'ขยายฟอนต์ชื่อหอพัก, ที่อยู่, เบอร์โทร และแท็กสิ่งอำนวยความสะดวก'
        ]
      },
      {
        id: '2026-07-23-4',
        title: 'ซ่อมแซมฟังก์ชันแชทและปรับปรุง Scrollbar',
        category: 'Fix',
        details: [
          'เพิ่ม Custom Event Listener ใน ChatWidget ให้กดแชทเปิดกล่องสนทนาได้ทันที',
          'เพิ่ม CSS Utility .no-scrollbar ซ่อนแถบเลื่อนแนวนอนของเบราว์เซอร์'
        ]
      }
    ]
  },
  {
    date: '20 กรกฎาคม 2026',
    version: 'v2.2.0',
    tagline: 'ปรับปรุงคุณภาพโค้ด จัดทำ Testing Dashboard และปรับธีม Black-Purple',
    tasks: [
      {
        id: '2026-07-20-1',
        title: 'ปรับปรุงคุณภาพโค้ดและการตรวจสอบ Types (Strict TS)',
        category: 'Performance',
        details: [
          'แก้ไขข้อผิดพลาด TypeScript ใน next.config.ts, lib/db.ts, owner/tenant routes',
          'ผ่านการทดสอบ npx tsc --noEmit และ npm run build ปราศจาก Warning'
        ]
      },
      {
        id: '2026-07-20-2',
        title: 'แดชบอร์ดสรุปผลการทดสอบระบบอินเตอร์แอคทีฟ',
        category: 'Feature',
        details: [
          'จัดทำรายงานผลการทดสอบ system-testing-results.html สไตล์ Glassmorphism',
          'แสดงผลการทดสอบ 19 Test Cases, ความปลอดภัย 4 มิติ และสถิติ Lighthouse'
        ]
      },
      {
        id: '2026-07-20-3',
        title: 'รื้อถอนสีน้ำตาลและพัฒนาธีม ดำ-ม่วง / ขาว-ม่วง',
        category: 'Design',
        details: [
          'เปลี่ยน Primary Color เป็นคู่สีม่วง/ไวโอเล็ต',
          'กำจัดสีน้ำตาลค้างในระบบ และปรับ Owner/Tenant Dashboard ให้รองรับ Light/Dark Mode Dynamic'
        ]
      }
    ]
  },
  {
    date: '17 กรกฎาคม 2026',
    version: 'v2.1.0',
    tagline: 'ระบบ API ดูห้องพักแบบสาธารณะ และการปรับแต่ง Responsive UI',
    tasks: [
      {
        id: '2026-07-17-1',
        title: 'ระบบ API เข้าถึงข้อมูลห้องพักแบบสาธารณะ (Public API)',
        category: 'Feature',
        details: [
          'เปิดให้ /api/rooms และ /api/rooms/[id] ดึงข้อมูลห้องพักได้โดยไม่ต้องใช้ Session',
          'แก้ไข SQL Join ตารางห้องพักและข้อมูลผู้ดูแลให้ถูกต้อง 100%'
        ]
      },
      {
        id: '2026-07-17-2',
        title: 'การแสดงผลแบบ Responsive เต็มรูปแบบ',
        category: 'UI/UX' as any,
        details: [
          'ปรับ Breakpoint ของ Navbar Drawer บนมือถือและแท็บเล็ต',
          'ปรับการ์ดหอพักและฟอร์มการจองให้พอดีขอบจอมือถือ'
        ]
      }
    ]
  },
  {
    date: '6 - 7 กรกฎาคม 2026',
    version: 'v2.0.0',
    tagline: 'ปรับโครงสร้างฐานข้อมูล Single DB และฟีเจอร์ Free-Tier เต็มรูปแบบ',
    tasks: [
      {
        id: '2026-07-07-1',
        title: 'สถาปัตยกรรมฐานข้อมูล Single Database',
        category: 'Performance',
        details: [
          'Migrate จาก Multi-DB เป็น Single Database (smartdomdb)',
          'สร้างระบบจดมิเตอร์น้ำ-ไฟ, QR Code PromptPay ชำระเงินฟรี และระบบแจ้งเตือน'
        ]
      },
      {
        id: '2026-07-07-2',
        title: 'ปรับปรุงฟอร์มสมัครสมาชิก (Single Page Signup)',
        category: 'Feature',
        details: [
          'รวบฟอร์มสมัครสมาชิกให้จบในหน้าเดียว พร้อมแยกชื่อ-นามสกุลในตาราง users',
          'เพิ่ม Mobile Drawer Menu สำหรับสมาร์ทโฟน'
        ]
      }
    ]
  }
];
