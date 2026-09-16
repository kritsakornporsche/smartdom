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
    date: '16 กันยายน 2026',
    version: 'v2.6.1',
    tagline: 'ระบบแจ้งเตือนการจองห้องพักสำหรับเจ้าของหอ, แผนที่ปักหมุด Interactive Google Maps บนหน้า Explore, ปรับปรุงคอนทราสต์ธีมสว่าง และสลับหอพักบนมือถือ',
    isLatest: true,
    tasks: [
      {
        id: '2026-09-16-1',
        title: 'ระบบแจ้งเตือนเจ้าของหอพักเมื่อมีการจองห้องพัก พร้อมเมนู "รายการจองห้อง"',
        category: 'Feature',
        details: [
          'ส่งการแจ้งเตือนอัตโนมัติเข้าตาราง notifications ถึงเจ้าของหอพักทันทีที่ผู้เช่าส่งคำขอจองห้องพร้อมแนบสลิปมัดจำ',
          'เพิ่มเมนู "รายการจองห้อง" (🛎️) บน Sidebar และ Drawer ของเจ้าของหอพัก สามารถคลิกจากกระดิ่งแจ้งเตือนไปยังหน้าตรวจสอบได้ทันที (/owner/bookings)',
          'ปรับปรุง API สถิติ (/api/owner/stats) ให้นับคำขอจองห้องค้างตรวจ (PendingOwnerSignature) ถูกต้องเรียลไทม์'
        ]
      },
      {
        id: '2026-09-16-2',
        title: 'แสดงแผนที่และพิกัดปักหมุดแบบโต้ตอบ (Interactive Pinned Map) บนหน้าหอพัก Explore',
        category: 'Feature',
        details: [
          'ฝังกรอบแผนที่ Google Maps แบบโต้ตอบ (iframe) แสดงตำแหน่งพิกัดปักหมุดจริงของหอพักบนหน้ารายละเอียดหอพัก (/explore/[dormId]) และหน้าจองห้องพัก (/explore/room/[id])',
          'เพิ่มปุ่ม "🧭 ขอเส้นทางนำทาง" เชื่อมตรงเข้าแอป Google Maps นำทางมายังหอพักได้ทันที 1-Click',
          'เพิ่มช่องกรอกและทดสอบพิกัดแผนที่ (Map Location URL) ในหน้าตั้งค่าหอพักของเจ้าของหอพัก (/owner/settings)'
        ]
      },
      {
        id: '2026-09-16-3',
        title: 'ปรับปรุงคอนทราสต์โหมดสว่าง (Light Theme Contrast) คมชัดทุกไอคอน ไม่จมพื้นหลัง',
        category: 'Design',
        details: [
          'เพิ่ม Global Theme Overrides ใน app/globals.css สำหรับ :root:not(.dark) ให้ไอคอน SVG และข้อความความโปร่งใสสีขาวแสดงผลเป็นสี Slate คมชัดบนพื้นหลังสว่าง',
          'ปรับแต่งแถบ Header, Sidebar และ Input ค้นหาห้องพักทุกแดชบอร์ดให้ใช้ Semantic Tokens (bg-card, text-card-foreground, border-border) ปราศจากสีจม'
        ]
      },
      {
        id: '2026-09-16-4',
        title: 'เพิ่มเมนูดรอปดาวน์สลับหอพักและ "+ เพิ่มหอพัก" ใน Mobile Drawer Menu',
        category: 'Design',
        details: [
          'นำกล่องเลือกหอพักและปุ่มเพิ่มหอพักมาไว้ส่วนบนสุดของแถบเมนูข้าง (OwnerSidebar) ให้ผู้ใช้งานบนมือถือสามารถสลับหอพักและเพิ่มหอพักใหม่ได้สะดวกใน Drawer',
          'นำรูปภาพ Profile Face Avatar ออกจาก Top Navbar ทุกแดชบอร์ดเพื่อความสะอาดตาและโฟกัสฟังก์ชันสำคัญ'
        ]
      },
      {
        id: '2026-09-16-5',
        title: 'ระบบอัปเดตเวอร์ชันและสร้าง Git Tag อัตโนมัติทุกครั้งที่ Push ขึ้น Git',
        category: 'Performance',
        details: [
          'พัฒนา scripts/generate-version.js ให้นับ Build Number เชื่อมโยงกับ Git Commit Count แบบย้อนหลังและไปข้างหน้า 100%',
          'สร้าง Git Tags ย้อนหลังสำหรับทุกเวอร์ชันหลัก (v2.0.0, v2.1.0, v2.2.0, v2.3.0, v2.4.0, v2.5.0, v2.6.0, v2.6.1) พร้อม Push ขึ้น GitHub',
          'ติดตั้ง Git Hooks (pre-commit & pre-push) และสคริปต์ npm run git:push ตรวจจับการเปลี่ยนแปลงและสร้าง Tag อัตโนมัติ'
        ]
      }
    ]
  },
  {
    date: '14 กันยายน 2026',
    version: 'v2.6.0',
    tagline: 'ระบบจดมิเตอร์อัจฉริยะด้วยกล้อง AI (Hybrid OCR), ชำระเงิน Dynamic PromptPay พร้อม Bank Deeplink (0% Fee) และเปิดใช้งาน SSL HTTPS Server',
    isLatest: false,
    tasks: [
      {
        id: '2026-09-14-1',
        title: 'ระบบจดมิเตอร์น้ำ-ไฟอัจฉริยะด้วยกล้อง AI (Hybrid OCR)',
        category: 'Feature',
        details: [
          'พัฒนาคอมโพเนนต์ CameraMeterModal รองรับการเปิดกล้องถ่ายภาพมิเตอร์น้ำและไฟฟ้า ทั้งแบบรายห้องเดี่ยวและตารางบันทึกด่วน (Batch Entry)',
          'เชื่อมต่อระบบสแกนตัวเลขอัจฉริยะ Hybrid OCR ผสาน Gemini 1.5 Flash Vision และ Tesseract.js (ออฟไลน์ fallback)',
          'ระบบตรวจสอบความสมเหตุสมผลของตัวเลข (Validation) แจ้งเตือนสีส้มทันทีหากเลขมิเตอร์น้อยกว่าเลขเดือนก่อนหน้า พร้อมบันทึกภาพถ่ายหลักฐาน (photo_url) ลงฐานข้อมูล'
        ]
      },
      {
        id: '2026-09-14-2',
        title: 'ระบบชำระเงินอัจฉริยะ 0% Fee + Direct Bank App Launcher (Deeplink)',
        category: 'Feature',
        details: [
          'ตัดระบบ SlipOK / ภาระค่าบริการรายสลิปออกอย่างสมบูรณ์ เพื่อความเหมาะสมสูงสุดสำหรับงานวิจัยและใช้งานจริง',
          'สร้าง PromptPay Dynamic QR Code มาตรฐานสากล EMVCo ผูกตรงกับบัญชีเจ้าของหอพัก 100%',
          'เพิ่มปุ่มลัดเปิดแอปธนาคารตรง (Deeplink) รองรับ K PLUS, SCB EASY, Krungthai NEXT, KMA, Bualuang mBanking และ ttb touch',
          'รองรับการตรวจสอบและอนุมัติสลิป (Human-in-the-loop) แบบ 1-Click พร้อมระบบปฏิเสธและระบุเหตุผล'
        ]
      },
      {
        id: '2026-09-14-3',
        title: 'ติดตั้งและตั้งค่าระบบความปลอดภัย SSL HTTPS สำหรับเซิร์ฟเวอร์ (Cloudflare Tunnel)',
        category: 'Security',
        details: [
          'ติดตั้ง cloudflared บน Windows Server รันบริการผ่าน Windows Scheduled Task (SmartDomTunnel) ตลอด 24/7',
          'ปลดล็อกข้อจำกัดของเบราว์เซอร์มือถือ (iOS Safari & Android Chrome) ให้สามารถเปิดกล้องสด (Live Viewfinder Stream) ได้อย่างปลอดภัย',
          'เพิ่มประสิทธิภาพการรับส่งข้อมูลผ่านโปรโตคอล TLS 1.3 และ HTTP/2 - QUIC / HTTP/3 โดยไม่มีปัญหา Latency'
        ]
      },
      {
        id: '2026-09-14-4',
        title: 'ปรับปรุงประสบการณ์การใช้งาน (UX) ฝั่งเจ้าของหอพัก และเพิ่มหน้าระบบสำหรับผู้วิจัย (Researcher)',
        category: 'Design',
        details: [
          'ลดความซับซ้อนของเมนูและกล่องข้อมูลฝั่งเจ้าของหอพักให้กระชับ ชัดเจน และใช้งานง่ายขึ้น',
          'เพิ่มหน้าแสดงโครงสร้างฐานข้อมูล ER Diagram และ Use Case Diagrams สถาปัตยกรรม 21 ตาราง สำหรับผู้วิจัยและผู้ดูแลระบบ (/researcher และ /admin/diagrams)'
        ]
      }
    ]
  },
  {
    date: '12 กันยายน 2026',
    version: 'v2.5.0',
    tagline: 'ระบบแจ้งเตือนสลิปชำระเงินสำหรับเจ้าของหอพัก และปรับปรุงโครงสร้าง Single Database สู่ 21 ตาราง',
    isLatest: false,
    tasks: [
      {
        id: '2026-09-12-1',
        title: 'ระบบแจ้งเตือนเจ้าของหอพักและผู้ดูแล (Keeper) เมื่อผู้เช่าแนบสลิปชำระเงิน',
        category: 'Feature',
        details: [
          'ส่งข้อความแจ้งเตือนอัตโนมัติเข้ากล่องข้อความของผู้ดูแลและเจ้าของหอพักทันทีที่ผู้เช่าอัปโหลดสลิป',
          'ระบุหมายเลขห้อง ยอดเงินที่ชำระ และลิงก์ลัด (/dormitory/bills/verification) เพื่อตรวจสอบและอนุมัติบิลได้รวดเร็ว',
          'รองรับการทำงานกับตาราง notifications รูปแบบมาตรฐานระบบ (user_id, title, message, type, is_read, created_at)'
        ]
      },
      {
        id: '2026-09-12-2',
        title: 'ปลดระวางโมดูลกระเป๋าเงิน (Wallet) และเหรียญ (Coins) ที่ไม่มีตารางรองรับ',
        category: 'Fix',
        details: [
          'นำ UI กระเป๋าเงิน/การเติมเงิน และเหรียญออกจากหน้าโปรไฟล์และเมนู เพื่อป้องกัน Runtime Error จากคอลัมน์ที่ไม่มีอยู่จริง',
          'ลบ API endpoint เก่าที่ไม่รองรับ (/api/platform/packages, /api/dormitory/packages) ออกอย่างสมบูรณ์',
          'ทำความสะอาด Schema ของตาราง dormitory_registry โดยตัดฟิลด์ coins ที่ไม่ได้ใช้งาน'
        ]
      },
      {
        id: '2026-09-12-3',
        title: 'ปรับปรุงโครงสร้าง Single Database เหลือ 21 ตารางมาตรฐาน',
        category: 'Performance',
        details: [
          'ตัดตารางที่ไม่ได้ใช้งาน subscriptions และ dormitory_packages ออกจากฐานข้อมูล',
          'คงตาราง accounting_transactions ไว้สำหรับการลงบัญชีรายรับ-รายจ่ายของหอพัก',
          'อัปเดตไฟล์ Dump ฐานข้อมูลหลัก (smartdomdb_full_dump.sql) และ docs สอดคล้องกับสภาพแวดล้อมจริง 100%'
        ]
      },
      {
        id: '2026-09-12-4',
        title: 'ปรับปรุงเมนู Sidebar ทั้ง Platform Admin และ Dormitory Owner',
        category: 'Design',
        details: [
          'ถอดเมนู "แพ็กเกจหอพัก" (Packages) ออกจากแถบเมนู Platform Admin เพื่อความถูกต้องของฟังก์ชันงาน',
          'ถอดเมนู "เหรียญ / สมัครสมาชิก" ออกจาก Dashboard ของเจ้าของหอพัก',
          'เพิ่มการสรุปสถานะเวอร์ชันระบบ (v2.5.0) และบันทึกการอัปเดตลงบน Platform Admin Dashboard'
        ]
      }
    ]
  },
  {
    date: '24 - 25 กรกฎาคม 2026',
    version: 'v2.4.0',
    tagline: 'ปรับปรุงเสถียรภาพระบบล็อกอิน การบิลด์ Tailwind v4 และระบบ Remote Deployment',
    isLatest: false,
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
