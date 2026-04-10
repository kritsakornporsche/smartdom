'use client';

import ContractSimulator from '@/app/components/ContractSimulator';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function TenantContractSimulate() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 animate-reveal">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-display font-black tracking-tight tracking-[-0.03em]">ระบบจำลองสัญญาเช่า</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              คำนวณค่าใช้จ่ายและวางแผนการเข้าพักล่วงหน้าด้วยระบบดิจิทัล
            </p>
          </div>
          <Link 
            href="/tenant" 
            className={cn(
              "self-start px-8 py-4 bg-secondary/10 border border-border/40 rounded-2xl",
              "text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 transition-all",
              "hover:bg-secondary/20 hover:text-foreground hover:scale-105 active:scale-95"
            )}
          >
            ย้อนกลับ
          </Link>
        </div>

        <div className="animate-reveal [animation-delay:200ms]">
          <ContractSimulator 
            roomNumber="A101"
            initialPrice={5500}
          />
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8 animate-reveal [animation-delay:400ms]">
          {[
            {
              title: "วางแผนล่วงหน้า",
              desc: "ทราบยอดค่าใช้จ่ายวันแรก (Upfront Cost) ได้ทันที เพื่อเตรียมความพร้อมทางการเงินก่อนการทำสัญญาจริง",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            },
            {
              title: "โปร่งใส แม่นยำ",
              desc: "ระบบคำนวณตามมาตรฐานสัญญาเช่าของ SmartDom ช่วยให้คุณมั่นใจในทุกตัวเลขและเงื่อนไขที่กำหนดไว้",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.012 11.955 11.955 0 01-1.382 11.213 11.955 11.955 0 0010 5.831 11.955 11.955 0 0010-5.831 11.955 11.955 0 01-1.382-11.213z" />
            },
            {
              title: "หมายเหตุเพิ่มเติม",
              desc: "ค่าใช้จ่ายทำสัญญาจริงอาจมีการปรับความแตกต่างเล็กน้อยตามแพ็กเกจเสริมหรือรอบค่าน้ำ-ไฟที่คุณเลือก",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            }
          ].map((item, i) => (
            <div key={i} className="group p-10 bg-white rounded-[3rem] border border-border/40 space-y-6 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-transform duration-500 group-hover:scale-110">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon}</svg>
              </div>
              <h4 className="text-xl font-display font-black tracking-tight">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium opacity-80">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
