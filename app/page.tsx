import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartDom | Experience Minimal & Sustainable Living",
  description: "Redefining dormitory management with a focus on aesthetics, simplicity, and ease of use. Join the SmartDom ecosystem today.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/40">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display font-bold shadow-soft transition-transform group-hover:scale-105">
                S
              </div>
              <span className="text-lg font-display font-bold tracking-tight uppercase">SmartDom</span>
            </div>
            
            <div className="hidden md:flex items-center gap-12">
              <Link href="#features" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">คุณสมบัติ</Link>
              <Link href="#roles" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">ระบบ</Link>
              <div className="h-4 w-px bg-border/60" />
              <Link href="/signin" className="text-sm font-semibold hover:text-primary transition-colors text-foreground">เข้าสู่ระบบ</Link>
              <Link href="/signup" className="rounded-full bg-foreground px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-background hover:bg-primary hover:text-primary-foreground transition-all shadow-xl">
                เริ่มต้นเลย
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 lg:pt-60 lg:pb-48 overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-secondary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-30" />

        <div className="relative z-10 mx-auto max-w-5xl px-8 text-center text-balance">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/30 text-accent-foreground text-[10px] uppercase font-bold tracking-[0.2em] mb-12">
            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            Designed for Modern Living
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display leading-[0.95] tracking-[-0.04em] mb-10">
            การใช้ชีวิตที่ <span className="text-primary italic font-medium">เรียบง่าย</span> <br /> 
            เริ่มต้นที่ความใส่ใจ
          </h1>
          
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            นิยามใหม่ของการบริหารจัดการหอพักที่เน้นความสุนทรีย์และความเรียบง่าย 
            ผ่านเทคโนโลยีที่ทำให้ทุกเรื่องเป็นเรื่องง่ายและยั่งยืน
          </p>
          
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/signup"
              className="w-full sm:w-auto rounded-full bg-primary px-12 py-5 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
            >
              เริ่มต้นใช้งานฟรี
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto rounded-full border border-border/60 bg-white/40 px-12 py-5 text-sm font-bold uppercase tracking-widest text-foreground hover:bg-background transition-all"
            >
              สำรวจคุณสมบัติ
            </Link>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-32 lg:py-48 bg-background border-t border-border/40">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 items-end">
            <div className="lg:col-span-7">
              <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-6">The Ecosystem</h2>
              <p className="text-4xl lg:text-5xl font-display leading-tight">หนึ่งระบบที่สมบูรณ์แบบ <br/> เพื่อตอบโจทย์ทุกคนในบ้าน</p>
            </div>
            <div className="lg:col-span-5 pb-2">
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                เราเชื่อว่าระบบที่ดีคือระบบที่ไม่มีตัวตน แต่คอยซัพพอร์ตทุกความเคลื่อนไหวของคุณอย่างเงียบเชียบและมีประสิทธิภาพ
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: "ผู้เยี่ยมชม", desc: "ค้นหาและจองห้องพักได้อย่างรวดเร็ว ด้วยอินเตอร์เฟซที่สะอาดตาและเข้าใจง่าย", color: "bg-primary/5" },
              { role: "ผู้เช่า", desc: "จัดการทุกอย่างเพียงปลายนิ้วสัมผัส ตั้งแต่การชำระเงินจนถึงการแจ้งซ่อม", color: "bg-secondary/5" },
              { role: "ผู้ดูแล", desc: "บริหารจัดการงานประจำวันได้อย่างลื่นไหล พร้อมระบบแจ้งเตือนอัจฉริยะ", color: "bg-accent/5" },
              { role: "แอดมิน", desc: "วิเคราะห์ข้อมูลและตัดสินใจได้อย่างแม่นยำ ด้วยระบบรายงานที่มีความละเอียดสูง", color: "bg-foreground/[0.02]" }
            ].map((r, i) => (
              <div key={i} className={`group p-10 rounded-[2.5rem] ${r.color} border border-border/20 hover:border-border/60 transition-all hover:-translate-y-2`}>
                <div className="h-1 w-12 bg-border group-hover:bg-primary transition-colors mb-8" />
                <h3 className="text-2xl font-display mb-4">{r.role}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
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
      <section id="pricing" className="py-32 lg:py-48 bg-accent/10 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-6">Investment</h2>
            <p className="text-4xl lg:text-5xl font-display leading-tight mb-8">เลือกแพ็กเกจที่เหมาะกับ <br/> การเติบโตของคุณ</p>
            <p className="text-muted-foreground text-lg font-medium">ไม่มีค่าใช้จ่ายแอบแฝง ทุกฟีเจอร์ออกแบบมาเพื่อให้คุณทำงานได้อย่างไร้รอยต่อ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "0",
                desc: "สำหรับหอพักขนาดเล็กที่เริ่มต้นจัดการระบบพื้นฐาน",
                features: ["สูงสุด 10 ห้องพัก", "ระบบแจ้งซ่อมพื้นฐาน", "จัดการสัญญาเช่าดิจิทัล", "ซัพพอร์ตผ่านอีเมล"],
                current: false
              },
              {
                name: "Pro",
                price: "1,250",
                desc: "สมบูรณ์แบบสำหรับหอพักที่ต้องการความเป็นมืออาชีพ",
                features: ["ไม่จำกัดห้องพัก", "ระบบบิลลิ่งอัตโนมัติ", "วิเคราะห์ข้อมูลเชิงลึก", "ซัพพอร์ต 24/7", "Custom Branding"],
                current: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "โซลูชันที่ปรับแต่งได้เพื่อเครือข่ายอสังหาริมทรัพย์ขนาดใหญ่",
                features: ["จัดการหลายโครงการ", "API Integration", "Dedicated Account Manager", "White-label Service", "On-site Training"],
                current: false
              }
            ].map((plan, i) => (
              <div key={i} className={`relative p-12 rounded-[3rem] border transition-all hover:-translate-y-2 ${plan.current ? 'bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/30' : 'bg-background border-border/40 hover:border-primary/40'}`}>
                {plan.current && (
                  <div className="absolute top-0 right-12 -translate-y-1/2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                    Recommended
                  </div>
                )}
                <h3 className="text-2xl font-display mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-display font-bold">{plan.price !== "Custom" ? `฿${plan.price}` : plan.price}</span>
                  {plan.price !== "Custom" && <span className={`text-xs font-bold uppercase tracking-widest ${plan.current ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>/เดือน</span>}
                </div>
                <p className={`text-sm mb-10 leading-relaxed font-medium ${plan.current ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{plan.desc}</p>
                
                <ul className="space-y-4 mb-12">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-sm font-medium">
                      <div className={`h-1.5 w-1.5 rounded-full ${plan.current ? 'bg-primary-foreground' : 'bg-primary'}`} />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button className={`w-full rounded-full py-4 text-xs font-bold uppercase tracking-widest transition-all ${plan.current ? 'bg-foreground text-background hover:bg-white hover:text-primary-foreground' : 'bg-primary text-primary-foreground hover:bg-foreground'}`}>
                  {plan.price === "Custom" ? "ติดต่อเรา" : "เริ่มต้นใช้งาน"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-background border-t border-border/40">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-24">
            <div className="space-y-8 max-w-sm">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm">S</div>
                <span className="text-lg font-display font-bold tracking-tight uppercase">SmartDom</span>
              </div>
              <p className="text-muted-foreground font-medium leading-relaxed">
                สร้างสรรค์ประสบการณ์การอยู่อาศัยที่เหนือระดับ 
                ด้วยนวัตกรรมที่ออกแบบมาเพื่อหัวใจของบ้าน
              </p>
              <div className="flex gap-4">
                {["Instagram", "Twitter", "Facebook"].map((s) => (
                  <div key={s} className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center text-xs font-bold uppercase cursor-pointer hover:bg-foreground hover:text-background transition-colors">
                    {s[0]}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-16 lg:gap-32 w-full lg:w-auto">
              <div className="space-y-8">
                <h5 className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary">เมนูหลัก</h5>
                <ul className="space-y-4">
                  {["หน้าแรก", "คุณสมบัติ", "สำหรับใคร?", "ราคา"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-8">
                <h5 className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary">ความช่วยเหลือ</h5>
                <ul className="space-y-4">
                  {["นโยบายความเป็นส่วนตัว", "เงื่อนไขการใช้งาน", "ติดต่อเรา", "คำถามที่พบบ่อย"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-32 pt-12 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              © 2026 SmartDom Ecosystem • All Rights Reserved
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-4">
              <span>Made with Precision</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span>Bangkok, TH</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
