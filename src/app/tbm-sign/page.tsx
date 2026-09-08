'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Users2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Building,
  Calendar,
  Clock,
  Send,
  FileCheck,
  Info,
  ChevronRight,
  Tv
} from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';
import SignaturePad from '@/components/common/SignaturePad';
import { TBMRecord } from '@/types';

function TBMSignContent() {
  const searchParams = useSearchParams();
  const tbmIdParam = searchParams.get('id') || searchParams.get('sign');

  const { tbmRecords } = useSafety();

  const [selectedTBM, setSelectedTBM] = useState<TBMRecord | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [contact, setContact] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (tbmRecords && tbmRecords.length > 0) {
      if (tbmIdParam) {
        const found = tbmRecords.find(t => t.id === tbmIdParam);
        if (found) {
          setSelectedTBM(found);
          return;
        }
      }
      if (!selectedTBM) {
        setSelectedTBM(tbmRecords[0]);
      }
    }
  }, [tbmRecords, tbmIdParam, selectedTBM]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTBM) {
      alert('진행 중인 TBM 회의를 선택해 주세요.');
      return;
    }
    if (!attendeeName.trim()) {
      alert('참석자 성명을 입력해 주세요.');
      return;
    }
    if (!signature) {
      alert('자필 전자서명을 완료해 주세요.');
      return;
    }
    if (!agreed) {
      alert('안전수칙 숙지 및 준수 서약에 동의해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'attend_tbm',
          payload: {
            id: selectedTBM.id,
            attendeeName: attendeeName.trim(),
            affiliation: affiliation.trim(),
            signature
          }
        })
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert('서명 등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch (err) {
      console.error(err);
      alert('서버 연결 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && selectedTBM) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
              TBM 서명 완료
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              안전미팅 참석 서명이 완료되었습니다!
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              <b>{selectedTBM.workName}</b> 현장 안전회의 참석 서약이 정상적으로 등록되었습니다.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">참석자</span>
              <span className="font-bold text-slate-900">{attendeeName} {affiliation ? `(${affiliation})` : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">촬영 장소</span>
              <span className="font-bold text-slate-800">{selectedTBM.studioName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">제작진(주재자)</span>
              <span className="font-bold text-slate-800">{selectedTBM.leaderName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">서명 일시</span>
              <span className="font-mono font-bold text-[#FF4B3E]">
                {new Date().toLocaleDateString('ko-KR')} {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] text-[#FF4B3E] font-medium leading-relaxed">
            🛡️ 오늘도 개인보호구(안전모·안전화 등)를 철저히 착용하고 안전수칙을 준수해 주세요.
          </div>

          <button
            onClick={() => {
              setIsSuccess(false);
              setAttendeeName('');
              setAffiliation('');
              setContact('');
              setSignature(null);
              setAgreed(false);
            }}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-200"
          >
            다른 참석자 서명하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-6 px-4 sm:px-6 max-w-lg mx-auto">
      {/* Header Branding */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#FF4B3E] border border-rose-200 text-[11px] font-black">
          <Users2 className="w-3.5 h-3.5" />
          <span>STUDIO PRISM · 현장 작업 전 5분 안전회의</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          모바일 TBM 참석 서명
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          촬영 및 작업 시작 전 위험요인을 확인하고 자필 서명을 완료해 주세요.
        </p>
      </div>

      {/* TBM Selector if multiple meetings exist */}
      {tbmRecords && tbmRecords.length > 1 && (
        <div className="mb-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-600">참석 대상 TBM 회의 선택</label>
          <select
            value={selectedTBM?.id || ''}
            onChange={e => {
              const found = tbmRecords.find(t => t.id === e.target.value);
              if (found) setSelectedTBM(found);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#FF4B3E] focus:outline-none"
          >
            {tbmRecords.map(t => (
              <option key={t.id} value={t.id}>
                [{t.workName}] {t.studioName} ({t.leaderName} 주재)
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedTBM ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TBM Meeting Brief Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <span className="font-mono text-[10px] text-[#FF4B3E] font-bold">{selectedTBM.tbmNumber}</span>
                <h2 className="text-base font-black text-slate-900 mt-0.5">{selectedTBM.workName}</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {selectedTBM.date}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">촬영 장소</span>
                <span className="font-bold text-slate-800 truncate block">{selectedTBM.studioName}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">제작진(주재자)</span>
                <span className="font-bold text-slate-800 truncate block">{selectedTBM.leaderName}</span>
              </div>
            </div>

            {/* Key Hazards Alert Box */}
            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>금일 핵심 유해·위험요인</span>
              </div>
              <p className="text-[11px] text-rose-950 leading-relaxed font-medium pl-5">
                {selectedTBM.keyHazards.join(', ')}
              </p>
            </div>

            {/* Safety Instructions Box */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>작업자 필수 안전 전달사항</span>
              </div>
              <p className="text-[11px] text-emerald-950 leading-relaxed font-medium pl-5">
                {selectedTBM.safetyInstructions.join(', ')}
              </p>
            </div>
          </div>

          {/* Attendee Input Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3.5 text-xs">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Users2 className="w-4 h-4 text-[#FF4B3E]" />
              <span>참석자 인적사항</span>
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">참석자 성명 *</label>
              <input
                type="text"
                required
                placeholder="성명을 입력하세요 (예: 홍길동)"
                value={attendeeName}
                onChange={e => setAttendeeName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-xs focus:border-[#FF4B3E] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">소속 / 팀명</label>
                <input
                  type="text"
                  placeholder="예: 세트팀 / 조명팀"
                  value={affiliation}
                  onChange={e => setAffiliation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:border-[#FF4B3E] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">연락처</label>
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:border-[#FF4B3E] focus:outline-none"
                />
              </div>
            </div>

            {/* Signature Pad */}
            <div className="pt-1">
              <SignaturePad
                title="참석자 자필 전자서명 *"
                placeholderText="여기에 손가락이나 펜으로 직접 서명해 주세요"
                height={120}
                onChange={setSignature}
              />
            </div>

            {/* Safety Pledge Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer select-none hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#FF4B3E] focus:ring-[#FF4B3E] border-slate-300"
              />
              <span className="text-[11px] text-slate-700 leading-relaxed">
                <b className="text-slate-900 font-bold">[필수]</b> 금일 TBM 안전회의의 유해·위험요인 및 안전 전달사항을 숙지하였으며, 보호구 착용 및 안전수칙을 성실히 준수할 것을 서약합니다.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-sm shadow-lg shadow-[#FF4B3E]/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? '서명 저장 중...' : 'TBM 참석 서명 완료'}</span>
          </button>
        </form>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-2 shadow-sm">
          <p className="text-xs text-slate-500">등록된 TBM 일지가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default function TBMSignPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">로딩 중...</div>}>
      <TBMSignContent />
    </Suspense>
  );
}
