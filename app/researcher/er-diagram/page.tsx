'use client';

import { useState } from 'react';
import Link from 'next/link';
import { erDiagramMermaid, dbTablesData, DbTableInfo } from '@/lib/diagramsData';
import MermaidRenderer from '@/app/components/MermaidRenderer';

const categories = [
  'ทั้งหมด',
  'ผู้ใช้งาน & สิทธิ์',
  'หอพัก & ทะเบียน',
  'ห้องพัก & ผู้เช่า',
  'สัญญา & การเงิน',
  'บริการ & ซ่อมบำรุง',
  'ทีมงาน & ดูแล',
  'สื่อสาร & ข่าวสาร',
];

export default function ResearcherErDiagramPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'both' | 'diagram' | 'dictionary'>('both');

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(erDiagramMermaid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTables = dbTablesData.filter((table) => {
    const matchesCategory =
      selectedCategory === 'ทั้งหมด' || table.category === selectedCategory;
    const matchesSearch =
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.relationships.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Sub Header */}
      <div className="h-16 bg-slate-900/90 border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/researcher"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>← ภาพรวม</span>
          </Link>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗄️</span>
            <h1 className="font-bold text-sm sm:text-base text-white">
              แผนภาพความสัมพันธ์ข้อมูล (Entity-Relationship Diagram: ER Diagram)
            </h1>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveView('both')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeView === 'both' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setActiveView('diagram')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeView === 'diagram' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            เฉพาะแผนภาพ (Visual ERD)
          </button>
          <button
            onClick={() => setActiveView('dictionary')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeView === 'dictionary' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            พจนานุกรมข้อมูล (Data Dictionary)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Banner Section */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/20 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  DATABASE ARCHITECTURE
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  24 ENTITIES / TABLES
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  MULTI-TENANT ROW LEVEL SECURITY
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white">
                โครงสร้างฐานข้อมูลรวมศูนย์ (Unified SmartDom Schema)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-4xl leading-relaxed">
                สถาปัตยกรรมฐานข้อมูล MySQL ของแพลตฟอร์ม SmartDom ครอบคลุม 24 ตาราง จัดกลุ่มตาม 7 โดเมนหลัก พร้อมความสัมพันธ์แบบ 1:N และ 1:1 เชื่อมโยงด้วย <code className="text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded font-mono">dorm_id</code> และ <code className="text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded font-mono">user_id</code> เพื่อแยกแยะข้อมูลลูกหอและเจ้าของหอพักในระดับแถว (Row-Level Multi-Tenancy)
              </p>
            </div>

            <button
              onClick={handleCopyMermaid}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
            >
              <span>{copied ? '✅ คัดลอกสำเร็จ!' : '📋 คัดลอก Mermaid ERD Code'}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <div className="text-[11px] text-slate-400">ตารางทั้งหมด</div>
              <div className="text-xl font-black text-white mt-0.5">24 ตาราง</div>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <div className="text-[11px] text-slate-400">โดเมนการทำงาน</div>
              <div className="text-xl font-black text-cyan-400 mt-0.5">7 โดเมน</div>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <div className="text-[11px] text-slate-400">รูปแบบการจัดการสิทธิ์</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">RBAC 6 Roles</div>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <div className="text-[11px] text-slate-400">ระบบสัญญา</div>
              <div className="text-xl font-black text-purple-400 mt-0.5">Hybrid Physical</div>
            </div>
          </div>
        </div>

        {/* Visual Mermaid ER Diagram Section */}
        {(activeView === 'both' || activeView === 'diagram') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📐</span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  แผนภาพความสัมพันธ์เชิงภาพ (Interactive Mermaid ER Diagram)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                คลิกปุ่ม ⛶ เต็มจอ เพื่อขยายขนาดใหญ่ หรือปุ่ม 💾 ดาวน์โหลด SVG
              </span>
            </div>

            <MermaidRenderer id="smartdom-er-diagram" chart={erDiagramMermaid} />

            {/* Mermaid Source Code Accordion */}
            <details className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-lg group">
              <summary className="px-5 py-3.5 bg-slate-950 border-b border-white/5 flex items-center justify-between cursor-pointer select-none text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span className="flex items-center gap-2">
                  <span>💻</span> ดูโค้ดไวยากรณ์ Mermaid ER Diagram (erDiagram Syntax)
                </span>
                <span className="text-[11px] text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 bg-black/40 overflow-x-auto max-h-96">
                <pre className="text-xs font-mono text-cyan-200 leading-relaxed">
                  <code>{erDiagramMermaid}</code>
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Data Dictionary Section */}
        {(activeView === 'both' || activeView === 'dictionary') && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>📚</span> พจนานุกรมข้อมูล (Database Data Dictionary - 24 Tables)
                </h3>
                <p className="text-xs text-slate-400">
                  คำอธิบายวัตถุประสงค์ คีย์หลัก (Primary Key) และความสัมพันธ์ของแต่ละตารางในระบบ
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อตาราง หรือความสัมพันธ์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Table View */}
            <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold uppercase">
                      <th className="py-3.5 px-4 w-48">ชื่อตาราง (Table Name)</th>
                      <th className="py-3.5 px-4 w-36">หมวดหมู่ (Category)</th>
                      <th className="py-3.5 px-4">หน้าที่และคำอธิบาย (Description)</th>
                      <th className="py-3.5 px-4 w-28 text-center">Primary Key</th>
                      <th className="py-3.5 px-4 w-24 text-center">จำนวนฟิลด์</th>
                      <th className="py-3.5 px-4 w-64">ตารางที่เชื่อมโยง (Relationships)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {filteredTables.map((table) => (
                      <tr key={table.name} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                          {table.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5 text-[11px] font-semibold whitespace-nowrap">
                            {table.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 leading-relaxed text-slate-200">
                          {table.description}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-center">
                          {table.primaryKey}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-center">
                          {table.columnsCount}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {table.relationships.map((rel, rIdx) => (
                              <span
                                key={rIdx}
                                className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 font-mono text-[10px]"
                              >
                                {rel}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTables.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          ไม่พบตารางที่ตรงกับคำค้นหา &quot;{searchQuery}&quot;
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Architectural Principles Documentation */}
        <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className="text-base font-bold text-white">
              หลักการออกแบบฐานข้อมูลสำหรับวิทยานิพนธ์ (Database Architecture Principles)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="font-bold text-cyan-300">1. Single Schema Multi-tenancy</div>
              <p className="text-slate-400 leading-relaxed">
                การใช้ Schema เดียวพร้อมฟิลด์ <code className="text-cyan-300">dorm_id</code> ช่วยแก้ปัญหา Connection Leaks และ Resource Consumption เมื่อจำนวนหอพักเพิ่มขึ้น ทำให้การจัดการ Connection Pool ของ Next.js ทำงานได้อย่างมีเสถียรภาพสูงสุด
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="font-bold text-emerald-300">2. Hybrid Physical Contract Tracking</div>
              <p className="text-slate-400 leading-relaxed">
                ตาราง <code className="text-emerald-300">contracts</code> เก็บทั้งข้อมูลสัญญากระดาษจริง วันที่เริ่ม-สิ้นสุด ลายเซ็น และรูปถ่ายสลิป/สัญญา พร้อมฟิลด์ <code className="text-emerald-300">parent_contract_id</code> เพื่อรองรับการสืบทอดประวัติเมื่อมีการต่อสัญญาเช่า
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="font-bold text-purple-300">3. Multi-Dormitory Keeper Architecture</div>
              <p className="text-slate-400 leading-relaxed">
                ตาราง <code className="text-purple-300">keeper_dormitories</code> และ <code className="text-purple-300">user_dorm_roles</code> ออกแบบให้ช่างซ่อมบำรุงและแม่บ้าน 1 คน สามารถดูแลรับผิดชอบงานในหลายหอพักพร้อมกันได้ โดยสามารถสลับบริบทการทำงานได้แบบเรียลไทม์
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
