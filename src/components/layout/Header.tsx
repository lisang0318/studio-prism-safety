'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  Shield,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  LogOut,
  User,
  Menu,
  Globe,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Laptop,
  FileCheck,
  MessageSquareWarning,
  PenTool
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSafety } from '@/context/SafetyContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const { workPermits, workerOpinions, tunnelUrl, serverIp } = useSafety();
  const { user, logout } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHotline, setShowHotline] = useState(false);
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [qrMode, setQrMode] = useState<'tunnel' | 'ip' | 'local'>('tunnel');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setTimeStr(now.toLocaleDateString('ko-KR', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingPermits = workPermits.filter(p => p.status === '승인대기');
  const unresolvedOpinions = workerOpinions.filter(o => o.status !== '조치완료' && o.status !== '반영불가');
  const totalAlerts = pendingPermits.length + unresolvedOpinions.length;

  const displayName = user?.name || '이상욱 총괄책임자';
  const displayDept = user?.department || '스튜디오프리즘 안전관리단';
  const displayRoleBadge = user?.role === 'SUPER_ADMIN' ? '총괄책임자' :
                           user?.role === 'SAFETY_TEAM' ? '안전관리자' : '현장담당자';

  return (
    <header className="no-print h-16 bg-white border-b border-slate-200/90 px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none">
      {/* Current Context & Live Time & Mobile Hamburger */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5 text-slate-900" />
          </button>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4B3E] animate-pulse shrink-0"></span>
          <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate">
            스튜디오프리즘 안전관리
          </span>
        </div>
        <div className="hidden md:block h-4 w-[1px] bg-slate-300"></div>
        <div className="hidden md:block text-xs font-bold text-slate-800 font-mono">
          {timeStr || '한국 표준시 실시간 관리중'}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Mobile External QR & Link Access Button */}
        <button
          onClick={() => setShowExternalModal(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition shadow-xs"
          title="모바일 외부 접속 주소 및 QR 코드 확인"
        >
          <QrCode className="w-3.5 h-3.5 text-[#FF4B3E] shrink-0" />
          <span className="hidden xs:inline">모바일 외부 접속</span>
          <span className="xs:hidden">외부 QR</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
        </button>

        {/* Emergency Hotline Button */}
        <button
          onClick={() => setShowHotline(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#FF4B3E]/10 border border-[#FF4B3E]/30 text-[#FF4B3E] hover:bg-[#FF4B3E]/20 text-xs font-black transition shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#FF4B3E] shrink-0" />
          <span className="hidden md:inline">비상 연락망</span>
          <span className="md:hidden">비상</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 transition"
            title="실시간 알림"
          >
            <Bell className="w-4 h-4 text-slate-800" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4B3E] text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-md shadow-[#FF4B3E]/30">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-80 max-w-xs sm:max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 text-xs z-50 animate-in fade-in-50 zoom-in-95 text-slate-900">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                <span className="font-black text-slate-900 text-sm">실시간 안전 알림</span>
                <button onClick={() => setShowNotifications(false)} className="text-slate-800 hover:text-black">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {pendingPermits.map(p => (
                  <Link
                    key={p.id}
                    href={`/work-permits`}
                    onClick={() => setShowNotifications(false)}
                    className="block p-2.5 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100 transition"
                  >
                    <div className="flex items-center justify-between font-black text-amber-900 mb-1">
                      <span>[허가서 승인대기]</span>
                      <span className="text-[10px] text-slate-800 font-mono font-bold">{p.createdAt.slice(11, 16)}</span>
                    </div>
                    <div className="text-slate-900 font-black line-clamp-1">{p.title}</div>
                    <div className="text-[11px] text-slate-800 font-medium mt-0.5">{p.studioName} · {p.contractorName}</div>
                  </Link>
                ))}

                {unresolvedOpinions.map(o => (
                  <Link
                    key={o.id}
                    href={`/worker-feedback`}
                    onClick={() => setShowNotifications(false)}
                    className="block p-2.5 rounded-xl bg-[#FF4B3E]/10 border border-[#FF4B3E]/30 hover:bg-[#FF4B3E]/20 transition"
                  >
                    <div className="flex items-center justify-between font-black text-[#FF4B3E] mb-1">
                      <span>[근로자 위험신고: {o.status}]</span>
                      <span className="text-[10px] text-slate-800 font-mono font-bold">{o.createdAt.slice(11, 16)}</span>
                    </div>
                    <div className="text-slate-900 font-black line-clamp-1">{o.title}</div>
                    <div className="text-[11px] text-slate-800 font-medium mt-0.5">{o.studioName} · {o.authorName}</div>
                  </Link>
                ))}

                {totalAlerts === 0 && (
                  <div className="text-center py-6 text-slate-800">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                    <p className="font-bold text-slate-900">현재 대기 중인 긴급 알림이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile with Dynamic Info & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#FF4B3E] flex items-center justify-center text-white font-black text-xs shadow-xs">
            {displayName.slice(0, 2)}
          </div>
          <div className="text-left hidden lg:block">
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>{displayName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF4B3E]/10 text-[#FF4B3E] border border-[#FF4B3E]/30 font-black">
                {displayRoleBadge}
              </span>
            </div>
            <div className="text-[11px] text-slate-800 font-medium">{displayDept}</div>
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 transition"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Mobile External Access & QR Modal */}
      {mounted && showExternalModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl animate-in fade-in-50 zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                <Globe className="w-5 h-5 text-[#FF4B3E]" />
                <span>모바일 외부 접속 주소 & QR 코드</span>
              </div>
              <button onClick={() => setShowExternalModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher (LTE/5G vs Local IP) */}
            <div className="p-1 bg-slate-100 border border-slate-200 rounded-2xl grid grid-cols-3 gap-1 text-xs mb-4">
              <button
                onClick={() => setQrMode('tunnel')}
                className={`py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  qrMode === 'tunnel' ? 'bg-[#FF4B3E] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>LTE/모바일 (추천)</span>
              </button>
              <button
                onClick={() => setQrMode('ip')}
                className={`py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  qrMode === 'ip' ? 'bg-[#FF4B3E] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>사내 Wi-Fi</span>
              </button>
              <button
                onClick={() => setQrMode('local')}
                className={`py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  qrMode === 'local' ? 'bg-[#FF4B3E] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>PC 테스트</span>
              </button>
            </div>

            {/* Live QR Code Box */}
            {(() => {
              const activeBase = qrMode === 'tunnel'
                ? (tunnelUrl || 'https://environments-graphic-arrested-strip.trycloudflare.com')
                : qrMode === 'ip'
                  ? (serverIp ? `http://${serverIp}:3000` : 'http://10.210.115.120:3000')
                  : 'http://localhost:3000';

              const copyLink = (url: string, key: string) => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(url);
                  setCopiedKey(key);
                  setTimeout(() => setCopiedKey(null), 2000);
                }
              };

              return (
                <div className="space-y-4 text-xs">
                  {/* QR Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md inline-block">
                      <QRCodeSVG
                        value={activeBase}
                        size={170}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      📱 스마트폰 카메라로 QR을 스캔하시면 즉시 모바일 화면으로 접속됩니다.
                    </p>
                  </div>

                  {/* Main Domain Box */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="truncate font-mono font-bold text-slate-900 text-xs select-all">
                      {activeBase}
                    </div>
                    <button
                      onClick={() => copyLink(activeBase, 'main')}
                      className="px-3 py-1.5 bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black rounded-lg shrink-0 flex items-center gap-1 shadow-xs transition"
                    >
                      {copiedKey === 'main' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'main' ? '복사됨' : '주소 복사'}</span>
                    </button>
                  </div>

                  {/* Direct Shortcuts */}
                  <div className="space-y-2 pt-1">
                    <span className="font-black text-slate-900 text-xs block">
                      🚀 주요 모바일 페이지 바로가기 & 전송용 링크
                    </span>

                    {/* 1. Work Permit Apply */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:border-[#FF4B3E]/50 transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#FF4B3E] flex items-center justify-center shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">1. 작업허가서 신청서</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{activeBase}/work-permit-apply</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => copyLink(`${activeBase}/work-permit-apply`, 'wp')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                        >
                          {copiedKey === 'wp' ? '복사됨 ✓' : '복사'}
                        </button>
                        <a
                          href={`${activeBase}/work-permit-apply`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                          title="새 창에서 열기"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* 2. Worker Report */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:border-[#FF4B3E]/50 transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <MessageSquareWarning className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">2. 근로자 의견청취·위험제보</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{activeBase}/worker-report</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => copyLink(`${activeBase}/worker-report`, 'wr')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                        >
                          {copiedKey === 'wr' ? '복사됨 ✓' : '복사'}
                        </button>
                        <a
                          href={`${activeBase}/worker-report`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                          title="새 창에서 열기"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* 3. TBM Sign */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:border-[#FF4B3E]/50 transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <PenTool className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">3. TBM 참석자 서명</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{activeBase}/tbm-sign</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => copyLink(`${activeBase}/tbm-sign`, 'tbm')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                        >
                          {copiedKey === 'tbm' ? '복사됨 ✓' : '복사'}
                        </button>
                        <a
                          href={`${activeBase}/tbm-sign`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                          title="새 창에서 열기"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => setShowExternalModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-900 text-xs border border-slate-300 transition"
            >
              닫기
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* 2. Emergency Hotline Modal rendered via React Portal */}
      {mounted && showHotline && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2 text-[#FF4B3E] font-black text-lg">
                <AlertTriangle className="w-5 h-5 text-[#FF4B3E]" />
                <span>제작현장 비상 안전 연락망</span>
              </div>
              <button onClick={() => setShowHotline(false)} className="text-slate-800 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {/* 1. Safety Officer Direct */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <div>
                  <div className="font-black text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-700" />
                    전담 안전관리자 직통
                  </div>
                  <div className="text-xs text-slate-800 font-medium mt-0.5">이상욱 안전관리 책임자 (현장 상주)</div>
                </div>
                <a
                  href="tel:010-6670-3534"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>010-6670-3534</span>
                </a>
              </div>

              {/* 2. Fire Department / Emergency Rescue */}
              <div className="p-3.5 rounded-2xl bg-[#FF4B3E]/10 border border-[#FF4B3E]/30 flex items-center justify-between">
                <div>
                  <div className="font-black text-slate-900">소방서 / 응급구조</div>
                  <div className="text-xs text-slate-800 font-medium mt-0.5">119 안전센터 (화재·구급)</div>
                </div>
                <a
                  href="tel:119"
                  className="px-3.5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs shadow-xs"
                >
                  국번없이 119
                </a>
              </div>

              {/* 3. Police Department */}
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-between">
                <div>
                  <div className="font-black text-slate-900">경찰서 / 치안센터</div>
                  <div className="text-xs text-slate-800 font-medium mt-0.5">112 치안종합상황실</div>
                </div>
                <a
                  href="tel:112"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs shadow-xs"
                >
                  국번없이 112
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowHotline(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-900 text-xs border border-slate-300 transition"
            >
              닫기
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
