'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  id: number;
  sender_id: number;
  message: string;
  created_at: string;
}

interface ChatWidgetProps {
  dormId?: number;
  ownerName?: string;
  initialConversationId?: number;
}

export default function ChatWidget({ dormId, ownerName, initialConversationId }: ChatWidgetProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && conversationId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/chat/messages?convId=${conversationId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (e) {
      console.error('Fetch messages error:', e);
    }
  };

  const startConversation = async () => {
    if (!dormId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dormId })
      });
      const data = await res.json();
      if (data.success) {
        setConversationId(data.data.id);
        setIsOpen(true);
      }
    } catch (e) {
      console.error('Start conversation error:', e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: newMessage })
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
      }
    } catch (e) {
      console.error('Send message error:', e);
    }
  };

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      if (!session) {
        window.location.href = `/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const targetDormId = e.detail?.dormId;
      if (!targetDormId || Number(targetDormId) === Number(dormId)) {
        if (!conversationId) {
          startConversation();
        } else {
          setIsOpen(true);
        }
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, [session, dormId, conversationId]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 font-sans">
      {!isOpen ? (
        <button
          id="open-chat-widget-btn"
          onClick={() => {
            if (!session) {
              window.location.href = `/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
              return;
            }
            if (conversationId) setIsOpen(true);
            else startConversation();
          }}
          disabled={loading}
          aria-label="ติดต่อหอพัก"
          className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-purple-700 to-indigo-700 text-white shadow-2xl shadow-purple-700/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        >
          <svg className="w-8 h-8 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {loading && <div className="absolute inset-0 bg-white/20 animate-pulse rounded-[2rem]" />}
        </button>
      ) : (
        <div className="w-[360px] sm:w-96 h-[520px] bg-card text-foreground rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-border animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
              <div>
                <p className="text-xs font-bold tracking-tight text-white">
                  {ownerName ? `แชทกับ ${ownerName}` : 'แชทกับเจ้าหน้าที่หอพัก'}
                </p>
                <p className="text-[10px] font-medium text-purple-200">สอบถามรายละเอียดห้องพัก</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-3 bg-background/50">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 text-xl">
                  💬
                </div>
                <p className="text-xs font-bold text-foreground">เริ่มการสนทนา</p>
                <p className="text-[11px] text-muted-foreground mt-1">สอบถามข้อมูลเพิ่มเติมกับเจ้าหน้าที่ได้เลย</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = String(msg.sender_id) === String((session?.user as any)?.id);
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}>
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-purple-600/15' 
                      : 'bg-card border border-border text-foreground rounded-tl-none shadow-sm'
                  }`}>
                    <p className="break-words whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    <div className={`text-[9px] mt-1.5 font-medium flex items-center ${
                      isMe ? 'justify-end text-purple-200' : 'justify-start text-muted-foreground'
                    }`}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3.5 bg-card border-t border-border shrink-0">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                placeholder="พิมพ์ข้อความ..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 py-2.5 pl-4 pr-12 bg-muted/60 text-foreground placeholder:text-muted-foreground rounded-full border border-border focus:border-primary focus:bg-background outline-none text-xs font-medium transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-1 top-1 bottom-1 aspect-square bg-gradient-to-br from-purple-700 to-indigo-700 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-purple-600/25 disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none cursor-pointer"
              >
                <svg className="w-4 h-4 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
