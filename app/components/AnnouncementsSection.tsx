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
          <div key={item.id} className="group cursor-pointer">
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
  );
}
