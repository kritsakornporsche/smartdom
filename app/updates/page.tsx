'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import { SYSTEM_UPDATES, DailyUpdate, UpdateTask } from '@/lib/updatesData';

export default function UpdatesPage() {
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
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Fix':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Design':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Performance':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Security':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-secondary text-foreground border-border';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Feature': return '🚀';
      case 'Fix': return '🛠️';
      case 'Design': return '🎨';
      case 'Performance': return '⚡';
      case 'Security': return '🔒';
      default: return '📢';
    }
  };

  // Filter updates
  const filteredUpdates = SYSTEM_UPDATES.map((update) => {
    const matchingTasks = update.tasks.filter((task) => {
      const matchesCat = selectedCategory === 'ALL' || task.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        
        {/* Header Hero Section */}
        <div className="relative rounded-3xl bg-card border border-border/60 p-6 sm:p-10 mb-10 overflow-hidden shadow-2xl">
          {/* Decorative background glows */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>เวอร์ชันล่าสุด {SYSTEM_UPDATES[0]?.version}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight mb-3">
                บันทึกการอัปเดตระบบ <span className="text-primary">(Release Notes)</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                ติดตามการพัฒนาระบบ ฟีเจอร์ใหม่ การปรับแต่งดีไซน์ และการแก้ไขปรับปรุงประสิทธิภาพ ของแพลตฟอร์มหอพักหน้ามหาวิทยาลัยพะเยา
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link 
                href="/"
                className="px-5 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm border border-border"
              >
                <span>🏠 กลับหน้าหลัก</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="ค้นหารายการอัปเดต..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-sm font-medium focus:outline-none focus:border-primary transition-all text-foreground"
            />
            <svg 
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Updates Timeline List */}
        {filteredUpdates.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-3xl p-8">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-lg font-bold text-foreground">ไม่พบรายการอัปเดตที่ค้นหา</h3>
            <p className="text-muted-foreground text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredUpdates.map((update, idx) => (
              <section key={update.date} className="relative pl-6 sm:pl-8 border-l-2 border-primary/20 space-y-6">
                
                {/* Timeline Node Badge */}
                <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-card border-4 border-primary text-primary flex items-center justify-center text-xs font-bold shadow-md">
                  {idx + 1}
                </div>

                {/* Date Header */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg sm:text-xl font-display font-black text-foreground">
                    📅 {update.date}
                  </span>
                  {update.version && (
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold border border-primary/20">
                      {update.version}
                    </span>
                  )}
                  {update.isLatest && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black border border-emerald-500/20 uppercase tracking-wider animate-pulse">
                      ✨ ล่าสุด
                    </span>
                  )}
                </div>
                
                {update.tagline && (
                  <p className="text-sm font-semibold text-muted-foreground">
                    {update.tagline}
                  </p>
                )}

                {/* Task Cards */}
                <div className="grid grid-cols-1 gap-4">
                  {update.tasks.map((task) => (
                    <div 
                      key={task.id}
                      className="p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md group"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(task.category)}</span>
                          <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {task.title}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getCategoryBadgeClass(task.category)}`}>
                          {task.category}
                        </span>
                      </div>

                      <ul className="space-y-1.5 pl-6 list-disc text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {task.details.map((detail, dIdx) => (
                          <li key={dIdx} className="hover:text-foreground transition-colors">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

              </section>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
