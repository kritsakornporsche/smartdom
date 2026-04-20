import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import Navbar from "./components/Navbar";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SmartDom | Experience Minimal & Sustainable Living",
  description: "Redefining dormitory management with a focus on aesthetics, simplicity, and ease of use. Join the SmartDom ecosystem today.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-48 pb-64 lg:pt-64 lg:pb-80">
        {/* Decorative Background Elements - Wrapped to prevent overflow while allowing content to be visible */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-secondary/30 rounded-full blur-[120px] opacity-40 animate-float" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] opacity-20" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-8 text-center animate-reveal">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-12 border border-border shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Designed for Modern Living
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display leading-[1.2] tracking-[-0.01em] mb-12 ornament py-6 px-2">
            การใช้ชีวิตที่ <span className="text-primary italic font-medium">เรียบง่าย</span> <br /> 
            เริ่มต้นที่ความใส่ใจ
          </h1>
          
          <p className="mt-4 text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-bold opacity-95">
            นิยามใหม่ของการบริหารจัดการหอพักที่เน้นความสุนทรีย์และความเรียบง่าย 
            ผ่านเทคโนโลยีที่ทำให้ทุกเรื่องเป็นเรื่องง่ายและยั่งยืน
          </p>
          
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link
              href="/signup"
              className={cn(
                "w-full sm:w-auto rounded-full bg-primary px-14 py-6 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground",
                "shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-500"
              )}
            >
              เริ่มต้นใช้งานฟรี
            </Link>
            <Link
              href="/explore"
              className={cn(
                "w-full sm:w-auto rounded-full border border-border bg-white px-14 py-6 text-xs font-black uppercase tracking-[0.2em] text-foreground",
                "hover:bg-secondary transition-all duration-500 group/btn shadow-sm"
              )}
            >
              ดูหอพักทั้งหมด 
              <span className="ml-4 inline-block transition-transform group-hover/btn:translate-x-2">→</span>
            </Link>
          </div>

          <div className="mt-10 animate-reveal" style={{ animationDelay: '0.4s' }}>
             <Link 
               href="/signin" 
               className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all inline-flex items-center gap-3 group"
             >
               มีบัญชีอยู่แล้ว? <span className="text-foreground group-hover:text-primary border-b border-border group-hover:border-primary transition-all">เข้าสู่ระบบที่นี่</span>
             </Link>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-32 lg:py-56 bg-white border-t border-border relative">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32 items-end reveal-on-scroll active">
            <div className="lg:col-span-8">
              <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-primary mb-8 ml-1">The Ecosystem</h2>
              <p className="text-5xl lg:text-7xl font-display leading-[1.4] tracking-tight ornament py-2">หนึ่งระบบที่สมบูรณ์แบบ <br/> เพื่อตอบโจทย์ทุกคน</p>
            </div>
            <div className="lg:col-span-4 pb-2">
              <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed font-bold">
                เราเชื่อว่าระบบที่ดีคือระบบที่ไม่มีตัวตน แต่คอยซัพพอร์ตทุกความเคลื่อนไหวของคุณอย่างเงียบเชียบและมีประสิทธิภาพ
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: "ผู้เยี่ยมชม", desc: "ค้นหาและจองห้องพักได้อย่างรวดเร็ว ด้วยหน้ากราฟิกที่สะอาดตาและเข้าใจง่าย", color: "bg-secondary" },
              { role: "ผู้เช่า", desc: "จัดการทุกอย่างเพียงปลายนิ้วสัมผัส ตั้งแต่การชำระเงินจนถึงการแจ้งซ่อม", color: "bg-accent" },
              { role: "ผู้ดูแล", desc: "บริหารจัดการงานประจำวันได้อย่างลื่นไหล พร้อมระบบแจ้งเตือนอัจฉริยะ", color: "bg-muted" },
              { role: "แอดมิน", desc: "วิเคราะห์ข้อมูลและตัดสินใจได้อย่างแม่นยำ ด้วยระบบรายงานที่มีประสิทธิภาพสูงสุด", color: "bg-background" }
            ].map((r, i) => (
              <div 
                key={i} 
                className={cn(
                  "group p-12 rounded-[3.5rem] border border-border transition-all duration-700 hover:-translate-y-3",
                  r.color,
                  "hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5"
                )}
              >
                <div className="h-1 w-16 bg-primary/20 group-hover:w-24 group-hover:bg-primary transition-all duration-500 mb-10" />
                <h3 className="text-3xl font-display mb-6 tracking-tight">{r.role}</h3>
                <p className="text-foreground font-bold leading-relaxed text-sm">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-32 lg:py-48 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-[3rem] -rotate-3 scale-105 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-border/40 shadow-2xl">
                <Image
                  src="/mockup.png"
                  alt="SmartDom Mobile App Mockup"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-12">
              <h2 className="text-4xl lg:text-5xl font-display leading-tight">รายละเอียดที่สร้าง <br/> ความแตกต่างอย่างลึกซึ้ง</h2>
              
              <div className="space-y-10">
                {[
                  { title: "Smart Contracts", detail: "กระบวนการทางเอกสารที่โปร่งใสและตรวจสอบได้ทุกเมื่อผ่านระบบดิจิทัล" },
                  { title: "Effortless Billing", detail: "ความเรียบง่ายที่มาพร้อมความแม่นยำ จัดการบิลและรายรับ-รายจ่ายได้อัตโนมัติ" },
                  { title: "Active Maintenance", detail: "ใส่ใจในคุณภาพชีวิตด้วยระบบแจ้งซ่อมที่รวดเร็วและเป็นขั้นเป็นตอน" }
                ].map((f, i) => (
                  <div key={i} className="group relative pl-8 border-l border-border/40 hover:border-primary transition-colors">
                    <div className="absolute top-0 left-[-2px] h-0 group-hover:h-full w-1 bg-primary transition-all duration-500" />
                    <h4 className="text-xl font-display mb-2">{f.title}</h4>
                    <p className="text-muted-foreground font-medium leading-relaxed">{f.detail}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-8">
                <Link href="#" className="inline-flex items-center gap-4 group">
                   <span className="h-px w-12 bg-border group-hover:w-20 group-hover:bg-primary transition-all duration-500 text-foreground" />
                   <span className="text-xs font-bold uppercase tracking-widest">เรียนรู้เพิ่มเติมเกี่ยวกับเรา</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="py-32 lg:py-48 bg-background relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-8">
          <div className="relative rounded-[4rem] overflow-hidden aspect-[21/9] group shadow-2xl">
            <Image
              src="/room.png"
              alt="Premium Living Space Managed by SmartDom"
              fill
              className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-12 lg:px-24 max-w-2xl">
              <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-6">Atmosphere</h2>
              <p className="text-4xl lg:text-6xl font-display leading-[0.9] mb-8">บรรยากาศที่ <br/> ออกแบบมาเพื่อคุณ</p>
              <p className="text-muted-foreground text-lg font-medium mb-12 hidden md:block">
                เราไม่ได้แค่จัดการห้องพัก แต่เราดูแลทุกองค์ประกอบที่ทำให้คำว่า &apos;บ้าน&apos; สมบูรณ์แบบที่สุด
              </p>
              <div>
                 <Link href="/signup" className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:-translate-y-1 transition-all">
                    จองห้องพักในฝัน
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 lg:py-56 bg-background border-y border-border">
        <div className="mx-auto max-w-7xl px-8">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-primary mb-8">Investment</h2>
            <p className="text-5xl lg:text-7xl font-display leading-[1.4] tracking-tight mb-10 ornament py-2">เลือกแพ็กเกจที่เหมาะกับ <br/> การเติบโตของคุณ</p>
            <p className="text-muted-foreground text-xl font-bold">ความโปร่งใสคือหัวใจของเรา ไม่มีค่าธรรมเนียมแอบแฝง</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "0",
                desc: "สำหรับหอพักเริ่มต้นที่ต้องการความเรียบง่าย",
                features: ["สูงสุด 10 ห้องพัก", "ระบบแจ้งซ่อมพื้นฐาน", "จัดการสัญญาเช่าดิจิทัล", "ซัพพอร์ต 24 ชม."],
                current: false
              },
              {
                name: "Professional",
                price: "1,250",
                desc: "สมบูรณ์แบบสำหรับธุรกิจที่ต้องการขยายตัว",
                features: ["ไม่จำกัดห้องพัก", "ระบบบิลลิ่งอัตโนมัติ", "วิเคราะห์ข้อมูลเชิงลึก", "ซัพพอร์ต VIP", "Custom Branding"],
                current: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "โซลูชันที่ปรับแต่งได้เพื่อโครงการขนาดใหญ่",
                features: ["จัดการหลายโครงการ", "API Integration", "Dedicated Manager", "White-label Service", "จัดอบรมถึงที่"],
                current: false
              }
            ].map((plan, i) => (
              <div 
                key={i} 
                className={cn(
                  "relative p-14 rounded-[4rem] border transition-all duration-700 group hover:-translate-y-4",
                  plan.current 
                    ? "bg-[#3E342B] text-white border-[#3E342B] shadow-2xl premium-shadow" 
                    : "bg-white border-border hover:border-primary/40 shadow-sm"
                )}
              >
                {plan.current && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-3xl font-display mb-3 tracking-tight">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-display font-black tracking-tighter">
                    {plan.price !== "Custom" ? `฿${plan.price}` : plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      plan.current ? "text-white/40" : "text-muted-foreground/60"
                    )}>
                      /เดือน
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-base mb-12 leading-relaxed font-bold",
                  plan.current ? "text-white/60" : "text-muted-foreground"
                )}>
                  {plan.desc}
                </p>
                
                <ul className="space-y-6 mb-16">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex items-center gap-4 text-sm font-black tracking-tight">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        plan.current ? "bg-primary" : "bg-primary/40"
                      )} />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button className={cn(
                  "w-full rounded-full py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                  plan.current 
                    ? "bg-primary text-primary-foreground hover:bg-white hover:text-foreground shadow-xl shadow-primary/20" 
                    : "bg-secondary text-foreground hover:bg-[#3E342B] hover:text-white"
                )}>
                  {plan.price === "Custom" ? "ติดต่อเราเพื่อรับข้อเสนอ" : "เริ่มต้นใช้งานทันที"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-white border-t border-border">
        <div className="mx-auto max-w-7xl px-8 text-foreground">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-32">
            <div className="space-y-10 max-w-sm">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-lg">S</div>
                <span className="text-xl font-display font-black tracking-tight uppercase">SmartDom</span>
              </Link>
              <p className="text-muted-foreground text-lg leading-relaxed font-bold">
                เราไม่ได้แค่สร้างระบบจัดการ แต่เราสร้างความอุ่นใจและความเรียบง่ายให้กับการอยู่อาศัยในยุคใหม่
              </p>
              <div className="flex gap-4">
                {["Instagram", "X", "Facebook"].map((s) => (
                  <div key={s} className="h-12 w-12 rounded-2xl border border-border flex items-center justify-center text-xs font-black uppercase cursor-pointer hover:bg-foreground hover:text-background hover:scale-105 active:scale-95 transition-all duration-300">
                    {s[0]}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-20 lg:gap-40 w-full lg:w-auto">
              <div className="space-y-10">
                <h5 className="text-[10px] uppercase font-black tracking-[0.4em] text-primary">เมนูหลัก</h5>
                <ul className="space-y-6">
                  {["หน้าแรก", "คุณสมบัติ", "หอพักในเครือ", "แพ็กเกจ"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-sm font-black text-muted-foreground hover:text-foreground transition-all duration-300 inline-block hover:translate-x-1">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-10">
                <h5 className="text-[10px] uppercase font-black tracking-[0.4em] text-primary">ความช่วยเหลือ</h5>
                <ul className="space-y-6">
                  {["นโยบายส่วนบุคคล", "ข้อกำหนดการใช้งาน", "ศูนย์ช่วยเหลือ", "ร่วมงานกับเรา"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-sm font-black text-muted-foreground hover:text-foreground transition-all duration-300 inline-block hover:translate-x-1">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-40 pt-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-10 opacity-60">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] font-bold">
              © 2026 SmartDom Ecosystem • Bangkok, Thailand
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 font-bold">
              <span>Minimal</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span>Sustainable</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span>Smart</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
