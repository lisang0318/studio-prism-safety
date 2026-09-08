'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Printer,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  CheckCircle2,
  Check,
  AlertTriangle,
  X,
  FileText,
  Clock,
  User,
  Trash2,
  Edit3,
  ChevronDown,
  Info,
  ShieldCheck,
  Eye,
  RotateCcw
} from 'lucide-react';
import { DailySafetyLog } from '@/types';
import { useSafety } from '@/context/SafetyContext';

export default function SafetyLogPage() {
  const { safetyLogs: logs, addSafetyLog, updateSafetyLog, deleteSafetyLog } = useSafety();
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState<DailySafetyLog | null>(null);
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<DailySafetyLog | null>(null);

  // Form State
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const defaultChecklistItems = [
    '개인보호구 착용 상태 점검',
    '작업장 정리정돈 및 통로 확보',
    '위험물 저장 및 취급 상태',
    '소화기 등 방화설비 비치 상태',
    '안전표지판 및 방호장치 설치 상태',
    '비상구 및 대피로 확보 여부'
  ];

  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(todayStr);
  const [formTemp, setFormTemp] = useState('');
  const [formWeather, setFormWeather] = useState<'맑음' | '흐림' | '비' | '눈' | '강풍'>('맑음');
  const [formWorkerCount, setFormWorkerCount] = useState<number | ''>('');
  const [formWorkSummary, setFormWorkSummary] = useState('');
  const [formSpecialNotes, setFormSpecialNotes] = useState('');
  const [formChecklists, setFormChecklists] = useState<{ id: string; item: string; checked: boolean }[]>(
    defaultChecklistItems.map((item, idx) => ({ id: `chk-${idx}`, item, checked: true }))
  );

  const handleOpenCreateModal = () => {
    setEditingLog(null);
    setFormTitle('');
    setFormDate(todayStr);
    setFormTemp('');
    setFormWeather('맑음');
    setFormWorkerCount('');
    setFormWorkSummary('');
    setFormSpecialNotes('');
    setFormChecklists(defaultChecklistItems.map((item, idx) => ({ id: `chk-${idx}`, item, checked: true })));
    setShowModal(true);
  };

  const handleOpenEditModal = (log: DailySafetyLog) => {
    setEditingLog(log);
    setFormTitle(log.title);
    setFormDate(log.date);
    setFormTemp(log.temperature || '');
    setFormWeather(log.weather || '맑음');
    setFormWorkerCount(log.workerCount || '');
    setFormWorkSummary(log.workSummary);
    setFormSpecialNotes(log.specialNotes || '');
    setFormChecklists(log.checklists);
    setShowModal(true);
  };

  const handleToggleChecklist = (id: string) => {
    setFormChecklists(prev =>
      prev.map(c => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('일지 제목을 입력해 주세요.');
      return;
    }

    if (editingLog) {
      updateSafetyLog(editingLog.id, {
        title: formTitle.trim(),
        date: formDate,
        temperature: formTemp.trim() || undefined,
        weather: formWeather,
        workerCount: formWorkerCount ? Number(formWorkerCount) : undefined,
        workSummary: formWorkSummary.trim(),
        checklists: formChecklists,
        specialNotes: formSpecialNotes.trim() || undefined
      });
      alert('안전일지가 성공적으로 수정되었습니다.');
    } else {
      addSafetyLog({
        title: formTitle.trim(),
        date: formDate,
        temperature: formTemp.trim() || undefined,
        weather: formWeather,
        workerCount: formWorkerCount ? Number(formWorkerCount) : undefined,
        workSummary: formWorkSummary.trim(),
        checklists: formChecklists,
        specialNotes: formSpecialNotes.trim() || undefined,
        author: '이상욱 안전관리 책임자'
      });
      alert('안전일지가 성공적으로 등록되었습니다.');
    }

    setShowModal(false);
  };

  const handleDeleteLog = (id: string, title: string) => {
    if (confirm(`'${title}' 안전일지를 삭제하시겠습니까?`)) {
      deleteSafetyLog(id);
      if (selectedLogForDetail?.id === id) {
        setSelectedLogForDetail(null);
      }
    }
  };

  const getWeatherIcon = (weather?: string) => {
    switch (weather) {
      case '맑음':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case '흐림':
        return <Cloud className="w-4 h-4 text-slate-800" />;
      case '비':
        return <CloudRain className="w-4 h-4 text-blue-500" />;
      case '눈':
        return <Snowflake className="w-4 h-4 text-sky-400" />;
      case '강풍':
        return <Wind className="w-4 h-4 text-teal-500" />;
      default:
        return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF4B3E] mb-1">
            <CalendarDays className="w-4 h-4 text-[#FF4B3E]" />
            <span>STUDIO PRISM · 제작현장 일일 안전기록</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            일일 안전일지
          </h1>
          <p className="text-xs text-slate-800 mt-1">
            제작 세트장의 일일 안전 상태와 작업 내용을 기록하고 관리합니다.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#FF4B3E]/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>신규 안전일지 작성</span>
        </button>
      </div>

      {/* Counter & Action Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-[#FF4B3E]/15 text-[#FF4B3E] font-bold flex items-center gap-1.5 border border-[#FF4B3E]/30">
            <FileText className="w-3.5 h-3.5" />
            <span>등록 일지 {logs.length}건</span>
          </span>
        </div>

        <div className="text-xs text-slate-800">
          책임 관리자: <b className="text-slate-800 font-bold">이상욱 안전관리 책임자</b>
        </div>
      </div>

      {/* Logs List Area */}
      {logs.length === 0 ? (
        /* Empty State */
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center space-y-3 bg-white shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#FF4B3E]/15 flex items-center justify-center text-[#FF4B3E] mx-auto">
            <Info className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900">등록된 일일 안전일지가 없습니다</h3>
          <p className="text-xs text-slate-800 max-w-sm mx-auto">
            상단의 [신규 안전일지 작성] 버튼을 눌러 오늘 제작현장의 안전일지를 등록해 보세요.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs inline-flex items-center gap-1.5 shadow-sm transition mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>첫 안전일지 작성하기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div
              key={log.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#FF4B3E] bg-[#FF4B3E]/15 px-2.5 py-0.5 rounded-full border border-[#FF4B3E]/30">
                      {log.date}
                    </span>
                    <span className="flex items-center gap-1 text-slate-800 font-medium">
                      {getWeatherIcon(log.weather)} {log.weather} {log.temperature ? `(${log.temperature}℃)` : ''}
                    </span>
                    {log.workerCount && (
                      <span className="text-slate-800 font-medium">· 투입 {log.workerCount}명</span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900">{log.title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedLogForDetail(log)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#FF4B3E]" />
                    <span>상세·인쇄</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(log)}
                    className="px-3 py-1.5 rounded-xl bg-[#FF4B3E]/15 hover:bg-[#FF4B3E] hover:text-white text-[#FF4B3E] text-xs font-bold flex items-center gap-1 transition border border-[#FF4B3E]/30"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>수정</span>
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log.id, log.title)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-black text-rose-700 text-xs font-bold flex items-center gap-1 transition border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>삭제</span>
                  </button>
                </div>
              </div>

              {/* Work Summary & Checklists */}
              <div className="text-xs text-slate-700 space-y-2">
                {log.workSummary && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">● 주요 작업 및 점검 내용</span>
                    <p className="whitespace-pre-line leading-relaxed text-slate-700">{log.workSummary}</p>
                  </div>
                )}

                {/* Checklist Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {log.checklists.map(c => (
                    <div
                      key={c.id}
                      className={`p-2 rounded-xl border flex items-center gap-2 ${
                        c.checked
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${c.checked ? 'text-emerald-600' : 'text-slate-700'}`} />
                      <span className="truncate">{c.item}</span>
                    </div>
                  ))}
                </div>

                {log.specialNotes && (
                  <div className="pt-2 text-[11px] text-slate-800">
                    <span className="font-bold text-slate-800">특이사항: </span>
                    {log.specialNotes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Create / Edit Safety Log                                           */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 text-xs overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#FF4B3E]" />
                <span>{editingLog ? '일일 안전일지 수정' : '신규 일일 안전일지 작성'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-800 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">일지 제목 *</label>
                <input
                  type="text"
                  required
                  placeholder="일지 제목을 입력하세요 (예: [골 때리는 그녀들] 야외 경기장 조명타워 및 잔디보호재 설치 점검)"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">점검 일자</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">기온 (℃)</label>
                  <input
                    type="text"
                    placeholder="예: 26"
                    value={formTemp}
                    onChange={e => setFormTemp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">날씨</label>
                  <select
                    value={formWeather}
                    onChange={e => setFormWeather(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                  >
                    <option value="맑음">☀️ 맑음</option>
                    <option value="흐림">☁️ 흐림</option>
                    <option value="비">🌧️ 비</option>
                    <option value="눈">❄️ 눈</option>
                    <option value="강풍">💨 강풍</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">현장 투입 인원 (명)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="예: 25"
                    value={formWorkerCount}
                    onChange={e => setFormWorkerCount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">주요 작업 및 점검 내용</label>
                <textarea
                  rows={3}
                  placeholder="금일 현장의 작업 및 안전점검 내용을 입력하세요 (예: [골 때리는 그녀들] 잔디보호재 전면 시공, 펜스 충격완화 안전매트 체결, 조명타워 4점 지지 와이어 결속 상태 및 구급차 상시대기 점검)"
                  value={formWorkSummary}
                  onChange={e => setFormWorkSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>

              {/* Checklists */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">핵심 일일 안전점검 체크리스트</label>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {formChecklists.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={c.checked}
                        onChange={() => handleToggleChecklist(c.id)}
                        className="w-4 h-4 rounded text-[#FF4B3E] focus:ring-[#FF4B3E] border-slate-300"
                      />
                      <span>{c.item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">특이사항 및 조치사항</label>
                <textarea
                  rows={2}
                  placeholder="특이사항이나 현장 조치사항을 입력하세요 (예: 야외 기온 상승에 따른 그늘막/식수대 추가 설치 및 선수 충돌 부상 방지 쿨링팩 비치 완료)"
                  value={formSpecialNotes}
                  onChange={e => setFormSpecialNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
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
                  {editingLog ? '수정사항 저장' : '일지 등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Detail & Printable A4 Safety Log                                   */}
      {/* ========================================================================= */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-6 my-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF4B3E]" />
                <span>일일 안전일지 A4 양식</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>인쇄 / PDF 저장</span>
                </button>
                <button onClick={() => setSelectedLogForDetail(null)} className="p-1.5 text-slate-800 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Sheet View */}
            <div className="flex-1 overflow-y-auto bg-white text-slate-900 rounded-2xl p-8 border border-slate-300 text-xs space-y-4">
              <div className="text-center pb-3 border-b-2 border-slate-900">
                <div className="text-[10px] font-black tracking-widest text-slate-800 uppercase">STUDIO PRISM DAILY SAFETY LOG</div>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">일 일 안 전 일 지</h2>
                <div className="text-xs font-mono font-bold text-blue-800 mt-1">
                  점검일자: {selectedLogForDetail.date} | 날씨: {selectedLogForDetail.weather} ({selectedLogForDetail.temperature || '-'}℃) | 인원: {selectedLogForDetail.workerCount || '-'}명
                </div>
              </div>

              <table className="w-full text-xs text-left border border-slate-400">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">일지 제목</th>
                    <td className="p-2.5 font-black text-slate-900" colSpan={3}>{selectedLogForDetail.title}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">점검 책임자</th>
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">{selectedLogForDetail.author}</td>
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-24 border-r border-slate-300">작성 시간</th>
                    <td className="p-2.5 font-mono text-slate-800">{selectedLogForDetail.createdAt}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">주요 작업내용</th>
                    <td className="p-2.5 text-slate-900 leading-relaxed whitespace-pre-line" colSpan={3}>
                      {selectedLogForDetail.workSummary || '특이사항 없음'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">일일 점검항목</th>
                    <td className="p-2.5 text-[11px] text-slate-800" colSpan={3}>
                      <div className="grid grid-cols-2 gap-1.5">
                        {selectedLogForDetail.checklists.map(c => (
                          <div key={c.id} className="flex items-center gap-1.5">
                            <span className={c.checked ? 'text-emerald-600 font-bold' : 'text-slate-800'}>
                              {c.checked ? '☑' : '☐'}
                            </span>
                            <span>{c.item}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">특이사항/조치</th>
                    <td className="p-2.5 text-slate-800 leading-relaxed whitespace-pre-line" colSpan={3}>
                      {selectedLogForDetail.specialNotes || '특이 안전사고 없음'}
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
