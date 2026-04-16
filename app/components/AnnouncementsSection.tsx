'use client';

import { useEffect, useState } from 'react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export default function AnnouncementsSection() {
  const [news, setNews] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/announcements');
        const json = await res.json();
        if (json.success) setNews(json.data.slice(0, 3)); // Show only latest 3
      } catch (err) {
        console.error('Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const [selectedNews, setSelectedNews] = useState<Announcement | null>(null);

  const getCategoryEmoji = (cat: string) => {
    switch(cat) {
      case 'urgent': return '🚨';
      case 'maintenance': return '🛠️';
      case 'activity': return '🎉';
      default: return '📢';
    }
  };

  if (loading) return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5DFD3] animate-pulse">
      <div className="h-4 w-32 bg-[#FAF8F5] rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-12 bg-[#FAF8F5] rounded-2xl"></div>
        <div className="h-12 bg-[#FAF8F5] rounded-2xl"></div>
      </div>
    </div>
  );

  if (news.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-[32px] p-6 border border-[#E5DFD3] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-[#3E342B] flex items-center gap-2">
            <span className="text-lg">📢</span> ประกาศและข่าวสารลำสุด
          </h3>
          <span className="text-[10px] font-bold text-[#A08D74] bg-[#FAF8F5] px-2 py-0.5 rounded-md">
            {news.length} รายการ
          </span>
        </div>

        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="group cursor-pointer" onClick={() => setSelectedNews(item)}>
              <div className="flex gap-4 items-start p-3 rounded-2xl hover:bg-[#FAF8F5] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#F3EFE9] flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                  {getCategoryEmoji(item.category)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#3E342B] truncate">{item.title}</h4>
                  <p className="text-[10px] text-[#A08D74] mt-1 line-clamp-1">{item.content}</p>
                  <p className="text-[9px] text-[#A08D74]/60 mt-2 font-medium">
                    {new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-10">
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD3] flex items-center justify-center text-2xl">
                        {getCategoryEmoji(selectedNews.category)}
                    </div>
                    <button 
                        onClick={() => setSelectedNews(null)}
                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-black/5 text-[#A08D74]"
                    >
                        ✕
                    </button>
                 </div>
                 <h2 className="text-2xl font-black text-[#3E342B] mb-4">{selectedNews.title}</h2>
                 <p className="text-xs font-black text-[#8B7355] uppercase tracking-widest mb-8 flex items-center gap-2">
                    <span className="h-1 w-8 bg-[#8B7355] rounded-full"></span>
                    {new Date(selectedNews.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                 </p>
                 <div className="text-sm font-medium text-[#564D44] leading-relaxed bg-[#FAF8F5] p-8 rounded-3xl border border-[#E5DFD3]/50 whitespace-pre-wrap">
                    {selectedNews.content}
                 </div>
                 <button 
                    onClick={() => setSelectedNews(null)}
                    className="w-full mt-10 py-4 bg-[#3E342B] text-white font-black rounded-2xl shadow-xl shadow-black/10 active:scale-95 transition-all text-sm"
                 >
                    รับทราบ
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
