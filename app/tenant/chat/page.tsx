'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Conversation {
  id: number;
  owner_name: string;
  dorm_name: string;
  last_message: string;
  updated_at: string;
}

interface Message {
  id: number;
  sender_id: number;
  message: string;
  created_at: string;
}

export default function TenantChatPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConv]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
        // Auto-select first conversation if exists
        if (data.data.length > 0 && !selectedConv) {
          setSelectedConv(data.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConv) return;
    try {
      const res = await fetch(`/api/chat/messages?convId=${selectedConv.id}`);
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConv.id, message: newMessage })
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
        fetchConversations(); // Refresh last message in list
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white font-sans">
      {/* Sidebar - Conversation List */}
      <div className="w-80 lg:w-96 border-r border-black/5 flex flex-col bg-white shrink-0">
        <div className="p-8 border-b border-black/5 bg-[#FDFBF7]">
          <h1 className="text-2xl font-black tracking-tight mb-1 italic">ข้อความแชท</h1>
          <p className="text-sm font-black uppercase tracking-wider text-[#8B7355]">Tenant Messages Center</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-black/5 animate-pulse rounded-2xl" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-12 text-center">
               <div className="w-16 h-16 bg-[#F2EFE9] rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                  <svg className="w-8 h-8 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
               </div>
               <p className="text-sm font-black uppercase tracking-wider text-muted-foreground/40 leading-normal">ยังไม่มีประวัติการพูดคุย</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full p-6 text-left border-b border-black/5 transition-all hover:bg-black/5 group ${selectedConv?.id === conv.id ? 'bg-[#3E342B] text-white' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className={`text-xs font-black uppercase tracking-wider ${selectedConv?.id === conv.id ? 'text-white/60' : 'text-[#8B7355]'}`}>{conv.dorm_name}</p>
                  <p className="text-xs opacity-40">{new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm tracking-tight">{conv.owner_name}</h3>
                  <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full border ${selectedConv?.id === conv.id ? 'bg-white/10 text-white border-white/10' : 'bg-black/5 text-[#8B7355] border-transparent'}`}>
                    เจ้าหน้าที่
                  </span>
                </div>
                <p className={`text-sm truncate opacity-60 mt-2 font-medium ${selectedConv?.id === conv.id ? 'text-white/60' : 'text-[#5A4D41]'}`}>
                  {conv.last_message || 'เริ่มการสนทนาใหม่...'}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#FDFBF7]">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-black/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#3E342B] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-black/10">
                  {selectedConv.owner_name?.[0] || 'O'}
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">{selectedConv.owner_name}</h2>
                  <p className="text-sm font-black uppercase tracking-wider text-[#8B7355]">{selectedConv.dorm_name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors cursor-pointer">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6">
              {messages.map((msg) => {
                const isMe = String(msg.sender_id) === String((session?.user as any)?.id);
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[70%] p-6 rounded-[2rem] text-sm font-bold leading-normal shadow-sm ${
                      isMe 
                        ? 'bg-[#3E342B] text-white rounded-tr-none shadow-xl shadow-black/10' 
                        : 'bg-white border border-black/5 text-[#3E342B] rounded-tl-none'
                    }`}>
                      {msg.message}
                      <div className={`text-xs mt-2 opacity-50 flex items-center gap-1 ${isMe ? 'justify-end text-white/50' : 'justify-start text-black/30'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white border-t border-black/5 shrink-0">
              <form onSubmit={sendMessage} className="relative flex gap-4 max-w-4xl mx-auto">
                <input
                  type="text"
                  placeholder="พิมพ์ข้อความตอบกลับ..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-8 py-5 bg-black/5 rounded-full border border-transparent focus:border-[#3E342B] focus:bg-white outline-none text-sm font-bold transition-all shadow-inner placeholder:text-black/20"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className={`px-10 py-5 bg-[#3E342B] text-white rounded-full text-sm font-black uppercase tracking-wider hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center gap-2 ${
                    !newMessage.trim() || sending ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : ''
                  }`}
                >
                  {sending ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 rounded-full bg-black/5 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-black/5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-black tracking-tight mb-2">เลือกการสนทนา</h3>
            <p className="text-sm font-black uppercase tracking-wider text-[#8B7355] leading-normal max-w-xs">
              เลือกแชทจากรายการด้านซ้ายเพื่อพูดคุยสอบถามข้อมูลกับเจ้าของหอพักของคุณ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
