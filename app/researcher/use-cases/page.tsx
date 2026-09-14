'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCaseGroups, useCaseDiagramMermaid } from '@/lib/diagramsData';

export default function ResearcherUseCasesPage() {
  const [selectedActor, setSelectedActor] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const totalUseCases = useCaseGroups.reduce((acc, g) => acc + g.useCases.length, 0);

  const filteredGroups = useCaseGroups
    .filter(g => selectedActor === 'ALL' || g.actor.includes(selectedActor))
    .map(g => {
      const filteredCases = g.useCases.filter(
        uc =>
          searchQuery === '' ||
          uc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          uc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          uc.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...g, useCases: filteredCases };
    })
    .filter(g => g.useCases.length > 0);

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(useCaseDiagramMermaid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
            <Link href="/researcher" className="hover:underline">แดชบอร์ดงานวิจัย</Link>
            <span>/</span>
            <span>Use Case Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            การวิเคราะห์กรณีการใช้งาน (Use Case Analysis)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            รวบรวมทั้งสิ้น {totalUseCases} กรณีการใช้งาน แบ่งตาม 5 กลุ่มผู้กระทำ (Actors) ในขอบเขตระบบ SmartDom
          </p>
        </div>

        <button
          onClick={handleCopyMermaid}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all cursor-pointer"
        >
          <span>{copied ? '✅ คัดลอกเรียบร้อย!' : '📋 คัดลอก Use Case Diagram Code'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="ค้นหา Use Case (รหัส, ชื่อ, คำอธิบาย)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
        </div>

        {/* Actor Filter */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { key: 'ALL', label: 'ทั้งหมด' },
            { key: 'Guest', label: '🌐 ผู้เยี่ยมชม' },
            { key: 'Tenant', label: '🏠 ผู้เช่า' },
            { key: 'Owner', label: '🏢 เจ้าของหอ' },
            { key: 'Keeper', label: '🔧 ผู้ดูแล' },
            { key: 'Admin', label: '🛡️ แอดมิน' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedActor(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedActor === tab.key
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-8">
        {filteredGroups.map((group, gIdx) => (
          <div
            key={gIdx}
            className="rounded-3xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-xl"
          >
            {/* Group Header */}
            <div className="p-6 bg-slate-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-white/5 border border-white/10">
                  {group.icon}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {group.actor}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{group.roleDescription}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {group.useCases.length} กรณีการใช้งาน
              </span>
            </div>

            {/* Cases Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-bold uppercase">
                    <th className="py-3 px-6 w-24">รหัสเคส</th>
                    <th className="py-3 px-6 w-80">ชื่อกรณีการใช้งาน (Use Case Name)</th>
                    <th className="py-3 px-6">คำอธิบายและขอบเขตฟังก์ชัน (Scope & Description)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {group.useCases.map((uc) => (
                    <tr key={uc.code} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-mono font-black text-cyan-400">
                        {uc.code}
                      </td>
                      <td className="py-4 px-6 font-bold text-white leading-relaxed">
                        {uc.name}
                      </td>
                      <td className="py-4 px-6 text-slate-300 leading-relaxed">
                        {uc.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/10 text-slate-400">
            <span className="text-4xl">🔍</span>
            <p className="text-sm font-bold mt-2">ไม่พบกรณีการใช้งานที่ตรงกับเงื่อนไข</p>
          </div>
        )}
      </div>

      {/* Global Use Case Diagram Section */}
      <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🌐</span> แผนภาพกรณีการใช้งานรวม (Global Use Case Diagram - Mermaid Syntax)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ความสัมพันธ์ระหว่างกลุ่มผู้ใช้งาน (Actors) กับขอบเขตระบบย่อย (Sub-systems)
            </p>
          </div>
        </div>

        <div className="p-4 bg-black/50 rounded-2xl border border-white/5 overflow-x-auto">
          <pre className="text-xs font-mono text-cyan-200 leading-relaxed">
            <code>{useCaseDiagramMermaid}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
