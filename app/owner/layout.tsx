'use client';

import OwnerNavbar from './components/OwnerNavbar';
import OwnerSidebar from './components/OwnerSidebar';
import OwnerBottomNav from './components/OwnerBottomNav';
import OwnerChatMessenger from './components/OwnerChatMessenger';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground font-sans overflow-hidden">
      {/* 1. Full-width Top Navbar */}
      <OwnerNavbar />

      {/* 2. Below Navbar: Persistent Desktop Sidebar (hidden on mobile) + Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <OwnerSidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative bg-background text-foreground pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </div>
      </div>

      {/* 3. Mobile Bottom Navigation Bar (md:hidden) */}
      <OwnerBottomNav />

      {/* 4. Floating Owner Chat Messenger */}
      <OwnerChatMessenger />
    </div>
  );
}

