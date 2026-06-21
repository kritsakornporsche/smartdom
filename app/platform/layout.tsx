'use client';

import PlatformSidebar from './components/PlatformSidebar';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-[#080F1E] overflow-hidden">
      <PlatformSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
