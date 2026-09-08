'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Film,
  HardHat,
  Plus,
  Edit3,
  Trash2,
  X,
  Printer,
  CheckCircle2,
  Users,
  Filter,
  Tag,
  Tv,
  RotateCcw
} from 'lucide-react';
import { useSafety, CalendarEvent } from '@/context/SafetyContext';

export default function CalendarPage() {
  const { 
    programs, 
    workPermits,
    calendarEvents: rawEvents, 
    addCalendarEvent, 
    updateCalendarEvent, 
    deleteCalendarEvent,
    updateWorkPermit,
    deleteWorkPermit 
  } = useSafety();

  // Combine direct calendar events and active work permits in real-time
  const events = useMemo<CalendarEvent[]>(() => {
    const permitEvents: CalendarEvent[] = (workPermits || []).map(p => {
      const dateStr = p.startDate
        ? p.startDate.slice(0, 10)
        : p.createdAt
        ? p.createdAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      const startTime = p.startDate && p.startDate.includes(' ') ? p.startDate.split(' ')[1] : '09:00';
      const endTime = p.endDate && p.endDate.includes(' ') ? p.endDate.split(' ')[1] : '18:00';

      return {
        id: `wp-cal-${p.id}`,
        date: dateStr,
        program: p.productionName || '스튜디오프리즘',
        studio: p.studioName || '메인 세트장',
        title: `[작업허가] ${p.title}`,
        type: (p.riskLevel === '고위험' ? '고위험작업' : '일반작업') as any,
        status: (p.status === '승인완료'
          ? '승인완료'
          : p.status === '작업진행중'
          ? '작업진행중'
          : p.status === '작업완료'
          ? '작업완료'
          : '승인대기') as any,
        time: `${startTime} ~ ${endTime}`,
        officer: p.safetyOfficerName ? `${p.safetyOfficerName} 안전책임자` : '이상욱 안전관리 책임자'
      };
    });

    return [...(rawEvents || []), ...permitEvents];
  }, [rawEvents, workPermits]);
  
  // Dynamic Month & Year Navigation State initialized to current system date
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1); // 1 ~ 12
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedType, setSelectedType] = useState('전체');

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth - 1;
    if (newMonth < 1) {
      newYear -= 1;
      newMonth = 12;
    }
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    const curDay = parseInt(selectedDate.split('-')[2] || '1', 10);
    const maxDays = new Date(newYear, newMonth, 0).getDate();
    const safeDay = Math.min(curDay, maxDays);
    setSelectedDate(`${newYear}-${String(newMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth + 1;
    if (newMonth > 12) {
      newYear += 1;
      newMonth = 1;
    }
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    const curDay = parseInt(selectedDate.split('-')[2] || '1', 10);
    const maxDays = new Date(newYear, newMonth, 0).getDate();
    const safeDay = Math.min(curDay, maxDays);
    setSelectedDate(`${newYear}-${String(newMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`);
  };

  const handleToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    setCurrentYear(y);
    setCurrentMonth(m);
    setSelectedDate(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  };

  // Calculate dynamic days in month and starting day of week
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 (Sun) ~ 6 (Sat)
  const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate(); // 28, 29, 30, 31
  const offsetDays = Array.from({ length: firstDayOfWeek });
  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form State
  const [formProgram, setFormProgram] = useState('');
  const [formStudio, setFormStudio] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'고위험작업' | '안전점검' | '일반작업' | '정기점검' | 'TBM회의'>('고위험작업');
  const [formStatus, setFormStatus] = useState<'승인완료' | '작업진행중' | '승인대기' | '예정' | '작업완료'>('승인완료');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formTime, setFormTime] = useState('09:00 ~ 18:00');
  const [formOfficer, setFormOfficer] = useState('이상욱 안전관리 책임자');

  const handleOpenAddModal = (defaultDate = selectedDate) => {
    setEditingEvent(null);
    setFormProgram('');
    setFormStudio('');
    setFormTitle('');
    setFormType('고위험작업');
    setFormStatus('승인완료');
    setFormDate(defaultDate);
    setFormTime('09:00 ~ 18:00');
    setFormOfficer('이상욱 안전관리 책임자');
    setShowModal(true);
  };

  const handleOpenEditModal = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setFormProgram(ev.program);
    setFormStudio(ev.studio);
    setFormTitle(ev.title.replace(/^\[작업허가\]\s*/, ''));
    setFormType(ev.type);
    setFormStatus(ev.status);
    setFormDate(ev.date);
    setFormTime(ev.time);
    setFormOfficer(ev.officer);
    setShowModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('일정/작업 제목을 입력해 주세요.');
      return;
    }

    if (editingEvent) {
      if (editingEvent.id.startsWith('wp-cal-')) {
        const permitId = editingEvent.id.replace('wp-cal-', '');
        updateWorkPermit(permitId, {
          productionName: formProgram.trim() || '스튜디오프리즘',
          studioName: formStudio.trim() || '탄현 세트장',
          title: formTitle.trim(),
          startDate: formDate,
          safetyOfficerName: formOfficer
        });
        alert('작업허가서 및 캘린더 일정이 성공적으로 수정되었습니다.');
      } else {
        updateCalendarEvent(editingEvent.id, {
          program: formProgram.trim() || '스튜디오프리즘',
          studio: formStudio.trim() || '탄현 세트장',
          title: formTitle.trim(),
          type: formType,
          status: formStatus,
          date: formDate,
          time: formTime,
          officer: formOfficer
        });
        alert('일정이 성공적으로 수정되었습니다.');
      }
    } else {
      addCalendarEvent({
        program: formProgram.trim() || '스튜디오프리즘',
        studio: formStudio.trim() || '탄현 세트장',
        title: formTitle.trim(),
        type: formType,
        status: formStatus,
        date: formDate,
        time: formTime,
        officer: formOfficer
      });
      alert('새 일정이 성공적으로 등록되었습니다.');
    }

    setShowModal(false);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (confirm(`'${title}' 일정을 삭제하시겠습니까?`)) {
      if (id.startsWith('wp-cal-')) {
        const permitId = id.replace('wp-cal-', '');
        deleteWorkPermit(permitId);
      } else {
        deleteCalendarEvent(id);
      }
    }
  };

  // Filter events by selected type
  const filteredEvents = events.filter(e => {
    const matchType = selectedType === '전체' || e.type === selectedType;
    return matchType;
  });

  const selectedDateEvents = filteredEvents.filter(e => e.date === selectedDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF4B3E] mb-1">
            <CalendarIcon className="w-4 h-4 text-[#FF4B3E]" />
            <span>스튜디오프리즘 제작안전 통합 캘린더</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            촬영 일정 및 안전작업·점검 캘린더
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic Month Selector (< 2026년 8월 >) */}
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              title="이전 달"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-black text-slate-900 min-w-[95px] text-center">
              {currentYear}년 {currentMonth}월
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              title="다음 달"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Jump Button */}
          <button
            onClick={handleToday}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#FF4B3E] font-bold text-xs border border-slate-200 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>오늘</span>
          </button>

          {/* Filter by Type */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold shadow-sm"
          >
            <option value="전체">전체 작업유형</option>
            <option value="고위험작업">🔥 고위험작업</option>
            <option value="안전점검">🛡️ 안전점검</option>
            <option value="일반작업">📋 일반작업</option>
            <option value="정기점검">🚨 정기점검</option>
            <option value="TBM회의">📢 TBM회의</option>
          </select>

          {/* Add Event Button */}
          <button
            onClick={() => handleOpenAddModal(selectedDate)}
            className="px-4 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#FF4B3E]/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>새 일정 추가</span>
          </button>

          {/* Print PDF Button */}
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition shadow-sm"
            title="A4 캘린더 인쇄 / PDF 저장"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Monthly Calendar & Day Schedules Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Interactive Monthly Calendar Grid */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-3.5 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-black text-slate-800 pb-2 border-b border-slate-200">
            <span className="text-rose-600">일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span className="text-[#FF4B3E]">토</span>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Dynamic Empty Offset Days for 1st day of month */}
            {offsetDays.map((_, i) => (
              <div key={`offset-${i}`} className="min-h-16 sm:min-h-24 md:min-h-28 p-1 sm:p-2 bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-200 opacity-40"></div>
            ))}

            {/* Days in the Month */}
            {monthDays.map(day => {
              const dayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = filteredEvents.filter(e => e.date === dayStr);
              const isSelected = selectedDate === dayStr;
              
              const todayObj = new Date();
              const isToday =
                todayObj.getFullYear() === currentYear &&
                todayObj.getMonth() + 1 === currentMonth &&
                todayObj.getDate() === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dayStr)}
                  className={`min-h-16 sm:min-h-24 md:min-h-28 p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-[#FF4B3E]/15 border-[#FF4B3E] ring-2 ring-[#FF4B3E]/50 shadow-sm'
                      : isToday
                      ? 'bg-slate-50 border-blue-400 ring-1 ring-blue-400/40'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] sm:text-xs font-black ${
                      isSelected ? 'text-[#FF4B3E]' : isToday ? 'text-[#FF4B3E]' : 'text-slate-700'
                    }`}>
                      {day}
                    </span>
                    {isToday ? (
                      <span className="text-[8px] sm:text-[9px] font-black px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded bg-[#FF4B3E] text-white shadow-xs">
                        오늘
                      </span>
                    ) : dayEvents.length > 0 ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B3E]"></span>
                    ) : null}
                  </div>

                  <div className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className={`p-0.5 sm:p-1 rounded text-[8px] sm:text-[9px] font-bold truncate ${
                          ev.type === '고위험작업'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : ev.type === '안전점검'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#FF4B3E]/15 text-[#FF4B3E] border border-[#FF4B3E]/30'
                        }`}
                        title={`${ev.program} - ${ev.title}`}
                      >
                        {ev.program.replace('SBS ', '') || ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[7px] sm:text-[8px] text-slate-800 font-bold pl-0.5">
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Date Schedule Details */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF4B3E]" />
                  <span>{selectedDate} 현장 일정</span>
                </h3>
                <p className="text-[11px] text-slate-800 mt-0.5">
                  해당 날짜에 등록된 안전작업 및 점검 목록
                </p>
              </div>

              <button
                onClick={() => handleOpenAddModal(selectedDate)}
                className="px-2.5 py-1.5 rounded-lg bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-[11px] flex items-center gap-1 transition shadow-xs"
                title="이 날짜에 새 일정 추가"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>추가</span>
              </button>
            </div>

            {/* Events List for Selected Date */}
            {selectedDateEvents.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-800 font-medium">등록된 일정이 없습니다.</p>
                <button
                  onClick={() => handleOpenAddModal(selectedDate)}
                  className="text-xs text-[#FF4B3E] hover:underline font-bold"
                >
                  + 새 일정 추가하기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 space-y-2 text-xs transition relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                          ev.type === '고위험작업' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          ev.type === '안전점검' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-blue-100 text-blue-800 border border-[#FF4B3E]/30'
                        }`}>
                          {ev.type}
                        </span>
                        <span className="font-black text-slate-900">{ev.program}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {ev.status}
                        </span>
                        <button
                          onClick={() => handleOpenEditModal(ev)}
                          className="p-1 text-slate-800 hover:text-[#FF4B3E] transition"
                          title="일정 수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          className="p-1 text-slate-800 hover:text-rose-600 transition"
                          title="일정 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="font-bold text-slate-900 text-sm">{ev.title}</div>

                    <div className="space-y-1 text-slate-800 text-[11px] pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-800" />
                        <span>{ev.studio}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-800" />
                        <span>{ev.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{ev.officer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: 일정 추가 및 수정 팝업                                            */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 text-xs overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#FF4B3E]" />
                <h3 className="text-base font-black text-slate-900">
                  {editingEvent ? '촬영 및 안전일정 수정' : '새 촬영 및 안전일정 등록'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-800 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5">
              {/* 프로그램명 */}
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
                  placeholder="예: [골 때리는 그녀들], [런닝맨], [우리들의 발라드], [틈만나면,]"
                  value={formProgram}
                  onChange={e => setFormProgram(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
                {programs && programs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {programs.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormProgram(p.title)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          formProgram === p.title
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

              {/* 촬영 장소 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">촬영 장소 (세트장명·위치) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 강화 야외축구장(골때녀), 도심 로케이션(런닝맨), 상암 메인스튜디오(발라드/인기가요)"
                  value={formStudio}
                  onChange={e => setFormStudio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
                />
              </div>

              {/* 일정 제목 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">작업 / 일정 제목 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 야외 축구장 잔디보호재·조명타워 설치 / 도심 로케이션 도로점용 안전통제"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              {/* 작업 구분 & 상태 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">작업 유형</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                  >
                    <option value="고위험작업">🔥 고위험작업</option>
                    <option value="안전점검">🛡️ 안전점검</option>
                    <option value="일반작업">📋 일반작업</option>
                    <option value="정기점검">🚨 정기점검</option>
                    <option value="TBM회의">📢 TBM회의</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">진행 상태</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                  >
                    <option value="승인완료">승인완료</option>
                    <option value="작업진행중">작업진행중</option>
                    <option value="승인대기">승인대기</option>
                    <option value="예정">예정</option>
                    <option value="작업완료">작업완료</option>
                  </select>
                </div>
              </div>

              {/* 날짜 및 시간 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">일정 날짜</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">작업/촬영 시간</label>
                  <input
                    type="text"
                    placeholder="예: 09:00 ~ 18:00"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* 안전관리자 메모 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">안전관리 책임자 메모 / 조치사항</label>
                <input
                  type="text"
                  placeholder="예: 이상욱 책임자 입회 하에 펜스 충격완화 매트 및 케이블 몰드 매립 검증 완료"
                  value={formOfficer}
                  onChange={e => setFormOfficer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
                />
              </div>

              {/* Submit Buttons */}
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
                  {editingEvent ? '수정사항 저장' : '일정 등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
