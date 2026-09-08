'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  HardHat,
  PhoneCall,
  MessageSquareWarning,
  Building,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';

export default function QRPermitPublicView() {
  const params = useParams();
  const { workPermits } = useSafety();
  const permitId = params.id as string;
  const permit = workPermits.find(p => p.id === permitId);

  if (!permit) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
          <AlertTriangle className="w-12 h-12 text-[#FF4B3E] mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">허가서 정보를 찾을 수 없습니다</h2>
          <p className="text-xs text-slate-600">
            만료되었거나 유효하지 않은 안전작업허가 QR 코드입니다. 현장 안전관리자에게 문의해 주세요.
          </p>
        </div>
      </div>
    );
  }

  const isHighRisk = permit.riskLevel === '고위험';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden my-4">
        {/* Top Header (Studio Prism Red Brand Header) */}
        <div className="p-6 bg-white border-b border-slate-200 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#FF4B3E] border border-rose-200 text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            스튜디오프리즘 공식 인증 허가서
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{permit.title}</h1>
          <div className="text-xs font-mono text-[#FF4B3E] font-bold mt-1">{permit.permitNumber}</div>
        </div>

        {/* Verification Status */}
        <div className="p-6 space-y-5 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-500">안전관리 승인 상태</div>
                <div className="text-base font-black text-emerald-700">
                  {permit.status} (작업 적합)
                </div>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-600 font-medium">
              <div>승인자: {permit.safetyOfficerName || '이상욱 안전관리 책임자'}</div>
              <div>승인일시: {permit.approvedAt || permit.createdAt}</div>
            </div>
          </div>

          {/* Key Set Information */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-600 font-bold">작업 장소</span>
              <span className="font-black text-slate-900">{permit.studioName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-600 font-bold">작품 / 프로그램</span>
              <span className="font-bold text-slate-900">{permit.productionName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-600 font-bold">작업 시공업체</span>
              <span className="font-bold text-slate-900">{permit.contractorName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-600 font-bold">작업 유형</span>
              <span className="font-bold text-[#FF4B3E] flex items-center gap-1">
                {isHighRisk && <Flame className="w-3.5 h-3.5 text-rose-600" />}
                {permit.workType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-bold">작업 허가 시간</span>
              <span className="font-mono font-bold text-slate-900 text-[11px]">
                {permit.startDate} ~ {permit.endDate.slice(11)}
              </span>
            </div>
          </div>

          {/* Mandatory PPE Section */}
          <div>
            <div className="text-xs font-black text-slate-800 mb-2 flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-[#FF4B3E]" />
              현장 필수 착용 보호구
            </div>
            <div className="flex flex-wrap gap-2">
              {permit.requiredPPE.map((ppe, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                  ✓ {ppe}
                </span>
              ))}
            </div>
          </div>

          {/* Safety Rules */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-[11px] space-y-1.5 text-rose-950 font-medium">
            <div className="font-black text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              작업장 필수 준수 수칙
            </div>
            <div>1. 작업 전 관리감독자 및 신호수의 지시를 따르십시오.</div>
            <div>2. 안전모 턱끈 체결 및 고소작업 시 안전대 생명줄을 이중 체결하십시오.</div>
            <div>3. 위험 상황 발생 시 즉시 작업을 중지하고 안전관리자에게 연락하십시오.</div>
          </div>

          {/* Field Reporting CTA */}
          <Link
            href={`/worker-report?studio=${encodeURIComponent(permit.studioName)}&work=${encodeURIComponent(permit.title)}`}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-sm shadow-lg shadow-[#FF4B3E]/30 transition"
          >
            <MessageSquareWarning className="w-5 h-5" />
            <span>이 현장 위험요인 / 안전 건의 신고하기</span>
          </Link>

          {/* Emergency Hotline */}
          <div className="pt-2 text-center text-slate-500 text-[10px]">
            <div>이상욱 안전관리 책임자: 010-6670-3534</div>
            <div className="font-bold text-slate-700 mt-0.5">스튜디오프리즘 제작사업부문</div>
          </div>
        </div>
      </div>
    </div>
  );
}
