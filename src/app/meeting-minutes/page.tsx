'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollText,
  Users,
  MessageSquare,
  Calendar,
  FileSpreadsheet,
  CalendarCheck,
  Search,
  Plus,
  Printer,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  X,
  CheckCircle2,
  Info,
  Eye,
  AlertCircle
} from 'lucide-react';

import { useSafety, MeetingRecord } from '@/context/SafetyContext';

export default function MeetingMinutesPage() {
  const { meetingRecords: meetings, addMeetingRecord, deleteMeetingRecord } = useSafety();
  const [activeTab, setActiveTab] = useState<'committee' | 'subcontractor' | 'other' | 'schedule'>('committee');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMeetingForView, setSelectedMeetingForView] = useState<MeetingRecord | null>(null);

  // Form State
  const [formYear, setFormYear] = useState(() => `${new Date().getFullYear()}년`);
  const [formQuarter, setFormQuarter] = useState(() => `${Math.ceil((new Date().getMonth() + 1) / 3)}분기`);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formTitle, setFormTitle] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; dataUrl: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenModal = () => {
    const now = new Date();
    setFormYear(`${now.getFullYear()}년`);
    setFormQuarter(activeTab === 'subcontractor' ? `${now.getMonth() + 1}월` : `${Math.ceil((now.getMonth() + 1) / 3)}분기`);
    setFormDate(now.toISOString().slice(0, 10));
    setFormTitle('');
    setUploadedFile(null);
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('파일 크기는 최대 20MB까지 업로드할 수 있습니다.');
        return;
      }
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFile({
          name: file.name,
          size: sizeStr,
          dataUrl: reader.result as string,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('회의 제목을 입력해 주세요.');
      return;
    }

    const currentCat: 'committee' | 'subcontractor' | 'other' =
      activeTab === 'subcontractor' ? 'subcontractor' : activeTab === 'other' ? 'other' : 'committee';

    addMeetingRecord({
      category: currentCat,
      year: formYear,
      quarterOrPeriod: formQuarter,
      date: formDate,
      title: formTitle.trim(),
      fileName: uploadedFile?.name,
      fileSize: uploadedFile?.size,
      fileDataUrl: uploadedFile?.dataUrl,
      fileType: uploadedFile?.type
    });

    setShowUploadModal(false);
    alert('회의록이 성공적으로 등록 및 보관되었습니다.');
  };

  const handleDeleteMeeting = (id: string, title: string) => {
    if (confirm(`'${title}' 회의록을 삭제하시겠습니까?`)) {
      deleteMeetingRecord(id);
    }
  };

  // Filter meetings by current tab & search
  const currentCategory = activeTab === 'subcontractor' ? 'subcontractor' : activeTab === 'other' ? 'other' : 'committee';
  const filteredMeetings = meetings.filter(m => {
    const matchCat = m.category === currentCategory;
    const matchSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.date.includes(searchTerm) ||
                        (m.fileName && m.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  const getCategoryTitle = () => {
    switch (activeTab) {
      case 'committee':
        return '산업안전보건위원회';
      case 'subcontractor':
        return '협력업체 협의체회의';
      case 'other':
        return '기타 회의';
      default:
        return '회의록';
    }
  };

  const getCategoryBadge = () => {
    switch (activeTab) {
      case 'committee':
        return '법령상 분기당 1회';
      case 'subcontractor':
        return '법령상 월 1회';
      case 'other':
        return '수시 회의';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none">
      {/* Top Header matching Screenshot 1 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          회의록 관리
        </h1>
        <p className="text-xs text-slate-800 mt-1">
          산업안전보건위원회, 협력업체 협의체의 등 법정 회의록을 주기별로 기록·관리합니다.
        </p>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center gap-2 text-xs font-bold border-b border-slate-200 pb-3 overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('committee')}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl transition shrink-0 ${
            activeTab === 'committee'
              ? 'bg-blue-100 border-2 border-[#FF4B3E] text-blue-700 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-800 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>산업안전보건위원회</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-normal">
            분기당 1회
          </span>
        </button>

        <button
          onClick={() => setActiveTab('subcontractor')}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl transition shrink-0 ${
            activeTab === 'subcontractor'
              ? 'bg-blue-100 border-2 border-[#FF4B3E] text-blue-700 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-800 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>협력업체 협의체회의</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-normal">
            월 1회
          </span>
        </button>

        <button
          onClick={() => setActiveTab('other')}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl transition shrink-0 ${
            activeTab === 'other'
              ? 'bg-blue-100 border-2 border-[#FF4B3E] text-blue-700 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-800 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>기타 회의</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-normal">
            주기 없음
          </span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl transition shrink-0 ${
            activeTab === 'schedule'
              ? 'bg-blue-100 border-2 border-[#FF4B3E] text-blue-700 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-800 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>회의록 주기표</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-normal">
            한눈에 보기
          </span>
        </button>
      </div>

      {/* Main Container based on active tab */}
      {activeTab === 'committee' || activeTab === 'subcontractor' || activeTab === 'other' ? (
        <div className="space-y-4">
          {/* Subheader Box with Search & Upload Button */}
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF4B3E]/150"></span>
                <span className="text-sm font-black text-slate-900">{getCategoryTitle()} 보관함</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                  {getCategoryBadge()}
                </span>
              </div>
              <p className="text-xs text-slate-800 mt-1">
                업로드된 회의록 파일과 법정 기록을 안전하게 보관하고 관리하는 공간입니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-800 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="제목·날짜 검색"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 w-52 sm:w-64"
                />
              </div>

              <button
                onClick={handleOpenModal}
                className="px-4 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-[#FF4B3E]/30 transition shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>회의록 등록하기</span>
              </button>
            </div>
          </div>

          {/* Meeting Items List or Empty State (Screenshot 1) */}
          {filteredMeetings.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center space-y-4 bg-slate-50">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-700">아직 보관된 회의록이 없습니다.</h3>
                <p className="text-xs text-slate-800">회의록 파일을 업로드하여 보관해보세요.</p>
              </div>
              <button
                onClick={handleOpenModal}
                className="px-5 py-2.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs inline-flex items-center gap-1.5 shadow-lg shadow-[#FF4B3E]/30 transition"
              >
                <FileText className="w-4 h-4" />
                <span>회의록 등록하기</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeetings.map(m => (
                <div
                  key={m.id}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-3xl p-5 shadow-xl transition space-y-3 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold border border-blue-200">
                          {m.year} {m.quarterOrPeriod}
                        </span>
                        <span className="text-slate-800 font-mono text-[11px]">{m.date}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteMeeting(m.id, m.title)}
                        className="p-1 text-slate-800 hover:text-rose-700 transition"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-base font-black text-slate-900">{m.title}</h3>

                    {m.fileName && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                          <span className="font-mono text-slate-700 truncate">{m.fileName}</span>
                          <span className="text-[10px] text-slate-800 shrink-0">({m.fileSize})</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedMeetingForView(m)}
                      className="w-full py-2 rounded-xl bg-[#FF4B3E]/20 hover:bg-[#FF4B3E] text-blue-700 hover:text-white font-bold flex items-center justify-center gap-1.5 transition text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>회의록 열람 / PDF 다운로드</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Schedule Periodicity Guide Tab */
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="text-base font-black text-slate-900">법정 안전보건 회의체 주기표</h3>
          <table className="w-full border border-slate-200 text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 border-r border-slate-200">회의 구분</th>
                <th className="p-3 border-r border-slate-200">법적 근거</th>
                <th className="p-3 border-r border-slate-200">개최 주기</th>
                <th className="p-3">참석 대상</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-3 font-bold text-slate-900 border-r border-slate-200">산업안전보건위원회</td>
                <td className="p-3 border-r border-slate-200">산업안전보건법 제24조</td>
                <td className="p-3 font-bold text-blue-700 border-r border-slate-200">분기 1회 이상</td>
                <td className="p-3">사용자위원(대표/안전책임자), 근로자위원</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900 border-r border-slate-200">안전 및 보건 협의체</td>
                <td className="p-3 border-r border-slate-200">산업안전보건법 제64조</td>
                <td className="p-3 font-bold text-emerald-700 border-r border-slate-200">월 1회 이상</td>
                <td className="p-3">안전보건총괄책임자(이상욱), 협력업체 사업주/현장책임자</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900 border-r border-slate-200">작업 전 안전회의 (TBM)</td>
                <td className="p-3 border-r border-slate-200">고용노동부 지침</td>
                <td className="p-3 font-bold text-amber-700 border-r border-slate-200">매 작업 전 (일일)</td>
                <td className="p-3">관리감독자, 당일 작업 근로자 전원</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: 회의록 저장 팝업 (Exact matching Screenshot 2)                     */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 text-xs overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-2 border-b border-slate-200">
              <div>
                <div className="text-[10px] text-slate-800 font-bold uppercase">회의록 저장</div>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{getCategoryTitle()}</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-800 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-3.5">
              {/* 1. 년도 & 분기 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">년도</label>
                  <select
                    value={formYear}
                    onChange={e => setFormYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                  >
                    <option value="2026년">2026년</option>
                    <option value="2025년">2025년</option>
                    <option value="2024년">2024년</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {activeTab === 'subcontractor' ? '월' : '분기'}
                  </label>
                  <select
                    value={formQuarter}
                    onChange={e => setFormQuarter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                  >
                    {activeTab === 'subcontractor' ? (
                      Array.from({ length: 12 }, (_, i) => `${i + 1}월`).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))
                    ) : (
                      <>
                        <option value="1분기">1분기</option>
                        <option value="2분기">2분기</option>
                        <option value="3분기">3분기</option>
                        <option value="4분기">4분기</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* 2. 회의 날짜 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">회의 날짜</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono [color-scheme:dark]"
                />
              </div>

              {/* 3. 회의 제목 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">회의 제목 *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeTab === 'committee'
                      ? '예: 1분기 정기 산업안전보건위원회'
                      : '예: 8월 방송제작 협력업체 합동 안전보건 협의체 회의'
                  }
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium"
                />
              </div>

              {/* 4. 회의록 파일 업로드 박스 (Exact matching Screenshot 2) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  회의록 파일 <span className="text-slate-800 font-normal">(PDF, 이미지, 워드 등 · 선택)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.hwp"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-[#FF4B3E] rounded-2xl p-5 text-center cursor-pointer transition bg-slate-50 hover:bg-slate-50/80 space-y-1.5"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-800 mx-auto">
                    <UploadCloud className="w-5 h-5 text-sky-400" />
                  </div>
                  {uploadedFile ? (
                    <div className="space-y-0.5">
                      <span className="font-bold text-sky-400 text-xs block truncate px-2">{uploadedFile.name}</span>
                      <span className="text-[10px] text-slate-800 font-mono">({uploadedFile.size}) - 업로드 준비완료</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">파일을 선택하거나 드래그하세요</span>
                      <span className="text-[10px] text-slate-800">최대 20MB (PDF, 한글, 이미지)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="py-3 rounded-xl bg-slate-100 hover:bg-slate-700 text-slate-700 font-bold transition text-xs text-center"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black transition text-xs shadow-lg shadow-[#FF4B3E]/30 text-center"
                >
                  회의록 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: 회의록 열람 및 다운로드                                            */}
      {/* ========================================================================= */}
      {selectedMeetingForView && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 font-bold">
                  {selectedMeetingForView.year} {selectedMeetingForView.quarterOrPeriod}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{selectedMeetingForView.title}</h3>
              </div>
              <button onClick={() => setSelectedMeetingForView(null)} className="text-slate-800 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-800">
                <span>회의 일자:</span>
                <span className="text-slate-900 font-mono font-bold">{selectedMeetingForView.date}</span>
              </div>
              <div className="flex justify-between text-slate-800">
                <span>등록 일시:</span>
                <span className="text-slate-900 font-mono">{selectedMeetingForView.createdAt}</span>
              </div>
              {selectedMeetingForView.fileName && (
                <div className="flex justify-between text-slate-800">
                  <span>첨부 파일:</span>
                  <span className="text-sky-400 font-bold">{selectedMeetingForView.fileName} ({selectedMeetingForView.fileSize})</span>
                </div>
              )}
            </div>

            {selectedMeetingForView.fileDataUrl ? (
              <div className="pt-2">
                <a
                  href={selectedMeetingForView.fileDataUrl}
                  download={selectedMeetingForView.fileName || 'meeting_minutes.pdf'}
                  className="w-full py-3 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-center block shadow-lg shadow-[#FF4B3E]/30 transition"
                >
                  📥 첨부된 회의록 파일 다운로드
                </a>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-800">
                별도 첨부된 파일이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
