'use client';

import OwnerSidebar from './components/OwnerSidebar';
import OwnerChatMessenger from './components/OwnerChatMessenger';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#FDFBF7]">
      <OwnerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
        <OwnerChatMessenger />
      </div>
    </div>
  );
}
