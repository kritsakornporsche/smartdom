'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
  action_url: string;
}

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setUnreadCount(0);
        setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (actionUrl: string | null) => {
    setIsOpen(false);
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0F172A]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0f172a]/50">
            <h3 className="font-bold text-white">การแจ้งเตือน</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold"
              >
                ทำเครื่องหมายอ่านแล้ว
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-white/50 text-sm">กำลังโหลด...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <span className="text-4xl mb-3 opacity-50">📭</span>
                <p className="text-white/50 text-sm font-bold">ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n.action_url)}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-4 ${n.is_read ? 'opacity-70' : 'bg-blue-500/5'}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {n.type === 'billing' ? '💰' : n.type === 'maintenance' ? '🔧' : '📢'}
                    </div>
                    <div>
                      <h4 className={`text-sm ${n.is_read ? 'font-medium text-white/80' : 'font-bold text-white'}`}>{n.title}</h4>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase mt-2">{new Date(n.created_at).toLocaleString('th-TH')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
