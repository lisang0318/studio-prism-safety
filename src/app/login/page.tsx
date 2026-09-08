'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Tv,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Radio
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { login, teamAccounts } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        router.push(redirectPath);
      } else {
        setErrorMessage(result.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (err: any) {
      setErrorMessage('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-slate-50 to-rose-50/40 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-rose-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#FF4B3E] animate-pulse"></span>
            <span className="text-[11px] font-black tracking-wide text-slate-800 uppercase">
              STUDIO PRISM SAFETY HUB
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#FF4B3E]" />
            <span>스마트 안전관리 포털</span>
          </h1>

          <p className="text-xs text-slate-800 max-w-xs mx-auto">
            스튜디오프리즘 방송제작 현장 안전관리 통합 시스템에 로그인해 주세요.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">관리자 아이디</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="아이디를 입력하세요 (예: admin)"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-3 text-slate-900 font-medium placeholder-slate-500 focus:bg-white focus:border-[#FF4B3E] focus:outline-none transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">비밀번호</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-slate-900 font-medium placeholder-slate-500 focus:bg-white focus:border-[#FF4B3E] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-800 hover:text-slate-800 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#FF4B3E] focus:ring-[#FF4B3E]"
                />
                <span className="font-medium text-[11px]">로그인 상태 유지</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-sm shadow-md shadow-[#FF4B3E]/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? '로그인 확인 중...' : '로그인하기'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Public QR Link Guide for On-Site Workers / Contractors */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-4 text-center space-y-2 text-xs text-slate-800 shadow-xs">
          <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800">
            <QrCode className="w-4 h-4 text-[#FF4B3E]" />
            <span>현장 제작진 및 협력사용 공개 신청</span>
          </div>
          <p className="text-[11px] text-slate-800 leading-relaxed">
            별도 관리자 로그인 없이 세트장 QR 또는 아래 링크로 즉시 신청 및 제보가 가능합니다.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-bold">
            <Link
              href="/work-permit-apply"
              className="text-[#FF4B3E] hover:underline flex items-center gap-1"
            >
              <span>작업허가 QR신청</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-slate-700">|</span>
            <Link
              href="/worker-report"
              className="text-[#FF4B3E] hover:underline flex items-center gap-1"
            >
              <span>근로자 의견·위험제보</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 text-slate-700 font-bold text-xs">
          스튜디오프리즘 안전관리 포털 로딩중...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
