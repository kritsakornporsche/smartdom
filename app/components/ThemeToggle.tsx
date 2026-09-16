'use client';

import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const current = isDark ? 'dark' : 'light';
    setTheme(current);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-xl bg-white/10 ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`h-9 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-xs font-bold border shadow-sm ${
        theme === 'dark'
          ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-300 border-white/10 hover:border-amber-400/40'
          : 'bg-white/90 hover:bg-white text-amber-600 border-slate-200 hover:border-amber-500/40 shadow-slate-200'
      } ${className}`}
      title={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง (Light Mode)' : 'เปลี่ยนเป็นธีมมืด (Dark Mode)'}
      aria-label="Toggle Theme"
    >
      <span className="text-sm select-none leading-none">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
      {showLabel && (
        <span className="text-[11px] font-bold">
          {theme === 'dark' ? 'โหมดสว่าง' : 'โหมดมืด'}
        </span>
      )}
    </button>
  );
}
