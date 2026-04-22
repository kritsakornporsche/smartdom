'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Conversation {
  id: number;
  guest_name: string;
  guest_role?: string;
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

export default function OwnerChatPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
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
      if (data.success) setConversations(data.data);
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
    if (!newMessage.trim() || !selectedConv) return;

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
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#faf9f6]">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 lg:w-96 bg-white border-r border-black/5 flex flex-col">
          <div className="p-8 border-b border-black/5">
            <h1 className="text-2xl font-display font-black tracking-tight mb-2 italic">ศูนย์จัดการแชท</h1>
            <p className="text-sm font-black uppercase tracking-wider text-muted-foreground">Chat Management Center</p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-black/5 animate-pulse rounded-2xl" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-black uppercase tracking-wider text-muted-foreground/40">ยังไม่มีการสนทนา</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full p-6 text-left border-b border-black/5 transition-all hover:bg-black/5 group ${selectedConv?.id === conv.id ? 'bg-black text-white' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className={`text-xs font-black uppercase tracking-wider ${selectedConv?.id === conv.id ? 'text-primary' : 'text-primary'}`}>{conv.dorm_name}</p>
                    <p className="text-xs opacity-40">{new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm">{conv.guest_name}</h3>
                    <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                      conv.guest_role === 'tenant' 
                        ? 'bg-[#8B7355] text-white' 
                        : 'bg-black/5 text-[#A08D74]'
                    } ${selectedConv?.id === conv.id ? 'bg-white/20 text-white border border-white/20' : ''}`}>
                      {conv.guest_role === 'tenant' ? 'ลูกหอ' : 'แขกที่สนใจ'}
                    </span>
                  </div>
                  <p className={`text-sm truncate opacity-60 mt-2 ${selectedConv?.id === conv.id ? 'text-white/60' : ''}`}>{conv.last_message || 'เริ่มการสนทนาใหม่'}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50/30">
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="p-6 bg-white border-b border-black/5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{selectedConv.guest_name}</h2>
                  <p className="text-sm font-black uppercase tracking-wider text-primary">{selectedConv.dorm_name}</p>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
                {messages.map((msg) => {
                  const isMe = String(msg.sender_id) === String((session?.user as any)?.id);
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[60%] p-6 rounded-[2rem] text-sm font-bold leading-normal shadow-sm ${isMe ? 'bg-[#3E342B] text-white rounded-tr-none shadow-xl shadow-black/10' : 'bg-white border border-black/5 text-black rounded-tl-none shadow-sm'}`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="p-8 bg-white border-t border-black/5">
                <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative flex gap-4">
                  <input
                    type="text"
                    placeholder="ตอบกลับแขกของคุณ..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-8 py-5 bg-black/5 rounded-full border border-transparent focus:border-primary focus:bg-white outline-none text-sm font-bold transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    className="px-10 py-5 bg-primary text-primary-foreground rounded-full text-sm font-black uppercase tracking-wider hover:scale-105 transition-all shadow-xl shadow-primary/20"
                  >
                    ส่งข้อความ
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-black/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h3 className="text-xl font-display font-black tracking-tight mb-2">เลือกการสนทนา</h3>
              <p className="text-sm font-black uppercase tracking-wider text-muted-foreground/40 leading-normal max-w-xs">
                เลือกแชทจากรายการด้านซ้ายเพื่อพูดคุยและตอบคำถามแขกที่สนใจหอพักของคุณ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
