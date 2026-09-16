'use client';

import { useState } from 'react';
import OwnerNavbar from './components/OwnerNavbar';
import OwnerSidebar from './components/OwnerSidebar';
import OwnerChatMessenger from './components/OwnerChatMessenger';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground font-sans overflow-hidden">
      {/* 1. Full-width Top Navbar */}
      <OwnerNavbar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />

      {/* 2. Below Navbar: Persistent Desktop Sidebar (w-64) + Drawer (Mobile) + Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <OwnerSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden relative bg-background text-foreground">
          {children}
          <OwnerChatMessenger />
        </div>
      </div>
    </div>
  );
}
