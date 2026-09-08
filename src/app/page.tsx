'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  FileCheck2,
  MessageSquareWarning,
  Flame,
  Users2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Plus,
  QrCode,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Tv,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';
import { WorkPermit, PermitStatus } from '@/types';

export default function DashboardPage() {
  const { workPermits, workerOpinions, inspections, approveWorkPermit, programs } = useSafety();
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('전체');

  // Metrics
  const activePermits = workPermits.filter(p => p.status === '작업진행중' || p.status === '승인완료');
  const pendingPermits = workPermits.filter(p => p.status === '승인대기');
  const highRiskPermits = workPermits.filter(p => p.riskLevel === '고위험');
  const unresolvedOpinions = workerOpinions.filter(o => o.status !== '조치완료');

  // Program-Filtered Permits
  const filteredWorkPermits = selectedProgramFilter === '전체'
    ? workPermits
    : workPermits.filter(p => {
        const cleanProg = selectedProgramFilter.replace(/[\[\]\s]/g, '').toLowerCase();
        const cleanPermitProg = p.productionName.replace(/[\[\]\s]/g, '').toLowerCase();
        return cleanProg.includes(cleanPermitProg) || cleanPermitProg.includes(cleanProg);
      });

  const filteredPendingPermits = selectedProgramFilter === '전체'
    ? pendingPermits
    : pendingPermits.filter(p => {
        const cleanProg = selectedProgramFilter.replace(/[\[\]\s]/g, '').toLowerCase();
        const cleanPermitProg = p.productionName.replace(/[\[\]\s]/g, '').toLowerCase();
        return cleanProg.includes(cleanPermitProg) || cleanPermitProg.includes(cleanProg);
      });

  const getStatusBadge = (status: PermitStatus) => {
    switch (status) {
      case '승인완료':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">승인완료</span>;
      case '작업진행중':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FF4B3E]/15 text-[#FF4B3E] border border-[#FF4B3E]/30 animate-pulse">작업진행중</span>;
      case '승인대기':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">승인대기</span>;
      case '작업완료':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">작업완료</span>;
      case '반려':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">반려됨</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#FF4B3E] uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF4B3E] animate-ping"></span>
            스튜디오프리즘 안전관리 센터
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            오늘의 제작현장 안전 현황
          </h1>
          <p className="text-xs text-slate-800 mt-1">
            프로그램별 안전작업허가서 실시간 연계 모니터링 및 근로자 위험제보를 통합 관리합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/programs"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition"
          >
            <Tv className="w-4 h-4 text-[#FF4B3E]" />
            <span>프로그램 관리</span>
          </Link>
          <Link
            href="/work-permits?new=true"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs shadow-md shadow-[#FF4B3E]/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>작업허가서 신규 등록</span>
          </Link>
          <Link
            href="/worker-report"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>모바일 QR 제보</span>
          </Link>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Set Works */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800">금일 가동 세트 작업</span>
            <div className="w-8 h-8 rounded-xl bg-[#FF4B3E]/10 text-[#FF4B3E] border border-[#FF4B3E]/30 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activePermits.length}</span>
            <span className="text-xs text-slate-800">개소 승인·진행중</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-800 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">● 정상 가동</span> 탄현 1·2세트, 일산, 상암
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div className={`bg-white border rounded-3xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition ${
          pendingPermits.length > 0 ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-800">승인 대기 작업허가서</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-800">{pendingPermits.length}</span>
            <span className="text-xs text-amber-700">건 승인 대기중</span>
          </div>
          <div className="mt-3 text-[11px] text-amber-700 font-medium">
            {pendingPermits.length > 0 ? '안전관리자 현장 확인 및 승인 필요' : '모든 작업허가 승인 완료'}
          </div>
        </div>

        {/* Card 3: Unresolved Worker Feedback */}
        <div className={`bg-white border rounded-3xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition ${
          unresolvedOpinions.length > 0 ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#FF4B3E]">근로자 미조치 의견/위험</span>
            <div className="w-8 h-8 rounded-xl bg-[#FF4B3E]/10 text-[#FF4B3E] border border-[#FF4B3E]/30 flex items-center justify-center font-bold">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#FF4B3E]">{unresolvedOpinions.length}</span>
            <span className="text-xs text-[#FF4B3E]/80">건 미완료 제보</span>
          </div>
          <div className="mt-3 text-[11px] text-[#FF4B3E] font-medium">
            {unresolvedOpinions.length > 0 ? '조치 결과 등록 및 피드백 대기' : '모든 현장 제보 조치 완료'}
          </div>
        </div>

        {/* Card 4: High-Risk Special Effects / Rigging */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-orange-600">고위험 특수·리깅 작업</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{highRiskPermits.length}</span>
            <span className="text-xs text-slate-800">건 집중 모니터링</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-800">
            화기특효, 고소리깅, 관객밀집 안전통제
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔗 PROGRAM & WORK PERMIT INTERACTIVE LIVE LINK WIDGET                     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF4B3E] animate-ping"></span>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tv className="w-5 h-5 text-[#FF4B3E]" />
                <span>프로그램별 안전작업허가 실시간 연동 관리</span>
              </h2>
            </div>
            <p className="text-xs text-slate-800 mt-0.5">
              각 프로그램을 클릭하면 해당 프로그램의 허가서 목록과 타임라인이 아래에 실시간으로 필터링 연동됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedProgramFilter !== '전체' && (
              <button
                onClick={() => setSelectedProgramFilter('전체')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#FF4B3E] font-bold text-xs border border-slate-200 transition flex items-center gap-1"
              >
                <span>전체 프로그램 보기</span>
              </button>
            )}
            <Link
              href="/programs"
              className="px-3.5 py-1.5 rounded-xl bg-[#FF4B3E]/10 hover:bg-[#FF4B3E]/20 text-[#FF4B3E] font-bold text-xs flex items-center gap-1.5 transition border border-[#FF4B3E]/30"
            >
              <span>프로그램 관리 바로가기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dynamic Program Grid / Clean Empty State */}
        {programs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
            <Tv className="w-8 h-8 text-slate-700 mx-auto" />
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-800">등록된 프로그램이 없습니다</p>
              <p className="text-xs text-slate-800 max-w-md mx-auto">
                [프로그램 관리] 메뉴에서 프로그램을 등록하시면 이곳에 실시간 허가 연동 카드와 모바일 QR 바로가기 칩이 자동으로 생성됩니다.
              </p>
            </div>
            <Link
              href="/programs"
              className="px-4 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-[#FF4B3E]/25 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>신규 프로그램 등록하기</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {programs.map(prog => {
              const isSelected = selectedProgramFilter === prog.title;
              const cleanProg = prog.title.replace(/[\[\]\s]/g, '').toLowerCase();
              const matchedPermits = workPermits.filter(p => {
                const cleanPermitProg = p.productionName.replace(/[\[\]\s]/g, '').toLowerCase();
                return cleanProg.includes(cleanPermitProg) || cleanPermitProg.includes(cleanProg);
              });
              const activeCount = matchedPermits.filter(p => p.status === '작업진행중' || p.status === '승인완료').length;
              const pendingCount = matchedPermits.filter(p => p.status === '승인대기').length;
              const rejectedCount = matchedPermits.filter(p => p.status === '반려').length;

              return (
                <button
                  key={prog.id}
                  onClick={() => setSelectedProgramFilter(isSelected ? '전체' : prog.title)}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2.5 group hover:scale-[1.02] ${
                    isSelected
                      ? 'bg-[#FF4B3E]/10 border-[#FF4B3E] ring-2 ring-[#FF4B3E] shadow-sm'
                      : pendingCount > 0
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200/90 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        prog.genre === '예능' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        prog.genre === '예능(관객)' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {prog.genre}
                      </span>
                      <span className="text-[9px] font-mono text-slate-800">당월</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 line-clamp-1 group-hover:text-[#FF4B3E] transition">
                      {prog.title}
                    </div>
                    <div className="text-[10px] text-slate-800 mt-0.5 truncate">
                      {prog.mainStudio}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                    <span className="text-slate-800 font-bold">허가 현황:</span>
                    <div>
                      {pendingCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-black flex items-center gap-1 animate-pulse">
                          ⏳ {pendingCount}건 대기
                        </span>
                      ) : activeCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1">
                          ✓ {activeCount}건 승인
                        </span>
                      ) : rejectedCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold">
                          ✕ {rejectedCount}건 반려
                        </span>
                      ) : (
                        <span className="text-slate-700 font-medium">미발행 (-)</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Production Set Safety Timeline */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF4B3E]" />
              <h2 className="text-base font-black text-slate-900">
                {selectedProgramFilter === '전체' ? '실시간 세트별 작업 안전 타임라인' : `${selectedProgramFilter} 작업허가 타임라인`}
              </h2>
              {selectedProgramFilter !== '전체' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF4B3E]/10 text-[#FF4B3E] border border-[#FF4B3E]/30 font-bold">
                  {selectedProgramFilter} 필터 적용중
                </span>
              )}
            </div>
            <p className="text-xs text-slate-800 mt-0.5">
              스튜디오별 작업 스케줄 및 승인 상태를 실시간 관제합니다.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-800">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 승인완료</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF4B3E]"></span> 작업중</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 승인대기</div>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-4">
          {filteredWorkPermits.length === 0 ? (
            <div className="py-8 text-center text-slate-700 text-xs">
              <FileCheck2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600">해당 프로그램의 등록된 작업허가서가 없습니다.</p>
            </div>
          ) : (
            filteredWorkPermits.map(permit => {
              const isHighRisk = permit.riskLevel === '고위험';
              return (
                <div key={permit.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${
                        isHighRisk ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-white text-slate-700 border border-slate-200'
                      }`}>
                        {permit.studioName}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{permit.title}</span>
                          {getStatusBadge(permit.status)}
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FF4B3E]/10 text-[#FF4B3E] font-bold border border-[#FF4B3E]/30">
                            {permit.productionName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-800 mt-0.5">
                          {permit.contractorName} ({permit.managerName}) · 작업인원 {permit.workerCount}명
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/work-permits/${permit.id}`}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#FF4B3E]" />
                        상세·QR
                      </Link>
                      {permit.status === '승인대기' && (
                        <button
                          onClick={() => {
                            approveWorkPermit(permit.id, '이상욱 안전관리 책임자', '이상욱(인)');
                            alert('해당 안전작업허가서가 승인되었습니다.');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          즉시 승인
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar visualizer */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-800 font-mono">
                      <span>시작: {permit.startDate}</span>
                      <span>종료 예정: {permit.endDate}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          permit.status === '작업진행중' ? 'bg-[#FF4B3E] animate-pulse w-3/4' :
                          permit.status === '승인완료' ? 'bg-emerald-600 w-1/2' :
                          permit.status === '승인대기' ? 'bg-amber-500 w-1/4' : 'bg-slate-400 w-full'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Two Column Grid: Pending Permits & Recent Worker Opinions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Approval Permits List */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900">승인 대기 허가서</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  {filteredPendingPermits.length}건
                </span>
              </div>
              <Link href="/work-permits" className="text-xs text-[#FF4B3E] hover:underline flex items-center gap-1 font-bold">
                전체보기 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {filteredPendingPermits.length === 0 ? (
                <div className="py-8 text-center text-slate-700 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="font-bold text-slate-600">승인 대기 중인 허가서가 없습니다.</p>
                </div>
              ) : (
                filteredPendingPermits.map(permit => (
                  <div key={permit.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-white transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-700 font-bold">{permit.permitNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF4B3E]/10 text-[#FF4B3E] font-bold border border-[#FF4B3E]/30">
                          {permit.productionName}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">{permit.title}</div>
                      <div className="text-xs text-slate-800 mt-0.5">{permit.studioName} · {permit.contractorName}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          approveWorkPermit(permit.id, '이상욱 안전관리 책임자', '이상욱(인)');
                          alert('허가서가 승인되었습니다.');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                      >
                        승인
                      </button>
                      <Link
                        href={`/work-permits/${permit.id}`}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold"
                      >
                        검토
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Worker Opinions */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-[#FF4B3E]" />
                <h3 className="text-base font-black text-slate-900">최근 근로자 위험 제보</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200 font-bold">
                  {unresolvedOpinions.length}건 미조치
                </span>
              </div>
              <Link href="/worker-feedback" className="text-xs text-[#FF4B3E] hover:underline flex items-center gap-1 font-bold">
                전체보기 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {workerOpinions.slice(0, 4).map(opinion => (
                <div key={opinion.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-white transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{opinion.authorName || '현장 근로자'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        opinion.status === '조치완료' ? 'bg-emerald-100 text-emerald-800' :
                        opinion.status === '조치중' ? 'bg-blue-100 text-blue-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {opinion.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 line-clamp-1 mt-1 font-medium">{opinion.title}</div>
                    <div className="text-[10px] text-slate-800 mt-0.5">{opinion.studioName} · {opinion.createdAt?.slice(0, 10) || ''}</div>
                  </div>
                  <Link
                    href={`/worker-feedback`}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shrink-0"
                  >
                    조치하기
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
