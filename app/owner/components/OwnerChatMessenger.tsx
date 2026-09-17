'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll for conversations
  useEffect(() => {
    if (!session) return;
    const fetchConvs = async () => {
      try {
        const res = await fetch('/api/chat/conversations');
        const data = await res.json();
        if (data.success) setConversations(data.data);
      } catch (e) { console.error(e); }
    };

    fetchConvs();
    const interval = setInterval(fetchConvs, 10000); // Poll every 10s for list
    return () => clearInterval(interval);
  }, [session]);

  // Poll for messages in active chat
  useEffect(() => {
    if (!activeConv || !isOpen) return;
    const fetchMsgs = async () => {
      try {
        const res = await fetch(`/api/chat/messages?convId=${activeConv.id}`);
        const data = await res.json();
        if (data.success) setMessages(data.data);
      } catch (e) { console.error(e); }
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

  const pathname = usePathname();
  const isOwner = (session?.user as any)?.role === 'owner' || (session?.user as any)?.primary_role === 'owner';
  if (!session || !isOwner || pathname === '/owner/chat') return null;

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-4">
      {/* Messenger Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] bg-card text-foreground rounded-[2rem] shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white flex items-center justify-between shrink-0 shadow-md">
            {activeConv ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                  <h3 className="text-sm font-bold text-white">{activeConv.guest_name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">กำลังออนไลน์</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-xs border border-white/30 shadow-sm">
                  💬
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SmartDom Messenger</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-200">ศูนย์จัดการแชท</p>
                </div>
              </div>
            )}
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col bg-background/50">
            {!activeConv ? (
              /* Conversation List */
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {conversations.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 text-xl">
                      💬
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">ยังไม่มีการทักทายจากแขก</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">ข้อความใหม่จะแสดงขึ้นที่นี่อัตโนมัติ</p>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      className="w-full p-3.5 flex items-center gap-3.5 rounded-2xl hover:bg-muted/60 transition-all group text-left border border-transparent hover:border-border"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center font-bold text-primary text-base shadow-sm group-hover:scale-110 transition-transform shrink-0">
                        {conv.guest_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-sm font-bold text-foreground truncate">{conv.guest_name}</h4>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit mt-1 border ${
                              conv.guest_role === 'tenant' 
                                ? 'bg-primary/15 text-primary border-primary/20' 
                                : 'bg-muted text-muted-foreground border-border'
                            }`}>
                              {conv.guest_role === 'tenant' ? 'ลูกหอ' : 'แขกที่สนใจ'}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">
                            {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">{conv.last_message || 'รอการตอบกลับ...'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              /* Active Chat Messages */
              <>
                <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map(msg => {
                    const isMe = String(msg.sender_id) === String((session?.user as any)?.id);
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}>
                        <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
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

                {/* Footer Input */}
                <div className="p-3.5 bg-card border-t border-border">
                  <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="เขียนข้อความของคุณ..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 py-2.5 px-4 bg-muted/60 text-foreground placeholder:text-muted-foreground rounded-full border border-border focus:border-primary focus:bg-background outline-none text-xs font-medium transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2.5 bg-gradient-to-br from-purple-700 to-indigo-700 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-md shadow-purple-600/25 disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
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
        aria-label="SmartDom Messenger"
        className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-gradient-to-br from-purple-700 to-indigo-700 text-white rotate-90 shadow-purple-700/30' 
            : 'bg-gradient-to-br from-purple-700 to-indigo-700 text-white shadow-purple-700/30'
        }`}
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-purple-800 animate-ping" />
          </div>
        )}
      </button>
    </div>
  );
}
