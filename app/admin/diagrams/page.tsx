'use client';

import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Link from 'next/link';

import {
  DiagramItem,
  UseCaseActorGroup,
  useCaseGroups,
  useCaseDiagramMermaid as useCaseMermaidCode,
  diagrams,
  erDiagramMermaid,
  dbTablesData
} from '@/lib/diagramsData';
import MermaidRenderer from '@/app/components/MermaidRenderer';

export default function AdminDiagramsPage() {
  const [mainTab, setMainTab] = useState<'usecase' | 'sequence' | 'erdiagram'>('usecase');
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
              <span>← กลับแดชบอร์ดหลัก</span>
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xl">📐</span>
              <h1 className="font-display font-bold text-base text-foreground">
                สถาปัตยกรรมและแผนภาพระบบ (System Architecture & Diagrams)
              </h1>
            </div>
          </div>

          {/* Main Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-border">
            <button
              onClick={() => setMainTab('usecase')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mainTab === 'usecase'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>📌</span>
              <span>Use Case Analysis</span>
            </button>
            <button
              onClick={() => setMainTab('sequence')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mainTab === 'sequence'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>⚡</span>
              <span>Sequence Diagrams</span>
            </button>
            <button
              onClick={() => setMainTab('erdiagram')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mainTab === 'erdiagram'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>🗄️</span>
              <span>ER Diagram</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

          {/* ══════════════════════ TAB 1: USE CASE ANALYSIS ══════════════════════ */}
          {mainTab === 'usecase' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-md border border-white/10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-400/20">
                  <span>🎯 บทวิเคราะห์ฟังก์ชันระบบ (Functional Requirements)</span>
                </div>
                <h2 className="text-2xl font-bold font-display">การวิเคราะห์ขอบเขต Use Case ของแต่ละบทบาทในระบบ</h2>
                <p className="text-xs md:text-sm text-white/70 mt-2 max-w-3xl leading-relaxed">
                  จำแนกตามผู้ใช้งาน 5 กลุ่ม (Actors) ครอบคลุมฟังก์ชันการทำงาน 26 Use Cases ตามขอบเขตการทำงานจริงของระบบ SmartDom แพลตฟอร์มหอพักหน้ามหาวิทยาลัยพะเยา
                </p>
                <div className="mt-5 flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(useCaseMermaidCode);
                      alert('คัดลอกโค้ด Mermaid Use Case เรียบร้อยแล้ว!');
                    }}
                    className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>📋 คัดลอกโค้ด Mermaid Use Case</span>
                  </button>
                  <span className="text-xs text-white/50 flex items-center">
                    (สามารถนำไปวางใน Draw.io หรือ Mermaid Live Editor เพื่อ Export เป็นภาพความละเอียดสูง)
                  </span>
                </div>
              </div>

              {/* Use Case Diagram Mermaid Preview */}
              <div className="bg-white rounded-3xl p-6 border border-border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span>⚡ Mermaid Code: Use Case Diagram</span>
                  </h3>
                  <span className="text-xs font-bold text-primary">5 Actors • 26 Use Cases</span>
                </div>
                <div className="bg-[#0F172A] rounded-2xl p-5 text-emerald-400 font-mono text-xs overflow-x-auto border border-white/10 max-h-56">
                  <pre className="whitespace-pre">{useCaseMermaidCode}</pre>
                </div>
              </div>

              {/* Actor Breakdown Cards */}
              <div className="space-y-4">
                <h3 className="font-display text-base font-bold text-foreground">
                  รายละเอียด Use Cases แยกตามบทบาทผู้ใช้งาน (Actors)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {useCaseGroups.map((group) => (
                    <div
                      key={group.actor}
                      className="bg-white rounded-3xl p-6 border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl p-2 rounded-2xl bg-slate-100 border border-slate-200">{group.icon}</span>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{group.actor}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{group.roleDescription}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${group.badgeColor}`}>
                            {group.useCases.length} Use Cases
                          </span>
                        </div>

                        <div className="mt-4 space-y-2.5">
                          {group.useCases.map((uc) => (
                            <div
                              key={uc.code}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-primary/40 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-md bg-white border border-border text-[10px] font-black text-primary font-mono shadow-2xs">
                                  {uc.code}
                                </span>
                                <span className="font-bold text-xs text-foreground">{uc.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                                {uc.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════ TAB 2: SEQUENCE DIAGRAMS ══════════════════════ */}
          {mainTab === 'sequence' && (
            <div className="space-y-6">
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
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          คัดลอกโค้ด Diagram
                        </button>
                      </div>

                      <MermaidRenderer
                        id={currentDiagram.id}
                        chart={currentDiagram.mermaidCode}
                      />

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
          )}

          {/* ══════════════════════ TAB 3: ER DIAGRAM ══════════════════════ */}
          {mainTab === 'erdiagram' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-md border border-white/10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-3 border border-cyan-400/20">
                  <span>🗄️ สถาปัตยกรรมฐานข้อมูล (Database Schema & ERD)</span>
                </div>
                <h2 className="text-2xl font-bold font-display">แผนภาพความสัมพันธ์ข้อมูล (Entity-Relationship Diagram)</h2>
                <p className="text-xs md:text-sm text-white/70 mt-2 max-w-3xl leading-relaxed">
                  โครงสร้างข้อมูลระบบ SmartDom ครอบคลุม 24 ตาราง จัดกลุ่มตาม 7 โดเมนหลัก พร้อมความสัมพันธ์แบบ 1:N และ 1:1 เชื่อมโยงระดับ Row-Level ด้วย <code className="text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded font-mono">dorm_id</code> และ <code className="text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded font-mono">user_id</code>
                </p>
                <div className="mt-5 flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(erDiagramMermaid);
                      alert('คัดลอกโค้ด Mermaid ER Diagram เรียบร้อยแล้ว!');
                    }}
                    className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>📋 คัดลอกโค้ด Mermaid ERD</span>
                  </button>
                  <Link
                    href="/researcher/er-diagram"
                    className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-cyan-400 transition-all flex items-center gap-2"
                  >
                    <span>🔬 เปิดใน Researcher Hub พร้อม Data Dictionary</span>
                  </Link>
                </div>
              </div>

              {/* Interactive Mermaid Renderer */}
              <div className="bg-white rounded-3xl p-6 border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>📊</span> แผนภาพ ER Diagram ฉบับเต็ม (24 ตาราง)
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    สามารถกดปุ่ม ⛶ ขยายเต็มจอ หรือ 💾 เซฟเป็น SVG ได้
                  </span>
                </div>

                <MermaidRenderer id="admin-er-diagram" chart={erDiagramMermaid} />
              </div>

              {/* Data Dictionary Summary Table */}
              <div className="bg-white rounded-3xl p-6 border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      ตารางฐานข้อมูลทั้งหมดในระบบ (24 Tables Data Dictionary)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      รายชื่อตาราง หน้าที่ คีย์หลัก และความสัมพันธ์เชื่อมโยง
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-xl">
                    Total: {dbTablesData.length} Tables
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-slate-50 text-muted-foreground font-bold">
                        <th className="py-3 px-4 w-44">ชื่อตาราง</th>
                        <th className="py-3 px-4 w-36">หมวดหมู่</th>
                        <th className="py-3 px-4">หน้าที่และคำอธิบาย</th>
                        <th className="py-3 px-4 w-24 text-center">PK</th>
                        <th className="py-3 px-4 w-60">ตารางที่เชื่อมโยง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dbTablesData.map((t) => (
                        <tr key={t.name} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-primary">
                            {t.name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                              {t.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-foreground/80 leading-relaxed">
                            {t.description}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-amber-600 text-center">
                            {t.primaryKey}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {t.relationships.map((rel, rIdx) => (
                                <span
                                  key={rIdx}
                                  className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 font-mono text-[10px]"
                                >
                                  {rel}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
