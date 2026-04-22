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
  unread_count?: number; // Potential feature
}

interface Message {
  id: number;
  sender_id: number;
  message: string;
  created_at: string;
}

export default function OwnerChatMessenger() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll for conversations
  useEffect(() => {
    if (!session) return;
    const fetchConvs = async () => {
      try {
        const res = await fetch('/api/chat/conversations');
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setConversations(data.data);
          setError(null);
        } else {
          setError(data.error || 'Failed to load conversations');
        }
      } catch (e: any) { 
        console.error('[Chat Messenger List]', e);
        setError(`Connection issue: ${e.message}`);
      }
    };

    if (isOpen) fetchConvs();
    const interval = setInterval(() => {
        if (isOpen) fetchConvs();
    }, 10000); 
    return () => clearInterval(interval);
  }, [session, isOpen]);

  // Poll for messages in active chat
  useEffect(() => {
    if (!activeConv || !isOpen) return;
    const fetchMsgs = async () => {
      try {
        const res = await fetch(`/api/chat/messages?convId=${activeConv.id}`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
        }
      } catch (e: any) { 
        console.error('[Chat Messenger Messages]', e);
      }
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 4000);
    return () => clearInterval(interval);
  }, [activeConv, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConv.id, message: newMessage })
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
      }
    } catch (e) { console.error(e); }
  };

  if (!session || (session.user as any).role !== 'owner') return null;

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-4">
      {/* Messenger Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-black/5 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-6 bg-[#3E342B] text-white flex items-center justify-between">
            {activeConv ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                  <h3 className="text-sm font-bold">{activeConv.guest_name}</h3>
                  <p className="text-sm font-black uppercase tracking-wider text-primary">กำลังออนไลน์</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xs">M</div>
                <div>
                  <h3 className="text-sm font-bold">SmartDom Messenger</h3>
                  <p className="text-sm font-black uppercase tracking-wider text-white/40">ศูนย์จัดการแชท</p>
                </div>
              </div>
            )}
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col bg-[#FDFBF7]">
            {!activeConv ? (
              /* Conversation List */
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {error && (
                  <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl mb-2">
                    {error}
                  </div>
                )}
                {conversations.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                    <p className="text-xs font-bold font-display italic">ยังไม่มีการทักทายจากแขก</p>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      className="w-full p-4 flex items-center gap-4 rounded-3xl hover:bg-[#F3EFE9] transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5DFD3] flex items-center justify-center font-bold text-[#8B7355] text-lg shadow-sm group-hover:scale-110 transition-transform">
                        {conv.guest_name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <h4 className="text-sm font-bold text-[#3E342B]">{conv.guest_name}</h4>
                            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full w-fit mt-1 ${
                              conv.guest_role === 'tenant' 
                                ? 'bg-[#8B7355] text-white' 
                                : 'bg-[#E5DFD3] text-[#A08D74]'
                            }`}>
                              {conv.guest_role === 'tenant' ? 'ลูกหอ' : 'แขกที่สนใจ'}
                            </span>
                          </div>
                          <span className="text-xs text-[#A08D74] font-bold">
                            {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-[#A08D74] truncate max-w-[150px] mt-1">{conv.last_message || 'รอการตอบกลับ...'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              /* Active Chat Messages */
              <>
                <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.map(msg => {
                    const isMe = String(msg.sender_id) === String((session?.user as any)?.id);
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 rounded-2xl text-xs font-bold leading-normal shadow-sm ${
                          isMe 
                            ? 'bg-[#3E342B] text-white rounded-tr-none' 
                            : 'bg-white border border-[#E5DFD3] text-[#3E342B] rounded-tl-none'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Input */}
                <div className="p-4 bg-white border-t border-[#E5DFD3]">
                  <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="เขียนข้อความของคุณ..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 py-3 px-6 bg-[#FAF8F5] rounded-full border border-[#DCD3C6] focus:border-primary focus:bg-white outline-none text-xs font-bold transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      className="p-3 bg-[#3E342B] text-white rounded-full hover:scale-110 transition-all shadow-lg shadow-black/10"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Trigger Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-[#3E342B] text-white rotate-90' : 'bg-[#3E342B] text-white'
        }`}
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-[#3E342B] animate-ping" />
          </div>
        )}
      </button>
    </div>
  );
}
