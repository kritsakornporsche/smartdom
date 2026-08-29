'use client';

import Link from 'next/link';
import { useState } from 'react';
import versionData from '@/lib/version.json';

export default function AppVersionBadge() {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="fixed bottom-3 right-3 z-40 pointer-events-auto select-none print:hidden font-sans">
      {/* Detail Popover on click/hover */}
      {showDetail && (
        <div className="mb-2 p-3 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl text-xs space-y-2 w-56 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SmartDom SaaS
            </span>
            <span className="text-[10px] font-mono font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded-full">
              {versionData.baseVersion}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Build No:</span>
              <span className="font-mono font-semibold text-foreground">#{versionData.buildNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Commit Hash:</span>
              <span className="font-mono font-semibold text-foreground">{versionData.gitHash}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated:</span>
              <span className="font-medium text-foreground">{versionData.updatedAt}</span>
            </div>
          </div>

          <div className="pt-1 border-t border-border/60">
            <Link
              href="/updates"
              className="block w-full py-1 text-center text-[10px] font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 rounded-lg"
            >
              ดูบันทึกการอัปเดต (Changelog) →
            </Link>
          </div>
        </div>
      )}

      {/* Main Bottom-Right Capsule Button */}
      <button
        onClick={() => setShowDetail(!showDetail)}
        className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-card/90 dark:bg-card/95 backdrop-blur-md border border-border hover:border-primary/40 rounded-full shadow-sm hover:shadow-md text-muted-foreground hover:text-foreground transition-all duration-300 text-[10px] cursor-pointer active:scale-95"
        title="คลิกเพื่อดูรายละเอียดเวอร์ชัน"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="font-mono font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
          {versionData.shortDisplay || `v2.4.0-b${versionData.buildNumber}`}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
          ({versionData.gitHash})
        </span>
      </button>
    </div>
  );
}
