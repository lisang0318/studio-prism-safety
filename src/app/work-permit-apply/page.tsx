'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileCheck2,
  Flame,
  HardHat,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Building,
  Calendar,
  Clock,
  Zap,
  Moon,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Printer,
  Download,
  Plus,
  Users,
  ChevronDown,
  Check
} from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';
import { RiskLevel, WorkPermitTemplate } from '@/types';
import SignaturePad from '@/components/common/SignaturePad';

function WorkPermitApplyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addWorkPermit, templates, programs, refreshData } = useSafety();

  const [studioName, setStudioName] = useState('');
  const [productionName, setProductionName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerContact, setManagerContact] = useState('');
  
  // Weather & Temperature states (Connected to real-time weather API)
  const [weather, setWeather] = useState<'맑음' | '흐림' | '비' | '눈' | '강풍'>('맑음');
  const [temperature, setTemperature] = useState('');
  const [autoWeatherInfo, setAutoWeatherInfo] = useState<string>('');
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  // Dropdown states & ref
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync latest templates and central data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select template from URL or default to first
  useEffect(() => {
    const tplParam = searchParams.get('template') || searchParams.get('id');
    if (tplParam && templates.some(t => t.id === tplParam)) {
      setSelectedTemplateId(tplParam);
    } else if (templates && templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [searchParams, templates, selectedTemplateId]);

  // Real-time weather fetcher from /api/weather
  const fetchRealTimeWeather = async (locQuery: string) => {
    if (!locQuery || !locQuery.trim()) return;
    setIsFetchingWeather(true);
    try {
      const res = await fetch(`/api/weather?location=${encodeURIComponent(locQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWeather(data.weather);
          setTemperature(data.temperature);
          setAutoWeatherInfo(data.summary || `${data.resolvedLocation} (${data.temperature} ${data.weatherDesc})`);
        }
      }
    } catch (err) {
      console.warn('Real-time weather API fetch error:', err);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  // Debounced auto-fetch when user types shooting location
  useEffect(() => {
    if (!studioName.trim()) {
      setAutoWeatherInfo('');
      return;
    }
    const timer = setTimeout(() => {
      fetchRealTimeWeather(studioName);
    }, 450);
    return () => clearTimeout(timer);
  }, [studioName]);

  const handleProgramSelect = (progTitle: string) => {
    setProductionName(progTitle);
  };

  // Date & Time split states for 100% clean mobile layout without overflow
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const [startDateVal, setStartDateVal] = useState(todayStr);
  const [startTimeVal, setStartTimeVal] = useState('09:00');
  const [endDateVal, setEndDateVal] = useState(todayStr);
  const [endTimeVal, setEndTimeVal] = useState('18:00');

  const [managerSignature, setManagerSignature] = useState<string | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedPermitNumber, setSubmittedPermitNumber] = useState('');

  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const activeTemplate: WorkPermitTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0] || {
    id: 'default',
    title: '일반 방송제작 작업',
    workType: '일반 시설·청소·반입반출',
    riskLevel: '중위험',
    description: '',
    hazards: ['작업 중 안전부주의'],
    safetyMeasures: ['작업 전 안전수칙 확인 및 개인보호구 착용'],
    requiredPPE: ['안전모', '안전화']
  };

  // Quick Preset Handlers
  const applyDayShift = () => {
    setStartDateVal(todayStr);
    setStartTimeVal('09:00');
    setEndDateVal(todayStr);
    setEndTimeVal('18:00');
  };

  const applyNightShift = () => {
    setStartDateVal(todayStr);
    setStartTimeVal('18:00');
    setEndDateVal(tomorrowStr);
    setEndTimeVal('06:00');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productionName.trim() || !managerName.trim() || !studioName.trim() || !managerContact.trim()) {
      alert('필수 입력 항목(작품/프로그램명, 촬영장소, 작성자 성명 및 연락처)을 모두 작성해 주세요.');
      return;
    }
    if (!startDateVal || !startTimeVal || !endDateVal || !endTimeVal) {
      alert('촬영/작업 시작 시간과 종료 시간을 선택해 주세요.');
      return;
    }
    if (!managerSignature) {
      alert('작성자(제작진) 자필 서명을 패드에 작성해 주세요.');
      return;
    }

    const formattedStart = `${startDateVal} ${startTimeVal}`;
    const formattedEnd = `${endDateVal} ${endTimeVal}`;
    const generatedTitle = `${productionName.trim()} ${activeTemplate.workType}`;

    const newPermit = addWorkPermit({
      title: generatedTitle,
      studioName: studioName.trim(),
      productionName: productionName.trim(),
      contractorName: '제작진 직영',
      managerName: managerName.trim(),
      managerContact: managerContact.trim(),
      workerCount: 1,
      workType: activeTemplate.workType,
      riskLevel: activeTemplate.riskLevel,
      startDate: formattedStart,
      endDate: formattedEnd,
      weather: weather,
      temperature: temperature.trim() || undefined,
      workDescription: `${productionName.trim()} ${activeTemplate.workType} 안전작업`,
      hazards: activeTemplate.hazards,
      safetyMeasures: activeTemplate.safetyMeasures,
      requiredPPE: activeTemplate.requiredPPE,
      managerSignature: managerSignature || undefined,
      checklists: [
        { id: 'c1', category: '사전준비', item: '작업 전 TBM 및 특별안전교육 실시', checked: true, required: true },
        { id: 'c2', category: '보호구', item: '작업자 필수 개인보호구 100% 착용 확인', checked: true, required: true },
        { id: 'c3', category: '통제구획', item: '작업구역 바리케이드 설치 및 유도원 배치', checked: true, required: true },
        { id: 'c4', category: '비상대응', item: '비상연락망 및 소화기 현장 전진배치 확인', checked: true, required: true }
      ],
      status: '승인대기'
    });

    setSubmittedPermitNumber(newPermit.permitNumber);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // SUBMISSION SUCCESS & DIRECT OFFICIAL DOCUMENT PDF VIEW (Bright Clean Theme)
  // =========================================================================
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-full">
        <div className="max-w-2xl w-full space-y-4 my-4">
          {/* Top Success Banner */}
          <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <div className="font-mono text-xs text-emerald-800 font-bold">접수번호: {submittedPermitNumber}</div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  안전작업허가서 접수가 완료되었습니다
                </h2>
                <div className="text-xs text-slate-600 mt-0.5">
                  안전관리 책임자(이상욱)에게 실시간 전송되었으며, 검토 후 즉시 승인됩니다.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="px-3 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                ⏳ 승인대기중
              </span>
            </div>
          </div>

          {/* Official A4 Document Sheet View */}
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-xs space-y-4">
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase">STUDIO PRISM OFFICIAL PERMIT</div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">방 송 제 작 안 전 작 업 허 가 서</h1>
              <div className="text-xs font-mono font-bold text-blue-800 mt-1">
                허가번호: {submittedPermitNumber} | 접수일시: {new Date().toISOString().replace('T', ' ').slice(0, 16)}
              </div>
            </div>

            {/* Official Table */}
            <table className="w-full text-xs text-left border border-slate-400">
              <tbody>
                <tr className="border-b border-slate-300">
                  <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">작품 / 프로그램명</th>
                  <td className="p-2.5 font-black text-slate-900 border-r border-slate-300">{productionName}</td>
                  <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-24 border-r border-slate-300">촬영장소</th>
                  <td className="p-2.5 font-bold text-slate-900">{studioName}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">작성자 / 제작진</th>
                  <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">{managerName} ({managerContact || '연락처 미기재'})</td>
                  <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-24 border-r border-slate-300">작업일시</th>
                  <td className="p-2.5 font-mono font-bold text-blue-900">
                    {startDateVal} {startTimeVal} ~ {endDateVal} {endTimeVal}
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">현장 기상 / 기온</th>
                  <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">
                    {weather} {temperature ? `(${temperature}℃)` : ''}
                  </td>
                  <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-24 border-r border-slate-300">작업유형</th>
                  <td className="p-2.5 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold mr-1.5">
                      [{activeTemplate.riskLevel}]
                    </span>
                    {activeTemplate.workType}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Hazards and Measures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                <span className="font-black text-rose-800 block mb-1">● 주요 위험요인</span>
                <ul className="space-y-0.5 text-rose-950 font-medium">
                  {activeTemplate.hazards.map((h, idx) => (
                    <li key={idx}>- {h}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="font-black text-emerald-800 block mb-1">● 현장 필수 안전조치사항</span>
                <ul className="space-y-0.5 text-emerald-950 font-medium">
                  {activeTemplate.safetyMeasures.map((m, idx) => (
                    <li key={idx}>- {m}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* PPE */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-700 text-[11px]">필수 착용 보호구:</span>
              {activeTemplate.requiredPPE.map((ppe, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-800 shadow-xs">
                  ✓ {ppe}
                </span>
              ))}
            </div>

            {/* Footer Notice */}
            <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-600 font-medium space-y-0.5">
              <div>스튜디오프리즘 안전관리단 | 이상욱 안전관리 책임자 (010-6670-3534)</div>
              <div className="text-[9px] text-slate-500">* 본 문서는 안전작업허가 접수증으로, 안전관리 책임자의 최종 서명 승인 후 작업이 개시됩니다.</div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3.5 rounded-2xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs shadow-md shadow-[#FF4B3E]/25 flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>허가서 인쇄 / PDF 다운로드</span>
            </button>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setProductionName('');
                setManagerSignature(null);
              }}
              className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition"
            >
              추가 신청하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // NORMAL FORM VIEW (Bright Clean White Theme with Studio Prism Red Accents)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
      <div className="max-w-2xl w-full bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden my-4">
        {/* Header (Studio Prism Red Brand Header) */}
        <div className="p-5 sm:p-6 bg-[#FF4B3E] text-white border-b border-[#FF3823]">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-100 mb-1">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>스튜디오프리즘 안전관리 시스템</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            방송제작 안전작업허가 신청서
          </h1>
          <p className="text-xs text-rose-100 mt-1">
            고위험 작업(특수효과, 고소리깅, 세트설치 등) 착수 전 작성하여 제출해 주시기 바랍니다.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs">
          {/* 1. Work Type / Template Selector (Enhanced Readability Dropdown) */}
          <div ref={dropdownRef} className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-700">
                1. 작업 유형 선택 (템플릿) *
              </label>
              <span className="text-[10px] text-[#FF4B3E] font-bold">
                양식 {templates.length}종 실시간 연동
              </span>
            </div>

            {/* Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between text-slate-900 font-bold focus:border-[#FF4B3E] focus:bg-white focus:outline-none transition shadow-xs"
            >
              <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                  activeTemplate.riskLevel === '고위험' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                  activeTemplate.riskLevel === '중위험' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {activeTemplate.riskLevel}
                </span>
                <span className="font-black text-slate-900 text-xs truncate">
                  {activeTemplate.title}
                </span>
                <span className="text-slate-500 text-[11px] font-medium shrink-0">
                  · {activeTemplate.workType}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#FF4B3E]' : ''}`} />
            </button>

            {/* Dropdown Options List Menu with Enhanced Readability & Visual Formatting */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
                {templates.map(tpl => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`p-3.5 cursor-pointer transition flex items-start justify-between gap-3 hover:bg-slate-50 ${
                        isSelected ? 'bg-rose-50/70 border-l-4 border-[#FF4B3E]' : ''
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        {/* Row 1: Risk Badge & Program/Template Title */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                            tpl.riskLevel === '고위험' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            tpl.riskLevel === '중위험' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {tpl.riskLevel}
                          </span>
                          <span className="font-black text-xs text-slate-900">
                            {tpl.title}
                          </span>
                        </div>

                        {/* Row 2: Detailed Work Type */}
                        <div className="text-[11px] text-slate-700 font-bold flex items-center gap-1.5 pl-0.5">
                          <span className="text-[#FF4B3E] font-black">● 세부 작업:</span>
                          <span className="text-slate-900">{tpl.workType}</span>
                        </div>

                        {/* Row 3: Hazards & Description Overview */}
                        {tpl.description ? (
                          <div className="text-[10px] text-slate-500 line-clamp-1 pl-0.5">
                            {tpl.description}
                          </div>
                        ) : tpl.hazards && tpl.hazards.length > 0 ? (
                          <div className="text-[10px] text-slate-400 line-clamp-1 pl-0.5">
                            주요위험: {tpl.hazards.join(', ')}
                          </div>
                        ) : null}
                      </div>

                      {/* Right Selected Check Icon */}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#FF4B3E]/10 text-[#FF4B3E] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active template description subtitle */}
            {activeTemplate.description && (
              <p className="text-[11px] text-[#FF4B3E] font-medium mt-1 pl-0.5">
                {activeTemplate.description}
              </p>
            )}
          </div>

          {/* 2. Program Name with Dynamic Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">2. 작품 / 프로그램명 *</label>
              {programs && programs.length > 0 && (
                <span className="text-[10px] text-[#FF4B3E] font-bold">등록 프로그램 바로가기</span>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="작품 또는 프로그램명을 입력하세요 (예: [골 때리는 그녀들], [런닝맨], [우리들의 발라드], [틈만나면,])"
              value={productionName}
              onChange={e => handleProgramSelect(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 font-bold text-xs focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
            />
            {programs && programs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {programs.map(prog => (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() => handleProgramSelect(prog.title)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                      productionName === prog.title
                        ? 'bg-[#FF4B3E] border-[#FF4B3E] text-white shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {prog.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Shooting Location (Free Text Input) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">3. 촬영 장소 (세트장명·위치) *</label>
              {isFetchingWeather ? (
                <span className="text-[10px] text-blue-600 font-bold animate-pulse">⚡ 실시간 기상 조회 중...</span>
              ) : autoWeatherInfo ? (
                <span className="text-[10px] text-emerald-600 font-bold">✓ 실시간 기상 연동 완료</span>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">자유 텍스트 입력 시 실시간 날씨 자동 연동</span>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="촬영 장소를 자유롭게 입력하세요 (예: 강화 야외축구장, 상암 프리즘타워 3층, 탄현 세트장, 여의도 한강공원 등)"
              value={studioName}
              onChange={e => setStudioName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
            />
          </div>

          {/* 4. Date & Time Settings */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FF4B3E]" />
                4. 촬영 및 작업 시간 설정 *
              </span>
              
              {/* Quick Shift Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={applyDayShift}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 flex items-center gap-1 transition shadow-xs"
                >
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>주간 (09~18시)</span>
                </button>
                <button
                  type="button"
                  onClick={applyNightShift}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 flex items-center gap-1 transition shadow-xs"
                >
                  <Moon className="w-3 h-3 text-indigo-600" />
                  <span>야간 (18~06시)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Start Date/Time Group */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-emerald-700 text-xs font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    촬영/작업 시작 일시
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">START</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">날짜</span>
                    <input
                      type="date"
                      required
                      value={startDateVal}
                      onChange={e => setStartDateVal(e.target.value)}
                      className="flex-1 min-w-0 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">시간</span>
                    <input
                      type="time"
                      required
                      value={startTimeVal}
                      onChange={e => setStartTimeVal(e.target.value)}
                      className="flex-1 min-w-0 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs text-center font-bold focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* End Date/Time Group */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-rose-700 text-xs font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    촬영/작업 종료 일시
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">END</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">날짜</span>
                    <input
                      type="date"
                      required
                      value={endDateVal}
                      onChange={e => setEndDateVal(e.target.value)}
                      className="flex-1 min-w-0 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">시간</span>
                    <input
                      type="time"
                      required
                      value={endTimeVal}
                      onChange={e => setEndTimeVal(e.target.value)}
                      className="flex-1 min-w-0 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs text-center font-bold focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Shooting Site Weather & Temperature (Real-Time Weather API Connected) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                5. 촬영 현장 기상 및 기온 (실시간 기상청/Open-Meteo API 연동)
              </span>
              {isFetchingWeather ? (
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 animate-pulse">
                  ⚡ 실시간 기상 데이터 수신 중...
                </span>
              ) : autoWeatherInfo ? (
                <span className="text-[10px] text-[#FF4B3E] font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  ⚡ {autoWeatherInfo}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">촬영 장소 입력 시 실시간 기상 자동 반영</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Weather Selector Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {(['맑음', '흐림', '비', '눈', '강풍'] as const).map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeather(w)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      weather === w
                        ? 'bg-[#FF4B3E] border-[#FF4B3E] text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {w === '맑음' && '☀️ '}
                    {w === '흐림' && '☁️ '}
                    {w === '비' && '🌧️ '}
                    {w === '눈' && '❄️ '}
                    {w === '강풍' && '💨 '}
                    {w}
                  </button>
                ))}
              </div>

              {/* Temperature input */}
              <div>
                <input
                  type="text"
                  placeholder="현장 기온 (예: 28.5℃)"
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 text-xs font-mono focus:border-[#FF4B3E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 6. Combined Writer / Production Crew (Name + Contact) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              6. 작성자 / 제작진 (성명 및 연락처) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                placeholder="작성자(제작진) 성명 (예: 김태호 PD, 조연출/FD)"
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-xs font-bold focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
              />
              <input
                type="tel"
                required
                placeholder="제작진 연락처 (예: 010-1234-5678)"
                value={managerContact}
                onChange={e => setManagerContact(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-xs font-mono focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Preset Safety Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="font-bold text-rose-700 block mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                확인된 주요 위험요인:
              </span>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-2">
                {activeTemplate.hazards.map((h, i) => (
                  <li key={i}>● {h}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold text-emerald-700 block mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                필수 준수 안전조치사항:
              </span>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-2">
                {activeTemplate.safetyMeasures.map((m, i) => (
                  <li key={i}>● {m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* PPE Chips */}
          <div>
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1 mb-1.5">
              <HardHat className="w-3.5 h-3.5 text-[#FF4B3E]" />
              필수 착용 보호구
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeTemplate.requiredPPE.map((ppe, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                  ✓ {ppe}
                </span>
              ))}
            </div>
          </div>

          {/* Handwritten Signature Pad */}
          <div className="pt-2 border-t border-slate-200">
            <SignaturePad
              title="작성자 (제작진) 자필 서약 서명 (필수)"
              placeholderText="상기 안전수칙을 준수할 것을 서약하며 손가락/펜으로 자필 서명해 주세요"
              onChange={data => setManagerSignature(data)}
              height={120}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-sm rounded-2xl shadow-lg shadow-[#FF4B3E]/30 transition"
          >
            안전작업허가 신청서 제출
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WorkPermitApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 text-slate-500 flex items-center justify-center font-bold">로딩 중...</div>}>
      <WorkPermitApplyContent />
    </Suspense>
  );
}
