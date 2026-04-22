'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PremiumDatePickerProps {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
}

export default function PremiumDatePicker({ date, onChange, label }: PremiumDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState(new Date(date || new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentView.getFullYear(), currentView.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentView.getFullYear(), currentView.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const handleSelect = (day: number) => {
    const selectedDate = new Date(currentView.getFullYear(), currentView.getMonth(), day);
    // Format to YYYY-MM-DD local
    const offset = selectedDate.getTimezoneOffset();
    const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
    onChange(localDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() + offset, 1));
  };

  const isToday = (day: number) => {
    const Today = new Date();
    return Today.getDate() === day && 
           Today.getMonth() === currentView.getMonth() && 
           Today.getFullYear() === currentView.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!date) return false;
    const d = new Date(date);
    return d.getDate() === day && 
           d.getMonth() === currentView.getMonth() && 
           d.getFullYear() === currentView.getFullYear();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-sm font-black text-[#A08D74] uppercase tracking-wider mb-3 ml-1">{label}</label>}
      
      {/* Input Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl cursor-pointer flex items-center justify-between group transition-all hover:border-[#8B6A2B]"
      >
        <span className={cn("font-bold", date ? "text-[#3E342B]" : "text-[#A08D74]")}>
          {date ? new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'เลือกวันที่...'}
        </span>
        <svg className="w-5 h-5 text-[#DCD3C6] group-hover:text-[#8B6A2B] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-[#E5DFD3] p-6 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button type="button" onClick={() => changeMonth(-1)} className="p-2 hover:bg-[#FAF8F5] rounded-xl text-[#8B7355] transition-all active:scale-90">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center">
              <p className="text-sm font-black text-[#3E342B]">{months[currentView.getMonth()]}</p>
              <p className="text-sm font-black text-[#A08D74]">{currentView.getFullYear() + 543}</p>
            </div>
            <button type="button" onClick={() => changeMonth(1)} className="p-2 hover:bg-[#FAF8F5] rounded-xl text-[#8B7355] transition-all active:scale-90">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Grid Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
              <div key={day} className="text-sm font-black text-[#DCD3C6] text-center uppercase py-2">{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {prevMonthDays.map((_, i) => (
              <div key={`prev-${i}`} className="h-10 w-10" />
            ))}
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleSelect(day)}
                className={cn(
                  "h-10 w-10 rounded-full text-xs font-bold transition-all flex items-center justify-center relative",
                  isSelected(day) 
                    ? "bg-[#3E342B] text-white shadow-lg shadow-[#3E342B]/20" 
                    : "text-[#5A4D41] hover:bg-[#FAF3E8]",
                  isToday(day) && !isSelected(day) && "text-[#8B6A2B] border border-[#8B6A2B]"
                )}
              >
                {day}
                {isToday(day) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#8B6A2B] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-[#F3EFE9] flex justify-between">
              <button 
                type="button" 
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="text-sm font-black text-[#A08D74] hover:text-[#5A4D41] uppercase tracking-wider"
              >
                ล้างวัน
              </button>
              <button 
                type="button" 
                onClick={() => {
                   const today = new Date();
                   const offset = today.getTimezoneOffset();
                   const local = new Date(today.getTime() - (offset * 60 * 1000));
                   onChange(local.toISOString().split('T')[0]);
                   setIsOpen(false);
                }}
                className="text-sm font-black text-[#8B6A2B] hover:text-[#725724] uppercase tracking-wider"
              >
                วันนี้
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
