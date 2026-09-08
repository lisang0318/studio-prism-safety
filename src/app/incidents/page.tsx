'use client';

import React, { useState } from 'react';
import { AlertTriangle, Plus, X } from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';

export default function IncidentsPage() {
  const { incidents, addIncidentRecord } = useSafety();
  const [showNewModal, setShowNewModal] = useState(false);

  const [type, setType] = useState<'사고' | '아차사고'>('아차사고');
  const [title, setTitle] = useState('');
  const [studioName, setStudioName] = useState('스튜디오 A (탄현 1세트)');
  const [productionName, setProductionName] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [causeAnalysis, setCauseAnalysis] = useState('');
  const [immediateAction, setImmediateAction] = useState('');
  const [preventivePlan, setPreventivePlan] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIncidentRecord({
      type,
      title,
      studioName,
      productionName: productionName || '자체 제작',
      contractorName: contractorName || '스튜디오프리즘',
      occurredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      locationDetails: studioName,
      incidentDescription,
      damageDescription: type === '아차사고' ? '인명/물적 피해 없음 (조기 차단)' : '경미한 물적 손상',
      causeAnalysis,
      immediateAction,
      preventivePlan,
      photos: [],
      severity: '경미',
      status: '조치완료'
    });

    setShowNewModal(false);
    alert('사고/아차사고 보고서가 등록되었습니다.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
            사고 및 아차사고(Near-Miss) 관리
          </h1>
          <p className="text-sm text-slate-800 mt-1">
            중대재해를 사전에 예방하기 위해 촬영 현장에서 발생한 아차사고 사례를 전파하고 재발방지대책을 수립합니다.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>신규 사고/아차사고 등록</span>
        </button>
      </div>

      <div className="space-y-4">
        {incidents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-slate-900">등록된 사고/아차사고 보고서가 없습니다</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              현장에서 발생한 위험 사례나 아차사고를 등록하여 재발방지대책을 공유하세요.
            </p>
          </div>
        ) : (
          incidents.map(inc => (
            <div key={inc.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-black ${
                    inc.type === '사고' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {inc.type}
                  </span>
                  <div>
                    <div className="text-xs font-mono text-sky-600 font-bold">{inc.incidentNumber}</div>
                    <h3 className="text-base font-black text-slate-900">{inc.title}</h3>
                  </div>
                </div>
                <div className="text-xs text-slate-800 font-mono">
                  발생일시: {inc.occurredAt}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block">발생 상황 개요</span>
                  <p className="text-slate-800 leading-relaxed">{inc.incidentDescription}</p>
                  <div className="text-slate-800 text-[11px] pt-2">
                    장소: {inc.studioName} ({inc.contractorName})
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-rose-700 block">원인 분석</span>
                  <p className="text-slate-800 leading-relaxed">{inc.causeAnalysis}</p>
                  <div className="text-slate-800 text-[11px] pt-2">
                    피해 정도: {inc.damageDescription}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-emerald-700 block">재발방지대책</span>
                  <p className="text-emerald-800 leading-relaxed">{inc.preventivePlan}</p>
                  <div className="text-slate-800 text-[11px] pt-2">
                    즉시 조치: {inc.immediateAction}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h2 className="text-lg font-black text-slate-900">사고/아차사고 보고서 작성</h2>
              <button onClick={() => setShowNewModal(false)} className="text-slate-800 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="radio" name="inc_type" checked={type === '아차사고'} onChange={() => setType('아차사고')} />
                  <span>아차사고 (무재해 조기발견)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="radio" name="inc_type" checked={type === '사고'} onChange={() => setType('사고')} />
                  <span>경미 사고</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">사고/아차사고 제목 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 스튜디오 B 조명 스탠드 이동 중 전도 아차사고"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">발생 장소 *</label>
                  <select
                    value={studioName}
                    onChange={e => setStudioName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="스튜디오 A (탄현 1세트)">스튜디오 A (탄현 1세트)</option>
                    <option value="스튜디오 B (탄현 2세트)">스튜디오 B (탄현 2세트)</option>
                    <option value="스튜디오 C (일산 대형세트)">스튜디오 C (일산 대형세트)</option>
                    <option value="야외 오픈세트 (문경)">야외 오픈세트 (문경)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">관련 업체명</label>
                  <input
                    type="text"
                    placeholder="예: (주)파워라이팅시스템"
                    value={contractorName}
                    onChange={e => setContractorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">발생 상황 상세 내용 *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="사고 또는 아차사고가 발생한 경위를 육하원칙에 따라 기록하세요."
                  value={incidentDescription}
                  onChange={e => setIncidentDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-rose-700 mb-1">원인 분석 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 2인 1조 운반 미준수 및 바닥 요철 확인 미흡"
                  value={causeAnalysis}
                  onChange={e => setCauseAnalysis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-700 mb-1">재발방지대책 수립 *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="예: 이동식 조명 전량 높이 1.5m 축소 운반 의무화 및 경고 스티커 부착"
                  value={preventivePlan}
                  onChange={e => setPreventivePlan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20"
                >
                  보고서 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
