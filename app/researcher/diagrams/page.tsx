'use client';

import { useState } from 'react';
import Link from 'next/link';
import { diagrams, DiagramItem } from '@/lib/diagramsData';
import MermaidRenderer from '@/app/components/MermaidRenderer';

export default function ResearcherDiagramsPage() {
  const [selectedId, setSelectedId] = useState<string>('contract');
  const [viewMode, setViewMode] = useState<'both' | 'diagram' | 'steps'>('both');
  const [copied, setCopied] = useState<boolean>(false);

  const currentDiagram = diagrams.find(d => d.id === selectedId) || diagrams[0];

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(currentDiagram.mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <span className="text-xl">📐</span>
            <h1 className="font-bold text-sm sm:text-base text-white">
              Sequence Diagrams (แผนภาพลำดับขั้นตอนการทำงาน)
            </h1>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'both' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setViewMode('diagram')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'diagram' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            เฉพาะโค้ดผัง
          </button>
          <button
            onClick={() => setViewMode('steps')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'steps' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            เฉพาะตารางขั้นตอน
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Diagram Selector */}
        <div className="w-full md:w-80 bg-slate-950/70 border-r border-white/10 flex flex-col shrink-0 overflow-y-auto p-4 space-y-2">
          <div className="px-2 py-1 text-[10px] font-black text-white/40 uppercase tracking-widest">
            รายการแผนภาพ ({diagrams.length} เวิร์กโฟลว์)
          </div>

          {diagrams.map((d) => {
            const isSelected = d.id === selectedId;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400/50 shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-900/50 border-white/5 hover:bg-slate-900 hover:border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {d.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {d.steps.length} ขั้นตอน
                  </span>
                </div>
                <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${
                  isSelected ? 'text-cyan-300 font-extrabold' : 'text-white'
                }`}>
                  {d.title}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header of selected diagram */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {currentDiagram.category} • {currentDiagram.badge}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {currentDiagram.title}
                </h2>
              </div>

              <button
                onClick={handleCopyMermaid}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all cursor-pointer"
              >
                <span>{copied ? '✅ คัดลอกเรียบร้อย!' : '📋 คัดลอก Mermaid Code'}</span>
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {currentDiagram.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-xs text-slate-400">
              <span className="font-bold text-slate-200">Actors ในแผนภาพ:</span>
              {currentDiagram.actors.map((actor, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-white/5">
                  {actor}
                </span>
              ))}
            </div>
          </div>

          {/* Diagram Visual & Code View */}
          {(viewMode === 'both' || viewMode === 'diagram') && (
            <div className="space-y-6">
              {/* Graphical UML Diagram */}
              <MermaidRenderer
                id={currentDiagram.id}
                chart={currentDiagram.mermaidCode}
              />

              {/* Code Syntax Box */}
              <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-lg">
                <div className="px-5 py-3 bg-slate-950 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                    <span>📊</span> โค้ดแผนภาพลำดับ (Mermaid Sequence Syntax)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">UML Lifelines & Activation Specs</span>
                </div>
                <div className="p-4 bg-black/40 overflow-x-auto">
                  <pre className="text-xs font-mono text-cyan-200 leading-relaxed">
                    <code>{currentDiagram.mermaidCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Steps Table View */}
          {(viewMode === 'both' || viewMode === 'steps') && (
            <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-lg">
              <div className="px-5 py-3 bg-slate-950 border-b border-white/10">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>📝</span> ตารางแจกแจงขั้นตอน (Step-by-Step Execution Table)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold uppercase">
                      <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                      <th className="py-3 px-4 w-44">ผู้ดำเนินการ (Actor)</th>
                      <th className="py-3 px-4">กิจกรรม / คำสั่ง (Action)</th>
                      <th className="py-3 px-4 w-44">เป้าหมาย (Target)</th>
                      <th className="py-3 px-4">หมายเหตุ (Note)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {currentDiagram.steps.map((s) => (
                      <tr key={s.step} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400 text-center">
                          {s.step}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {s.actor}
                        </td>
                        <td className="py-3 px-4 leading-relaxed">
                          {s.action}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                          {s.target}
                        </td>
                        <td className="py-3 px-4 text-slate-500 italic">
                          {s.note || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
