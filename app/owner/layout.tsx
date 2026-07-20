'use client';

import OwnerSidebar from './components/OwnerSidebar';
import OwnerChatMessenger from './components/OwnerChatMessenger';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <OwnerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
        <OwnerChatMessenger />
      </div>
    </div>
  );
}
