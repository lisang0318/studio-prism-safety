'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';

export default function ContractorsPage() {
  const { contractors } = useSafety();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-blue-500" />
            외주 제작 협력업체 안전관리
          </h1>
          <p className="text-sm text-slate-800 mt-1">
            무대미술, 조명, 특수효과, 세트철거 등 협력업체별 안전서류 제출 현황, 안전점수 및 작업 이력을 관리합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {contractors.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-slate-900">등록된 협력업체가 없습니다</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              세트 제작 및 특수효과 협력업체 정보를 등록하고 안전 평가를 관리하세요.
            </p>
          </div>
        ) : (
          contractors.map(con => (
            <div key={con.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-sky-600">[{con.workCategory}]</span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{con.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-800 block">안전평가 점수</span>
                  <span className="text-base font-black text-emerald-700">{con.safetyScore}점</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-slate-800 block">사업자등록번호</span>
                  <span className="font-mono text-slate-700">{con.businessNumber}</span>
                </div>
                <div>
                  <span className="text-slate-800 block">대표자</span>
                  <span className="text-slate-700 font-bold">{con.ceoName}</span>
                </div>
                <div>
                  <span className="text-slate-800 block">안전책임자 / 연락처</span>
                  <span className="text-slate-800 font-bold">{con.managerName} ({con.managerPhone})</span>
                </div>
                <div>
                  <span className="text-slate-800 block">안전서류 제출 여부</span>
                  <span className={`font-bold ${con.safetyDocSubmitted ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {con.safetyDocSubmitted ? '✓ 법정 안전서류 완비' : '미제출 (보완요구)'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs font-medium text-slate-800">
                <span>총 누적 작업허가: <strong className="text-slate-900">{con.totalPermitCount}건</strong></span>
                <span>사고 발생 이력: <strong className={con.incidentCount > 0 ? 'text-amber-700' : 'text-emerald-700'}>{con.incidentCount}건</strong></span>
              </div>

              {con.notes && (
                <p className="text-xs text-slate-800 italic">
                  * {con.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
