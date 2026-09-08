'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Tv,
  Film,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Building,
  Users,
  Clock,
  AlertTriangle,
  FileCheck2,
  Volume2,
  ExternalLink,
  ChevronRight,
  Edit3,
  Trash2,
  X,
  Calendar,
  CheckCircle2,
  FileText,
  Printer,
  Download,
  Check,
  Flame,
  HardHat,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';
import { ProgramItem, MonthlyPermit } from '@/types';

export default function ProgramsPage() {
  const {
    programs,
    workPermits,
    addProgram,
    updateProgram,
    deleteProgram,
    updateProgramMonthPermit
  } = useSafety();

  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('전체');

  // 1. Program CRUD Modal State
  const [showProgModal, setShowProgModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formGenre, setFormGenre] = useState<'예능' | '예능(관객)' | '콘서트'>('예능');
  const [formStatus, setFormStatus] = useState<'제작중' | '기획중' | '종영'>('제작중');
  const [formMainStudio, setFormMainStudio] = useState('');
  const [formPd, setFormPd] = useState('');
  const [formSafetyOfficer, setFormSafetyOfficer] = useState('이상욱 안전관리 책임자');
  const [formRiskRating, setFormRiskRating] = useState('고위험 (화기·폭파·고소)');

  // 2. Cell / Monthly Permit Edit Modal State
  const [selectedCell, setSelectedCell] = useState<{ progId: string; progTitle: string; permit: MonthlyPermit } | null>(null);
  const [cellTitle, setCellTitle] = useState('');
  const [cellWorkType, setCellWorkType] = useState('고소작업');
  const [cellStatus, setCellStatus] = useState<'승인완료' | '진행중' | '승인대기' | '예정' | '미발행' | '반려'>('승인완료');
  const [cellDate, setCellDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cellOfficer, setCellOfficer] = useState('이상욱 안전관리 책임자');

  // 3. PDF Matrix Modal
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Dynamic monthly permit lookup that checks registered workPermits first
  const getDynamicMonthlyPermit = (prog: ProgramItem, month: number): MonthlyPermit => {
    const cleanProg = prog.title.replace(/[\[\]\s]/g, '').toLowerCase();
    const matchingPermits = (workPermits || []).filter(p => {
      if (!p.productionName) return false;
      const cleanP = p.productionName.replace(/[\[\]\s]/g, '').toLowerCase();
      const isMatch = cleanP.includes(cleanProg) || cleanProg.includes(cleanP);
      if (!isMatch) return false;
      const pDate = p.startDate ? new Date(p.startDate) : new Date(p.createdAt);
      return (pDate.getMonth() + 1) === month;
    });

    if (matchingPermits.length > 0) {
      const p = matchingPermits[0];
      return {
        month,
        monthLabel: `${month}월`,
        permitTitle: p.title,
        permitNumber: p.permitNumber,
        workType: p.workType,
        status: p.status === '승인완료' ? '승인완료' : p.status === '반려' ? '반려' : p.status === '작업진행중' ? '진행중' : '승인대기',
        officer: p.safetyOfficerName || '이상욱 안전관리 책임자',
        date: p.startDate?.slice(0, 10) || p.createdAt?.slice(0, 10)
      };
    }

    const manual = prog.monthlyPermits?.find(m => m.month === month);
    return manual || { month, monthLabel: `${month}월`, status: '미발행' };
  };

  // Handlers for Program CRUD
  const handleOpenAddProgram = () => {
    setEditingProgram(null);
    setFormTitle('');
    setFormGenre('예능');
    setFormStatus('제작중');
    setFormMainStudio('');
    setFormPd('');
    setFormSafetyOfficer('이상욱 안전관리 책임자');
    setFormRiskRating('고위험 (화기·폭파·고소)');
    setShowProgModal(true);
  };

  const handleOpenEditProgram = (prog: ProgramItem) => {
    setEditingProgram(prog);
    setFormTitle(prog.title);
    setFormGenre(prog.genre);
    setFormStatus(prog.status);
    setFormMainStudio(prog.mainStudio);
    setFormPd(prog.pd);
    setFormSafetyOfficer(prog.safetyOfficer);
    setFormRiskRating(prog.riskRating);
    setShowProgModal(true);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('프로그램명을 입력해 주세요.');
      return;
    }

    if (editingProgram) {
      updateProgram(editingProgram.id, {
        title: formTitle.trim(),
        genre: formGenre,
        status: formStatus,
        mainStudio: formMainStudio.trim(),
        pd: formPd.trim(),
        safetyOfficer: formSafetyOfficer.trim(),
        riskRating: formRiskRating.trim()
      });
      alert('프로그램 정보가 수정되었습니다.');
    } else {
      addProgram({
        title: formTitle.trim(),
        genre: formGenre,
        status: formStatus,
        mainStudio: formMainStudio.trim() || '탄현 1세트',
        pd: formPd.trim() || '담당 PD',
        safetyOfficer: formSafetyOfficer.trim() || '이상욱 안전관리 책임자',
        riskRating: formRiskRating.trim() || '보통 (일반 세트공사)'
      });
      alert('새 프로그램이 등록되었습니다. 12개월 매트릭스와 모바일 QR 신청화면에 자동 연동됩니다.');
    }
    setShowProgModal(false);
  };

  const handleDeleteProgram = (id: string, title: string) => {
    if (confirm(`'${title}' 프로그램을 삭제하시겠습니까? 연결된 연간 매트릭스 데이터도 함께 정리됩니다.`)) {
      deleteProgram(id);
    }
  };

  // Handlers for Matrix Cell Edit
  const handleOpenCellEdit = (progId: string, progTitle: string, permit: MonthlyPermit) => {
    setSelectedCell({ progId, progTitle, permit });
    setCellTitle(permit.permitTitle || `${permit.month}월 세트 안전작업허가`);
    setCellWorkType(permit.workType || '고소작업');
    setCellStatus(permit.status);
    setCellDate(permit.date || new Date().toISOString().slice(0, 10));
    setCellOfficer(permit.officer || '이상욱 안전관리 책임자');
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;

    updateProgramMonthPermit(selectedCell.progId, selectedCell.permit.month, {
      status: cellStatus,
      permitTitle: cellTitle.trim(),
      workType: cellWorkType,
      date: cellDate,
      officer: cellOfficer
    });

    alert(`${selectedCell.progTitle} ${selectedCell.permit.monthLabel} 작업허가 상태가 업데이트되었습니다.`);
    setSelectedCell(null);
  };

  // Filter Logic
  const filteredPrograms = programs.filter(prog => {
    const matchesSearch = prog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prog.mainStudio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prog.pd.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter === '전체' || prog.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  // KPI Calculations (combining matrix and active workPermits)
  let totalIssuedCount = 0;
  let approvedCount = 0;
  let pendingOrActiveCount = 0;
  let rejectedCount = 0;

  programs.forEach(prog => {
    Array.from({ length: 12 }, (_, i) => i + 1).forEach(m => {
      const permit = getDynamicMonthlyPermit(prog, m);
      if (permit.status !== '미발행') totalIssuedCount++;
      if (permit.status === '승인완료') approvedCount++;
      if (permit.status === '승인대기' || permit.status === '진행중') pendingOrActiveCount++;
      if (permit.status === '반려') rejectedCount++;
    });
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF4B3E] mb-1">
            <Tv className="w-4 h-4 text-[#FF4B3E]" />
            <span>STUDIO PRISM · 방송제작 안전관리 시스템</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            프로그램별 월간 안전작업허가서 연간 통합 매트릭스
          </h1>
          <p className="text-xs text-slate-800 mt-1">
            프로그램을 등록하면 모바일 QR 신청화면에 바로가기 칩이 자동으로 생성 및 연동됩니다.
          </p>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 전체 허가서 현황 */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-800 font-bold">전체 허가서 현황</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalIssuedCount}건</div>
            <span className="text-[10px] text-[#FF4B3E] font-bold block">연간 발급 누적</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FF4B3E]/10 text-[#FF4B3E] flex items-center justify-center font-black">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: 승인 완료 */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-800 font-bold">승인 완료</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{approvedCount}건</div>
            <span className="text-[10px] text-emerald-600 font-bold block">안전관리자 결재 완료</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: 승인 대기 / 진행중 */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-800 font-bold">승인 대기 / 진행중</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">{pendingOrActiveCount}건</div>
            <span className="text-[10px] text-amber-600 font-bold block">당월 집중 안전관리</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: 반려 / 시정명령 */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-800 font-bold">반려 / 시정명령</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-600">{rejectedCount}건</div>
            <span className="text-[10px] text-rose-600 font-bold block">현장 위험요인 보완</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Bar (Search & Filter & Buttons) */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="프로그램명 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-slate-900 placeholder-slate-500 focus:bg-white"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-700" />
            <select
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
            >
              <option value="전체">전체 장르</option>
              <option value="예능">예능</option>
              <option value="예능(관객)">예능(관객)</option>
              <option value="콘서트">콘서트</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* PDF Matrix Export */}
          {programs.length > 0 && (
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
            >
              <Download className="w-4 h-4 text-[#FF4B3E]" />
              <span>일괄 PDF 다운로드</span>
            </button>
          )}

          {/* Add Program Button */}
          <button
            onClick={handleOpenAddProgram}
            className="px-4 py-2.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#FF4B3E]/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ 신규 프로그램 등록</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12-MONTH INTERACTIVE ANNUAL MATRIX TABLE / CLEAN EMPTY STATE               */}
      {/* ========================================================================= */}
      {programs.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-[#FF4B3E]/10 text-[#FF4B3E] mx-auto flex items-center justify-center">
            <Tv className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">등록된 방송 프로그램이 없습니다</h3>
            <p className="text-xs text-slate-800 max-w-md mx-auto leading-relaxed">
              상단의 <b className="text-slate-800">[+ 신규 프로그램 등록]</b> 버튼을 눌러 프로그램을 등록해 보세요.
              등록된 프로그램은 12개월 연간 허가서 매트릭스 및 모바일 QR 신청화면에 바로가기 칩으로 자동 연동됩니다.
            </p>
          </div>
          <button
            onClick={handleOpenAddProgram}
            className="px-5 py-2.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-[#FF4B3E]/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>첫 번째 프로그램 등록하기</span>
          </button>
        </div>
      ) : (
        /* Matrix Table */
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="text-xs text-slate-800 flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">2026년 연간 작업허가서 매트릭스 현황</span>
              <span>(각 월별 카드를 클릭하면 상세 확인 및 허가서 수정이 가능합니다)</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 승인완료
              </span>
              <span className="flex items-center gap-1 text-[#FF4B3E]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF4B3E] animate-pulse"></span> 진행중
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 승인대기
              </span>
              <span className="flex items-center gap-1 text-purple-600">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> 예정
              </span>
            </div>
          </div>

          {/* Scrollable Matrix Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
              {/* Table Header: 1월 to 12월 */}
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-4 w-56 sticky left-0 bg-slate-100 z-10 border-r border-slate-200 text-center">
                    프로그램
                  </th>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = i + 1;
                    const currentSystemMonth = new Date().getMonth() + 1;
                    const isCurrentMonth = m === currentSystemMonth;
                    return (
                      <th
                        key={m}
                        className={`p-3 text-center border-r border-slate-200 ${
                          isCurrentMonth ? 'bg-[#FF4B3E]/10 text-[#FF4B3E] font-black' : ''
                        }`}
                      >
                        <span>{m}월</span>
                        {isCurrentMonth && (
                          <span className="block text-[9px] text-[#FF4B3E] font-bold mt-0.5">
                            (당월)
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100">
                {filteredPrograms.map(prog => (
                  <tr key={prog.id} className="hover:bg-slate-50 transition">
                    {/* Sticky Program Header Cell */}
                    <td className="p-4 sticky left-0 bg-white border-r border-slate-200 z-10 space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">{prog.title}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditProgram(prog)}
                            className="p-1 text-slate-700 hover:text-[#FF4B3E] transition"
                            title="프로그램 정보 수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(prog.id, prog.title)}
                            className="p-1 text-slate-700 hover:text-rose-600 transition"
                            title="프로그램 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-800 leading-tight truncate">
                        {prog.mainStudio}
                      </div>
                      <div className="text-[10px] text-[#FF4B3E] font-bold flex items-center justify-between">
                        <span>{prog.pd}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                          prog.genre === '예능' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          prog.genre === '예능(관객)' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {prog.genre}
                        </span>
                      </div>
                    </td>

                    {/* 12 Months Cells */}
                    {Array.from({ length: 12 }, (_, i) => getDynamicMonthlyPermit(prog, i + 1)).map(permit => {
                      const currentSystemMonth = new Date().getMonth() + 1;
                      const isCurrent = permit.month === currentSystemMonth;
                      return (
                        <td
                          key={permit.month}
                          className={`p-2.5 border-r border-slate-200 text-center align-middle ${
                            isCurrent ? 'bg-[#FF4B3E]/5' : ''
                          }`}
                        >
                          <button
                            onClick={() => handleOpenCellEdit(prog.id, prog.title, permit)}
                            className={`w-full py-2 px-1.5 rounded-xl border transition flex flex-col items-center justify-center gap-1 group shadow-xs hover:scale-[1.03] ${
                              permit.status === '승인완료'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                : permit.status === '진행중'
                                ? 'bg-[#FF4B3E]/10 border-[#FF4B3E]/40 text-[#FF4B3E] ring-1 ring-[#FF4B3E]/40 shadow-xs'
                                : permit.status === '승인대기'
                                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                                : permit.status === '예정'
                                ? 'bg-purple-50 border-purple-200 text-purple-800'
                                : permit.status === '반려'
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-700 hover:bg-white'
                            }`}
                            title={`${permit.monthLabel}: ${permit.permitTitle || permit.status}`}
                          >
                            <div className="flex items-center gap-1 font-bold text-[11px]">
                              {permit.status === '승인완료' && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                              {permit.status === '진행중' && <Flame className="w-3 h-3 text-[#FF4B3E] shrink-0 animate-pulse" />}
                              {permit.status === '승인대기' && <Clock className="w-3 h-3 text-amber-600 shrink-0" />}
                              {permit.status === '반려' && <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />}
                              <span>{permit.status}</span>
                            </div>
                            <div className="text-[9px] text-slate-800 truncate max-w-[65px]">
                              {permit.workType || '일반'}
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Month Cell Work Permit Detail & Edit Modal                       */}
      {/* ========================================================================= */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  <FileCheck2 className="w-5 h-5 text-[#FF4B3E]" />
                  <span>{selectedCell.progTitle} · {selectedCell.permit.monthLabel} 안전작업허가</span>
                </h3>
                <p className="text-[11px] text-slate-800 mt-0.5">
                  해당 월의 안전작업허가 상태 및 작업 내역을 변경합니다.
                </p>
              </div>
              <button onClick={() => setSelectedCell(null)} className="text-slate-700 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">허가 작업명</label>
                <input
                  type="text"
                  required
                  value={cellTitle}
                  onChange={e => setCellTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">작업 유형</label>
                  <select
                    value={cellWorkType}
                    onChange={e => setCellWorkType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                  >
                    <option value="고소작업">🏗️ 고소·조명리깅</option>
                    <option value="화기작업">🔥 화기·특수효과</option>
                    <option value="특수효과">🎬 특수효과·와이어</option>
                    <option value="수중작업">🏊 수중·수상촬영</option>
                    <option value="중장비">🚜 크레인·중장비</option>
                    <option value="전기작업">⚡ 전기·조명설비</option>
                    <option value="일반작업">📋 일반 세트작업</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">허가 상태</label>
                  <select
                    value={cellStatus}
                    onChange={e => setCellStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                  >
                    <option value="승인완료">🟢 승인완료</option>
                    <option value="진행중">🔵 진행중</option>
                    <option value="승인대기">🟡 승인대기</option>
                    <option value="예정">🟣 예정</option>
                    <option value="반려">🔴 반려</option>
                    <option value="미발행">⚪ 미발행</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">작업 일자</label>
                <input
                  type="date"
                  value={cellDate}
                  onChange={e => setCellDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">결재 안전관리자</label>
                <input
                  type="text"
                  value={cellOfficer}
                  onChange={e => setCellOfficer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <Link
                  href="/work-permits"
                  target="_blank"
                  className="text-xs text-[#FF4B3E] hover:underline font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>작업허가서 콘솔 열기</span>
                </Link>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCell(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black shadow-md shadow-[#FF4B3E]/25"
                  >
                    저장하기
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Program Create / Edit Modal                                      */}
      {/* ========================================================================= */}
      {showProgModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 text-xs overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tv className="w-5 h-5 text-[#FF4B3E]" />
                <span>{editingProgram ? '프로그램 정보 수정' : '새 방송 프로그램 등록'}</span>
              </h3>
              <button onClick={() => setShowProgModal(false)} className="text-slate-700 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">프로그램명 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: [골 때리는 그녀들], [런닝맨], [우리들의 발라드], [틈만나면,]"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">장르 (선택)</label>
                  <select
                    value={formGenre}
                    onChange={e => setFormGenre(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                  >
                    <option value="예능">예능</option>
                    <option value="예능(관객)">예능(관객)</option>
                    <option value="콘서트">콘서트</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">제작 상태</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                  >
                    <option value="제작중">제작중</option>
                    <option value="기획중">기획중</option>
                    <option value="종영">종영</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">메인 세트장 및 장소 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 강화 야외축구장(골때녀) / 상암 프리즘타워(발라드/인기가요) / 도심 로케이션"
                  value={formMainStudio}
                  onChange={e => setFormMainStudio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">연출 책임 PD</label>
                <input
                  type="text"
                  placeholder="예: 최형인 PD"
                  value={formPd}
                  onChange={e => setFormPd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProgModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black shadow-md shadow-[#FF4B3E]/25"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Printable A4 PDF Report of the 12-Month Matrix                   */}
      {/* ========================================================================= */}
      {showPdfModal && programs.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-5xl w-full bg-white border border-slate-200 rounded-3xl p-6 my-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF4B3E]" />
                <span>프로그램별 연간 안전작업허가서 발급현황 보고서 (PDF)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#FF4B3E]/25"
                >
                  <Printer className="w-4 h-4" />
                  <span>A4 인쇄 / PDF 저장</span>
                </button>
                <button onClick={() => setShowPdfModal(false)} className="p-1.5 text-slate-700 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Sheet Content */}
            <div className="flex-1 overflow-y-auto bg-white text-slate-900 rounded-2xl p-8 border border-slate-200 text-xs space-y-5">
              <div className="text-center pb-4 border-b-2 border-slate-900">
                <div className="text-[10px] font-black tracking-widest text-[#FF4B3E] uppercase">STUDIO PRISM ANNUAL SAFETY MATRIX</div>
                <h2 className="text-2xl font-black text-slate-900 mt-1">2026년도 방송 프로그램별 안전작업허가서 관리대장</h2>
                <div className="text-xs font-mono font-bold text-slate-600 mt-1">
                  기준시점: {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 현재 | 총 {programs.length}개 프로그램 | 총 {totalIssuedCount}건 발급 | 총괄책임: 이상욱 (010-6670-3534)
                </div>
              </div>

              {/* Printable Table */}
              <table className="w-full text-xs text-left border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-center text-slate-800">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-32">프로그램명</th>
                    <th className="p-2 border-r border-slate-300 w-24">장르</th>
                    {Array.from({ length: 12 }, (_, i) => (
                      <th key={i + 1} className="p-1.5 border-r border-slate-300 text-[10px]">
                        {i + 1}월
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[10px]">
                  {programs.map(p => (
                    <tr key={p.id}>
                      <td className="p-2 font-bold border-r border-slate-200 bg-slate-50 text-slate-900">
                        {p.title}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200 text-slate-700">
                        {p.genre}
                      </td>
                      {Array.from({ length: 12 }, (_, i) => getDynamicMonthlyPermit(p, i + 1)).map(m => (
                        <td key={m.month} className="p-1 text-center border-r border-slate-200">
                          {m.status === '승인완료' ? (
                            <span className="text-emerald-700 font-bold">✓완료</span>
                          ) : m.status === '진행중' ? (
                            <span className="text-[#FF4B3E] font-bold">●진행</span>
                          ) : m.status === '승인대기' ? (
                            <span className="text-amber-700 font-bold">대기</span>
                          ) : m.status === '예정' ? (
                            <span className="text-purple-700">예정</span>
                          ) : (
                            <span className="text-slate-700">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-800 font-bold">
                스튜디오프리즘 제작사업부문 안전관리단 | 안전보건 책임자: 이상욱 (010-6670-3534)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
