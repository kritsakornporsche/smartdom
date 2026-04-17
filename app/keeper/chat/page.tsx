'use client';

import { useSession } from 'next-auth/react';
import KeeperSidebar from '../components/KeeperSidebar';
import { useSearchParams } from 'next/navigation';

export default function KeeperChatPage() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const room = searchParams.get('room') || '';

  if (status === 'loading') return null;

  return (
    <div className="flex h-screen bg-[#FDFBF7]">
      <KeeperSidebar />
      <main className="flex-1 flex flex-col h-screen min-w-0">
        <header className="h-20 bg-[#FAF8F5] border-b border-[#E5DFD3] flex items-center px-10 shrink-0">
            <h1 className="font-display text-xl font-bold tracking-tight text-[#3E342B]">ติดต่อผู้เช่า {room ? `(ห้อง ${room})` : ''}</h1>
        </header>

        <div className="flex-1 overflow-hidden p-8 flex flex-col">
            <div className="flex-1 bg-white border border-[#E5DFD3] rounded-[3rem] shadow-sm flex flex-col overflow-hidden">
                <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-4">
                    {room ? (
                        <>
                            <div className="text-center text-xs text-[#A08D74] font-bold uppercase tracking-widest my-4">เริ่มต้นการสนทนากับห้อง {room}</div>
                            <div className="self-end bg-[#8B7355] text-white px-6 py-4 rounded-[2rem] rounded-tr-sm max-w-sm text-sm shadow-md">
                                สวัสดีครับ ผมช่างประจำหอพัก จะขอเข้าไปซ่อมแซมช่วง 14:00 น. วันนี้สะดวกไหมครับ?
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-[#A08D74]">
                            <p>กรุณาเลือกลูกบ้านจากใบงานเพื่อเริ่มการสนทนา</p>
                        </div>
                    )}
                </div>
                
                <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DFD3] flex gap-3 items-center">
                    <button className="h-12 w-12 rounded-full bg-white border border-[#E5DFD3] flex items-center justify-center text-2xl shadow-sm text-[#A08D74] hover:text-[#3E342B]">
                       +
                    </button>
                    <input 
                        type="text" 
                        disabled={!room}
                        placeholder="พิมพ์ข้อความ..." 
                        className="flex-1 h-12 bg-white border border-[#E5DFD3] rounded-full px-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355]/30"
                    />
                    <button disabled={!room} className="h-12 px-8 rounded-full bg-[#3E342B] text-white text-sm font-bold shadow-lg disabled:opacity-50 hover:bg-black transition-colors">
                        ส่ง
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
