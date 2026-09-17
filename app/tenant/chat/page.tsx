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
    <div className="flex h-[calc(100vh-6rem)] bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-80 lg:w-96 border-r border-border flex flex-col bg-card shrink-0">
        <div className="p-6 sm:p-8 border-b border-border bg-card/70 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Tenant Messages Center</p>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground italic">ข้อความแชท</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/60 animate-pulse rounded-2xl" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-12 text-center">
               <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                 💬
               </div>
               <p className="text-xs font-bold text-muted-foreground">ยังไม่มีประวัติการพูดคุย</p>
               <p className="text-[10px] text-muted-foreground/70 mt-1">การสนทนากับเจ้าหน้าที่หอพักจะปรากฏที่นี่</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full p-5 text-left border-b border-border/60 transition-all group ${
                    isSelected 
                      ? 'bg-primary/10 border-l-4 border-l-primary' 
                      : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {conv.dorm_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-foreground">{conv.owner_name}</h3>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      เจ้าหน้าที่
                    </span>
                  </div>
                  <p className="text-xs truncate text-muted-foreground font-medium">
                    {conv.last_message || 'เริ่มการสนทนาใหม่...'}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background/50">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 bg-card border-b border-border flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-700 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md shadow-purple-600/20">
                  {selectedConv.owner_name?.[0] || 'O'}
                </div>
                <div>
                  <h2 className="text-base font-black text-foreground">{selectedConv.owner_name}</h2>
                  <p className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <span>🏢</span>
                    <span>{selectedConv.dorm_name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <p className="text-xs font-bold text-muted-foreground">ยังไม่มีข้อความ</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">พิมพ์ข้อความเพื่อสอบถามเจ้าหน้าที่หอพักได้เลย</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = String(msg.sender_id) === String((session?.user as any)?.id);
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                      <div className={`max-w-[75%] sm:max-w-[60%] p-4 sm:p-5 rounded-2xl text-sm font-medium leading-relaxed ${
                        isMe 
                          ? 'bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-purple-700/20' 
                          : 'bg-card border border-border text-foreground rounded-tl-none shadow-sm'
                      }`}>
                        <p className="break-words whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        <div className={`text-[10px] mt-2 font-medium flex items-center gap-1 ${
                          isMe ? 'justify-end text-purple-200' : 'justify-start text-muted-foreground'
                        }`}>
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 bg-card border-t border-border shrink-0">
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative flex items-center gap-3">
                <input
                  type="text"
                  placeholder="พิมพ์ข้อความตอบกลับ..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-6 py-3.5 bg-muted/60 text-foreground placeholder:text-muted-foreground rounded-full border border-border focus:border-primary focus:bg-background outline-none text-sm font-medium transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none cursor-pointer"
                >
                  {sending ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 text-3xl shadow-inner">
              💬
            </div>
            <h3 className="text-xl font-display font-black text-foreground tracking-tight mb-2">เลือกการสนทนา</h3>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed max-w-sm">
              เลือกแชทจากรายการด้านซ้ายเพื่อพูดคุยสอบถามข้อมูลกับเจ้าของหอพักของคุณ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
