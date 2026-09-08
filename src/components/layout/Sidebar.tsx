'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Calendar,
  CalendarDays,
  Building2,
  BookOpen,
  Tv,
  Volume2,
  FileCheck,
  MessageSquareWarning,
  X
} from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { workPermits, workerOpinions, tunnelUrl } = useSafety();

  const navItems = [
    { label: '대시보드', href: '/', icon: LayoutGrid },
    { type: 'divider', label: 'SAFETY DOCS' },
    { label: '캘린더', href: '/calendar', icon: Calendar },
    { label: '안전일지', href: '/safety-log', icon: CalendarDays },
    { label: '조직도', href: '/organization', icon: Building2 },
    { label: '회의록', href: '/meeting-minutes', icon: BookOpen },
    { label: '프로그램', href: '/programs', icon: Tv },
    { label: 'TBM(AI)', href: '/tbm', icon: Volume2, badge: 'AI음성' },
    { label: '작업허가서', href: '/work-permits', icon: FileCheck },
    { label: '근로자 의견청취', href: '/worker-feedback', icon: MessageSquareWarning }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header with Official SBS PRiSM STUDiOS Logo */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" onClick={onClose} className="flex items-center gap-3 hover:bg-slate-50 transition group flex-1">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 p-1">
            <img
              src="/images/sbs_prism_logo.png"
              alt="SBS PRiSM STUDiOS"
              className="w-full h-auto object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="min-w-0">
            <div className="font-black text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>스튜디오 프리즘</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B3E] animate-pulse"></span>
            </div>
            <div className="text-[11px] font-bold text-[#FF4B3E] tracking-tight">
              예능 제작안전관리
            </div>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-1.5">
        {navItems.map((item, idx) => {
          if (item.type === 'divider') {
            return (
              <div key={idx} className="pt-3 pb-1 px-3">
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black text-[#FF4B3E] bg-[#FF4B3E]/10 border border-[#FF4B3E]/30 tracking-wider">
                  {item.label}
                </span>
              </div>
            );
          }

          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href!));
          const Icon = item.icon!;

          return (
            <Link
              key={idx}
              href={item.href!}
              onClick={onClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
                isActive
                  ? 'bg-[#FF4B3E] text-white shadow-md shadow-[#FF4B3E]/25 font-black'
                  : 'text-slate-900 hover:text-black hover:bg-slate-100 font-black'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-900 group-hover:text-black'}`} />
                <span className={isActive ? 'text-white font-black' : 'text-slate-900 group-hover:text-black font-black'}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#FF4B3E]/10 text-[#FF4B3E] border border-[#FF4B3E]/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Live External Connection Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              외부 모바일 접속
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-[#FF4B3E] font-bold border border-rose-200">
              실시간
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono truncate select-all" title={tunnelUrl || ''}>
            {tunnelUrl || '연결 준비 중...'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="no-print hidden md:flex w-60 bg-white border-r border-slate-200/90 flex-col shrink-0 h-screen sticky top-0 select-none shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isOpen && (
        <div className="no-print fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onClose}
          />
          {/* Slide-out Drawer */}
          <aside className="fixed inset-y-0 left-0 w-68 max-w-[80vw] bg-white z-50 flex flex-col shadow-2xl border-r border-slate-200 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
