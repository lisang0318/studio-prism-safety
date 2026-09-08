'use client';

import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  X,
  Edit3,
  Trash2,
  Printer,
  Search,
  Building,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Tv
} from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';
import { TBMRecord } from '@/types';

export default function TBMPage() {
  const { tbmRecords, addTBMRecord, updateTBMRecord, deleteTBMRecord, programs } = useSafety();

  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTBM, setEditingTBM] = useState<TBMRecord | null>(null);

  // Form States
  const [studioName, setStudioName] = useState('');
  const [workName, setWorkName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [attendeeNames, setAttendeeNames] = useState('');
  const [keyHazards, setKeyHazards] = useState('');
  const [safetyInstructions, setSafetyInstructions] = useState('');

  // Print Preview Modal State
  const [printingTBM, setPrintingTBM] = useState<TBMRecord | null>(null);

  const handleOpenAddModal = () => {
    setEditingTBM(null);
    setStudioName('');
    setWorkName('');
    setLeaderName('');
    setAttendeeCount(1);
    setAttendeeNames('');
    setKeyHazards('');
    setSafetyInstructions('');
    setShowModal(true);
  };

  const handleOpenEditModal = (tbm: TBMRecord) => {
    setEditingTBM(tbm);
    setStudioName(tbm.studioName);
    setWorkName(tbm.workName);
    setLeaderName(tbm.leaderName);
    setAttendeeCount(tbm.workerCount || tbm.attendees.length || 1);
    setAttendeeNames(tbm.attendees.join(', '));
    setKeyHazards(tbm.keyHazards.join(', '));
    setSafetyInstructions(tbm.safetyInstructions.join(', '));
    setShowModal(true);
  };

  const handleDelete = (id: string, programName: string) => {
    if (confirm(`'${programName}' TBM 일지를 삭제하시겠습니까?`)) {
      deleteTBMRecord(id);
      alert('TBM 일지가 삭제되었습니다.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workName.trim()) {
      alert('프로그램명을 입력해 주세요.');
      return;
    }
    if (!studioName.trim()) {
      alert('촬영 장소를 입력해 주세요.');
      return;
    }
    if (!leaderName.trim()) {
      alert('제작진 성명을 입력해 주세요.');
      return;
    }

    const attendeesArray = attendeeNames.split(',').map(s => s.trim()).filter(Boolean);
    const hazardsArray = keyHazards.split(',').map(s => s.trim()).filter(Boolean);
    const instructionsArray = safetyInstructions.split(',').map(s => s.trim()).filter(Boolean);

    if (editingTBM) {
      updateTBMRecord(editingTBM.id, {
        studioName: studioName.trim(),
        workName: workName.trim(),
        contractorName: '제작진 직영',
        leaderName: leaderName.trim(),
        workerCount: Number(attendeeCount) || attendeesArray.length || 1,
        attendees: attendeesArray,
        keyHazards: hazardsArray,
        safetyInstructions: instructionsArray
      });
      alert('TBM 일지가 성공적으로 수정되었습니다.');
    } else {
      addTBMRecord({
        studioName: studioName.trim(),
        workName: workName.trim(),
        contractorName: '제작진 직영',
        leaderName: leaderName.trim(),
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        workerCount: Number(attendeeCount) || attendeesArray.length || 1,
        attendees: attendeesArray,
        keyHazards: hazardsArray,
        safetyInstructions: instructionsArray,
        photos: [],
        signed: true
      });
      alert('작업 전 안전회의(TBM) 일지가 성공적으로 등록되었습니다.');
    }

    setShowModal(false);
  };

  const filteredRecords = tbmRecords.filter(tbm =>
    tbm.workName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tbm.studioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tbm.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF4B3E] mb-1">
            <Users2 className="w-4 h-4 text-[#FF4B3E]" />
            <span>STUDIO PRISM · 현장 안전회의 관리</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            작업 전 5분 안전미팅 (TBM) 일지
          </h1>
          <p className="text-xs text-slate-800 mt-1">
            촬영 및 세트 작업 시작 전 제작진과 현장 인원이 모여 위험요인과 안전수칙을 공유하고 서명한 TBM 일지를 관리합니다.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs shadow-md shadow-[#FF4B3E]/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>신규 TBM 일지 작성</span>
        </button>
      </div>

      {/* Action Bar (Search & Counter) */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="프로그램명, 촬영장소, 제작진 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-slate-900 placeholder-slate-500"
          />
        </div>

        <div className="text-slate-800 text-xs font-bold flex items-center gap-2 self-end sm:self-auto">
          <span>전체 TBM 기록: <b className="text-[#FF4B3E] font-mono">{tbmRecords.length}</b>건</span>
        </div>
      </div>

      {/* TBM Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <Users2 className="w-12 h-12 text-slate-800 mx-auto" />
          <h3 className="text-base font-black text-slate-900">등록된 TBM 일지가 없습니다</h3>
          <p className="text-xs text-slate-800 max-w-sm mx-auto">
            상단의 [신규 TBM 일지 작성] 버튼을 눌러 작업 전 안전회의 일지를 등록해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRecords.map(tbm => (
            <div
              key={tbm.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Card Top */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-200 gap-3">
                  <div>
                    <span className="font-mono text-xs text-[#FF4B3E] font-bold">{tbm.tbmNumber}</span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{tbm.workName}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      서명완료
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-3 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-800 block text-[11px]">촬영 장소</span>
                    <span className="font-bold text-slate-900 truncate block">{tbm.studioName}</span>
                  </div>
                  <div>
                    <span className="text-slate-800 block text-[11px]">제작진</span>
                    <span className="font-bold text-slate-900 truncate block">{tbm.leaderName}</span>
                  </div>
                  <div>
                    <span className="text-slate-800 block text-[11px]">실시 일시</span>
                    <span className="font-mono font-bold text-slate-700 truncate block">{tbm.date}</span>
                  </div>
                </div>

                {/* Key hazards & instructions */}
                <div className="space-y-2 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-rose-700 font-medium">
                    <b className="font-bold">● 주요 위험요인:</b> {tbm.keyHazards.join(', ')}
                  </div>
                  <div className="text-emerald-700 font-medium">
                    <b className="font-bold">● 안전 전달사항:</b> {tbm.safetyInstructions.join(', ')}
                  </div>
                </div>

                <div className="text-[11px] text-slate-800">
                  <span className="font-bold text-slate-800">참석자 서명부: </span>
                  {tbm.attendees.join(', ')} ({tbm.workerCount}명)
                </div>
              </div>

              {/* Action Buttons (수정 / 삭제 / 인쇄) */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                <button
                  onClick={() => setPrintingTBM(tbm)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition border border-slate-200"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FF4B3E]" />
                  <span>인쇄 / PDF</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(tbm)}
                    className="px-3 py-1.5 rounded-xl bg-[#FF4B3E]/15 hover:bg-[#FF4B3E] hover:text-white text-[#FF4B3E] font-bold flex items-center gap-1 transition border border-[#FF4B3E]/30"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>수정</span>
                  </button>
                  <button
                    onClick={() => handleDelete(tbm.id, tbm.workName)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-black text-rose-700 font-bold flex items-center gap-1 transition border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>삭제</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TBM Create / Edit Modal                                            */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 text-xs overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users2 className="w-5 h-5 text-[#FF4B3E]" />
                <span>{editingTBM ? 'TBM 안전회의 일지 수정' : '신규 TBM 일지 작성'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-800 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Program Name with Dynamic Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">프로그램명 *</label>
                  {programs && programs.length > 0 && (
                    <span className="text-[10px] text-[#FF4B3E] font-bold">등록 프로그램 빠른 선택</span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="프로그램명을 입력하세요 (예: [골 때리는 그녀들], [런닝맨], [우리들의 발라드], [동상이몽])"
                  value={workName}
                  onChange={e => setWorkName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-xs"
                />
                {programs && programs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {programs.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setWorkName(p.title)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          workName === p.title
                            ? 'bg-[#FF4B3E] border-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Text Input: Shooting Location */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">촬영 장소 (세트장명·위치) *</label>
                <input
                  type="text"
                  required
                  placeholder="촬영 장소를 입력하세요 (예: 강화 야외경기장, 도심 로케이션, 상암 메인스튜디오, 탄현 세트장)"
                  value={studioName}
                  onChange={e => setStudioName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs"
                />
              </div>

              {/* Production Crew (TBM Leader) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">제작진 (TBM 주재자) *</label>
                <input
                  type="text"
                  required
                  placeholder="제작진 성명을 입력하세요 (예: 홍길동 책임PD / 김철수 조연출)"
                  value={leaderName}
                  onChange={e => setLeaderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">참석 인원수 (명)</label>
                <input
                  type="number"
                  min={1}
                  value={attendeeCount}
                  onChange={e => setAttendeeCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">참석자 서명 명단 (쉼표로 구분) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="참석자 성명을 쉼표로 구분하여 입력하세요 (예: 홍길동, 김철수, 이영진, 박태환...)"
                  value={attendeeNames}
                  onChange={e => setAttendeeNames(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-rose-700 mb-1">금일 핵심 유해·위험요인 *</label>
                <input
                  type="text"
                  required
                  placeholder="금일 유해·위험요인을 입력하세요 (예: 야외 폭염 온열질환, 선수 충돌 위험, 도로점용 교통사고, 바닥 전선 걸림)"
                  value={keyHazards}
                  onChange={e => setKeyHazards(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-700 mb-1">작업자 필수 안전 전달사항 *</label>
                <input
                  type="text"
                  required
                  placeholder="작업자 필수 안전 전달사항을 입력하세요 (예: 펜스 안전매트 확인, 케이블 몰드 매립, 충분한 수분 섭취, 구급차 상시대기)"
                  value={safetyInstructions}
                  onChange={e => setSafetyInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black shadow-md shadow-[#FF4B3E]/30"
                >
                  {editingTBM ? '수정사항 저장' : 'TBM 일지 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Printable A4 TBM Document View                                     */}
      {/* ========================================================================= */}
      {printingTBM && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-6 my-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF4B3E]" />
                <span>TBM 안전회의 일지 A4 양식</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>인쇄 / PDF 저장</span>
                </button>
                <button onClick={() => setPrintingTBM(null)} className="p-1.5 text-slate-800 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Sheet View */}
            <div className="flex-1 overflow-y-auto bg-white text-slate-900 rounded-2xl p-8 border border-slate-200 text-xs space-y-4">
              <div className="text-center pb-3 border-b-2 border-slate-900">
                <div className="text-[10px] font-black tracking-widest text-slate-800 uppercase">STUDIO PRISM TBM RECORD</div>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">작업 전 5분 안전회의 (TBM) 일지</h2>
                <div className="text-xs font-mono font-bold text-blue-800 mt-1">
                  일지번호: {printingTBM.tbmNumber} | 실시일시: {printingTBM.date} {printingTBM.time}
                </div>
              </div>

              <table className="w-full text-xs text-left border border-slate-400">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">프로그램명</th>
                    <td className="p-2.5 font-black text-slate-900" colSpan={3}>{printingTBM.workName}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">촬영 장소</th>
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">{printingTBM.studioName}</td>
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-24 border-r border-slate-300">제작진</th>
                    <td className="p-2.5 font-bold text-slate-900">{printingTBM.leaderName}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">참석 인원</th>
                    <td className="p-2.5 font-bold text-slate-900" colSpan={3}>{printingTBM.workerCount}명</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-rose-50 p-2.5 font-bold text-rose-800 w-28 border-r border-slate-300">주요 위험요인</th>
                    <td className="p-2.5 font-medium text-rose-950" colSpan={3}>{printingTBM.keyHazards.join(', ')}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-emerald-50 p-2.5 font-bold text-emerald-800 w-28 border-r border-slate-300">안전 지시사항</th>
                    <td className="p-2.5 font-medium text-emerald-950" colSpan={3}>{printingTBM.safetyInstructions.join(', ')}</td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">참석자 서명부</th>
                    <td className="p-2.5 text-[11px] text-slate-800 leading-relaxed" colSpan={3}>
                      {printingTBM.attendees.join(', ')} (전원 안전회의 서명 완료)
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-3 border-t border-slate-300 text-center text-[10px] text-slate-800 font-bold">
                스튜디오프리즘 안전관리단 | 안전보건 총괄책임: 이상욱 (010-6670-3534)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
