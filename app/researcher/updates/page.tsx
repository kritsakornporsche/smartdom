'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SYSTEM_UPDATES } from '@/lib/updatesData';

export default function ResearcherUpdatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { key: 'ALL', label: 'ทั้งหมด', icon: '✨' },
    { key: 'Feature', label: 'ฟีเจอร์ใหม่', icon: '🚀' },
    { key: 'Fix', label: 'แก้ไขบั๊ก', icon: '🛠️' },
    { key: 'Design', label: 'ดีไซน์ & UI', icon: '🎨' },
    { key: 'Performance', label: 'ประสิทธิภาพ', icon: '⚡' },
    { key: 'Security', label: 'ความปลอดภัย', icon: '🔒' },
  ];

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Feature':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Fix':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Design':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Performance':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Security':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  const filteredUpdates = SYSTEM_UPDATES.map((update) => {
    const matchingTasks = update.tasks.filter((task) => {
      const matchesCat = selectedCategory === 'ALL' || task.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.details.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });

    return {
      ...update,
      tasks: matchingTasks,
    };
  }).filter((update) => update.tasks.length > 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
            <Link href="/researcher" className="hover:underline">แดชบอร์ดงานวิจัย</Link>
            <span>/</span>
            <span>Release Notes & Updates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            บันทึกการพัฒนาและอัปเดตระบบ (Release Notes)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ประวัติการปรับปรุงระบบ SmartDom การแก้ไขบั๊ก และการพัฒนาฟังก์ชันการทำงานเวอร์ชันล่าสุด (v2.5.0)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="ค้นหารายการอัปเดต..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === c.key
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Updates Timeline */}
      <div className="space-y-6">
        {filteredUpdates.map((update, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-xl p-6 sm:p-8 space-y-6"
          >
            {/* Header of Date */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {update.date}
                  </h3>
                  <p className="text-xs text-cyan-400 font-medium">{update.tagline}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                {update.tasks.length} รายการ
              </span>
            </div>

            {/* Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {update.tasks.map((task, tIdx) => (
                <div
                  key={tIdx}
                  className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${getCategoryBadgeClass(
                        task.category
                      )}`}
                    >
                      {task.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{idx + 1}.{tIdx + 1}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {task.title}
                  </h4>

                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {task.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredUpdates.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/10 text-slate-400">
            <span className="text-4xl">🔍</span>
            <p className="text-sm font-bold mt-2">ไม่พบรายการอัปเดตที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
