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

  if (!session) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-sans">
      {!isOpen ? (
        <button
          onClick={() => {
            if (conversationId) setIsOpen(true);
            else startConversation();
          }}
          disabled={loading}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-110 transition-all group"
        >
          <svg className="w-8 h-8 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {loading && <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />}
        </button>
      ) : (
        <div className="w-96 h-[500px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-black/5 animate-in slide-in-from-bottom-8">
          {/* Header */}
          <div className="p-6 bg-black text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <p className="text-[11px] font-black uppercase tracking-widest">
                {ownerName ? `แชทกับ ${ownerName}` : 'แชทกับเจ้าหน้าที่'}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-4">
                   <svg className="w-6 h-6 text-black/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">เริ่มการสนทนา</p>
                <p className="text-[10px] text-muted-foreground/60 italic mt-1">สอบถามข้อมูลเพิ่มเติมกับเจ้าหน้าที่ได้เลย</p>
              </div>
            )}
            {messages.map((msg) => {
               const isMe = String(msg.sender_id) === String((session?.user as any)?.id);
               return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-[11px] font-bold leading-relaxed shadow-sm ${isMe ? 'bg-[#8B7355] text-white rounded-tr-none shadow-lg shadow-[#8B7355]/20' : 'bg-white border border-black/5 text-black rounded-tl-none'}`}>
                      {msg.message}
                    </div>
                  </div>
               );
            })}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-6 bg-white border-t border-black/5">
            <div className="relative">
              <input
                type="text"
                placeholder="พิมพ์ข้อความ..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full px-6 py-4 bg-black/5 rounded-2xl border border-transparent focus:border-primary focus:bg-white outline-none text-xs font-bold transition-all pr-16"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all"
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
