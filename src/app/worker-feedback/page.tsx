'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  Camera,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Filter,
  Search,
  Check,
  X,
  PenTool,
  FileText,
  Copy,
  Download,
  Printer,
  ExternalLink,
  Edit3,
  ShieldCheck,
  Smartphone,
  Laptop,
  Globe,
  Trash2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSafety } from '@/context/SafetyContext';
import { WorkerOpinion, OpinionStatus } from '@/types';
import SignaturePad from '@/components/common/SignaturePad';

export default function WorkerFeedbackAdminPage() {
  const { workerOpinions, updateOpinionStatus, resolveWorkerOpinion, deleteWorkerOpinion, serverIp, tunnelUrl } = useSafety();

  const [activeTab, setActiveTab] = useState<'qr' | 'list'>('qr');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('전체');
  const [selectedOpinionForAction, setSelectedOpinionForAction] = useState<WorkerOpinion | null>(null);

  const [origin, setOrigin] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showEditNoticeModal, setShowEditNoticeModal] = useState(false);
  const [qrMode, setQrMode] = useState<'tunnel' | 'ip' | 'local'>('tunnel');

  // Custom notice text in preview
  const [noticeTitle, setNoticeTitle] = useState('근로자 의견·제보');
  const [noticeSub, setNoticeSub] = useState('안전·보건 관련 의견을 남겨 주세요');
  const [noticeBody, setNoticeBody] = useState(
    '산업안전보건법에 따라 근로자의 의견을 청취하고 있습니다. 안전·보건과 관련된 제보, 개선 의견, 문의를 남겨 주세요.\n\n• 제보자 성명 및 연락처는 신속한 현장 확인 및 조치 안내를 위해 필수 작성 항목입니다.\n• 제출된 내용은 이상욱 안전관리 책임자에게 실시간 전달됩니다.\n• 긴급한 위험 상황은 즉시 관리감독자에게 직접 알려 주시기 바랍니다.'
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  let baseDomain = tunnelUrl || 'https://hourly-market-jan-strings.trycloudflare.com';
  if (qrMode === 'ip') {
    baseDomain = serverIp ? `http://${serverIp}:3000` : 'http://10.210.115.120:3000';
  } else if (qrMode === 'local') {
    baseDomain = origin || 'http://localhost:3000';
  }
  const qrUrl = `${baseDomain}/worker-report`;

  // Action form state
  const [actionContent, setActionContent] = useState('');
  const [actionOfficer, setActionOfficer] = useState('이상욱 안전관리 책임자');
  const [actionPhotoPreview, setActionPhotoPreview] = useState<string | null>(null);
  const [officerSignature, setOfficerSignature] = useState<string | null>(null);

  const handleActionPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setActionPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpinionForAction || !actionContent) {
      alert('조치 내용을 입력해 주세요.');
      return;
    }
    if (!officerSignature && !selectedOpinionForAction.officerSignature) {
      alert('안전관리 책임자 자필 승인 서명을 작성해 주세요.');
      return;
    }

    resolveWorkerOpinion(
      selectedOpinionForAction.id,
      actionContent,
      actionPhotoPreview ? [actionPhotoPreview] : (selectedOpinionForAction.actionPhotos || []),
      actionOfficer,
      officerSignature || selectedOpinionForAction.officerSignature
    );

    setSelectedOpinionForAction(null);
    setActionContent('');
    setActionPhotoPreview(null);
    setOfficerSignature(null);
    alert('위험 제보에 대한 조치 내용과 안전관리 책임자 자필 승인 서명이 등록되었습니다.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('worker-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = '스튜디오프리즘_근로자의견청취_QR.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredOpinions = workerOpinions.filter(o => {
    const matchSearch = o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.studioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.opinionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '전체' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: OpinionStatus) => {
    switch (status) {
      case '접수':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">접수됨</span>;
      case '확인중':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300">현장 확인중</span>;
      case '조치중':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#FF4B3E]/15 text-[#FF4B3E] border border-[#FF4B3E]/30">조치 진행중</span>;
      case '조치완료':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">조치완료</span>;
      case '반영불가':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800">반영불가</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const unresolvedCount = workerOpinions.filter(o => o.status !== '조치완료' && o.status !== '반영불가').length;

  return (
    <div className="space-y-6">
      {/* Header Bar matching Theme */}
      <div className="no-print pb-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <MessageSquareWarning className="w-7 h-7 text-rose-600" />
          근로자 의견청취 & 위험 제보
        </h1>
        <p className="text-xs sm:text-sm text-slate-800 mt-1">
          근로자가 안전·보건에 관한 제보·의견을 제출할 수 있는 전용 모바일 QR 코드를 관리하고 접수 내역을 확인 및 조치합니다.
        </p>

        {/* 2 Main Top Tabs */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition border ${
              activeTab === 'qr'
                ? 'bg-[#FF4B3E]/15 text-[#FF4B3E] border-[#FF4B3E]/30 shadow-xs'
                : 'bg-white text-slate-800 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#FF4B3E]" />
            <span>📢 모바일 제보 링크 & QR 관리</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition border ${
              activeTab === 'list'
                ? 'bg-[#FF4B3E]/15 text-[#FF4B3E] border-[#FF4B3E]/30 shadow-xs'
                : 'bg-white text-slate-800 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>의견 제출 내역</span>
            {unresolvedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                {unresolvedCount}건 미조치
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QR CODE & PUBLIC RECEPTION LINK VIEW                                */}
      {/* ========================================================================= */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: QR Code Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm flex flex-col items-center justify-between text-center space-y-6 text-slate-900">
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between text-xs text-[#FF4B3E]">
                <span className="font-black tracking-widest uppercase">STUDIO PRISM WORKER SAFETY QR</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                  실시간 연동
                </span>
              </div>

              {/* Target Mode Switcher */}
              <div className="p-1 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-3 gap-1 text-[10px] max-w-sm mx-auto">
                <button
                  onClick={() => setQrMode('tunnel')}
                  className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                    qrMode === 'tunnel' ? 'bg-[#FF4B3E] text-white shadow' : 'text-slate-800 hover:text-black'
                  }`}
                  title="스마트폰 LTE/5G 어디서나 스캔 가능 (경고창 없음)"
                >
                  <Globe className="w-3 h-3" />
                  <span>LTE/모바일 (추천)</span>
                </button>
                <button
                  onClick={() => setQrMode('ip')}
                  className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                    qrMode === 'ip' ? 'bg-[#FF4B3E] text-white shadow' : 'text-slate-800 hover:text-black'
                  }`}
                  title="사내 Wi-Fi IP 접속"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>사내 Wi-Fi</span>
                </button>
                <button
                  onClick={() => setQrMode('local')}
                  className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                    qrMode === 'local' ? 'bg-[#FF4B3E] text-white shadow' : 'text-slate-800 hover:text-black'
                  }`}
                  title="PC 브라우저 테스트"
                >
                  <Laptop className="w-3 h-3" />
                  <span>PC 브라우저</span>
                </button>
              </div>

              {/* Large High Quality QR Card */}
              <div className="bg-white p-6 rounded-3xl border-4 border-slate-200 shadow-2xl inline-block max-w-[260px] mx-auto">
                <QRCodeSVG
                  id="worker-qr-svg"
                  value={qrUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  📢 모바일 근로자 현장 위험 제보 QR
                </h2>
                <p className="text-xs text-slate-800 mt-1 max-w-sm mx-auto leading-relaxed">
                  산업안전보건법 및 스튜디오프리즘 안전관리 규정에 따라 근로자 의견을 청취합니다. 스마트폰으로 QR을 스캔하여 위험 요소를 제보해 주세요.
                </p>
              </div>

              {/* URL Display & Copy Box */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-2 max-w-md mx-auto text-left">
                <div className="truncate text-xs font-mono text-slate-800 font-bold select-all pl-2">
                  {qrUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1 shrink-0 transition shadow"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? '복사됨' : '링크 복사'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons: Image Save & Print & Direct Link */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-4 border-t border-slate-200 text-xs">
              <button
                onClick={handleDownloadQR}
                className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold transition"
              >
                <Download className="w-4 h-4 text-[#FF4B3E]" />
                <span>QR 이미지 저장</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold transition"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                <span>현장 게시용 인쇄</span>
              </button>

              <Link
                href="/worker-report"
                target="_blank"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs shadow-md shadow-[#FF4B3E]/30 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>📢 모바일 근로자 현장 위험 제보 접수창 열기</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Live Mobile Page Preview (Clean Pearl White Card) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF4B3E]" />
                모바일 제보 페이지 실시간 미리보기
              </span>
              <button
                onClick={() => setShowEditNoticeModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#FF4B3E]" />
                <span>안내 문구 수정</span>
              </button>
            </div>

            {/* Mobile Mockup Card */}
            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-4 sm:p-5 overflow-hidden max-w-md mx-auto shadow-inner">
              <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-md text-xs border border-slate-200">
                {/* Studio Prism Red Brand Header */}
                <div className="bg-[#FF4B3E] text-white p-5 text-center">
                  <div className="text-[10px] font-bold text-rose-100 mb-0.5">스튜디오프리즘 현장 안전 신문고</div>
                  <h3 className="text-base font-black tracking-tight">{noticeTitle}</h3>
                  <p className="text-[11px] text-rose-100 mt-0.5">{noticeSub}</p>
                </div>

                {/* Notice Box */}
                <div className="p-4 space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 leading-relaxed whitespace-pre-line">
                    {noticeBody}
                  </div>

                  {/* Mock Form Elements */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-slate-700 text-[10px] font-bold mb-1">제보 유형 선택</label>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="p-1.5 text-center bg-[#FF4B3E] text-white rounded-lg text-[10px] font-bold">위험요인</span>
                        <span className="p-1.5 text-center bg-slate-100 text-slate-800 rounded-lg text-[10px]">불편사항</span>
                        <span className="p-1.5 text-center bg-slate-100 text-slate-800 rounded-lg text-[10px]">개선의견</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 text-[10px] font-bold mb-1">제보자 성명 *</label>
                        <input
                          disabled
                          placeholder="성명 입력 (필수)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 text-[10px] font-bold mb-1">연락처 *</label>
                        <input
                          disabled
                          placeholder="010-0000-0000 (필수)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-[10px] font-bold mb-1">위험 제보 내용 *</label>
                      <textarea
                        disabled
                        rows={2}
                        placeholder="안전·보건과 관련된 내용을 구체적으로 적어 주세요."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 text-xs resize-none"
                      />
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-800 font-bold flex items-center justify-center gap-1">
                        <PenTool className="w-3 h-3 text-[#FF4B3E]" />
                        근로자 자필 서명 영역
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        disabled
                        className="w-full py-2.5 bg-[#FF4B3E] text-white font-black rounded-xl text-xs text-center shadow-sm"
                      >
                        위험 제보 접수하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUBMISSIONS & ADMIN RESOLUTION MANAGEMENT                           */}
      {/* ========================================================================= */}
      {activeTab === 'list' && (
        <div className="space-y-5">
          {/* Filter and Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="제목, 내용, 스튜디오, 제보번호 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
              {['전체', '접수', '확인중', '조치중', '조치완료'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    statusFilter === status
                      ? 'bg-[#FF4B3E] text-white shadow-xs'
                      : 'text-slate-800 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Opinions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredOpinions.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-slate-800 font-bold bg-white border border-slate-200 rounded-2xl">
                해당 상태의 근로자 제보 내역이 없습니다.
              </div>
            ) : (
              filteredOpinions.map(opinion => (
                <div
                  key={opinion.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition ${
                    opinion.status === '조치완료' ? 'border-slate-200 hover:border-slate-300' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#FF4B3E] font-bold text-xs">{opinion.opinionNumber}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                          opinion.opinionType === '위험요인' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          opinion.opinionType === '안전시설 요청' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          'bg-blue-100 text-blue-800 border border-[#FF4B3E]/30'
                        }`}>
                          {opinion.opinionType}
                        </span>
                      </div>
                      <div>{getStatusBadge(opinion.status)}</div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900">{opinion.title}</h3>
                      <div className="text-xs text-slate-800 mt-1 flex items-center gap-2">
                        <span className="font-bold text-slate-800">{opinion.studioName}</span>
                        <span>·</span>
                        <span>제보자: {opinion.authorName}</span>
                        <span>·</span>
                        <span>{opinion.createdAt}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                      {opinion.content}
                    </p>

                    {/* Attached Photo Preview */}
                    {opinion.photos && opinion.photos.length > 0 && (
                      <div>
                        <span className="text-[10px] text-slate-800 font-bold block mb-1">첨부된 현장 사진:</span>
                        <div className="flex gap-2 overflow-x-auto py-1">
                          {opinion.photos.map((p, idx) => (
                            <img
                              key={idx}
                              src={p}
                              alt="현장 제보 사진"
                              className="h-20 w-28 object-cover rounded-xl border border-slate-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Worker Signature */}
                    {opinion.workerSignature && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="text-slate-800 font-bold">제보자 자필 확인:</span>
                        <img
                          src={opinion.workerSignature}
                          alt="제보자 서명"
                          className="h-8 max-w-[120px] object-contain"
                        />
                      </div>
                    )}

                    {/* Action Resolution Box if Completed */}
                    {opinion.status === '조치완료' && opinion.actionContent && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between text-emerald-800 font-black">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            현장 조치 완료 내역
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700">{opinion.actionDate}</span>
                        </div>
                        <p className="text-emerald-950 font-medium whitespace-pre-line leading-relaxed">
                          {opinion.actionContent}
                        </p>
                        <div className="text-[11px] text-emerald-800 font-bold flex items-center justify-between pt-1 border-t border-emerald-200/60">
                          <span>조치 담당: {opinion.actionOfficer || '이상욱 안전관리 책임자'}</span>
                          {opinion.officerSignature && (
                            <img
                              src={opinion.officerSignature}
                              alt="책임자 서명"
                              className="h-7 max-w-[100px] object-contain"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 mt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {opinion.status !== '조치완료' ? (
                        <button
                          onClick={() => {
                            setSelectedOpinionForAction(opinion);
                            setActionContent('');
                            setActionPhotoPreview(null);
                            setOfficerSignature(null);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs shadow-sm flex items-center gap-1 transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>현장 조치결과 등록</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedOpinionForAction(opinion);
                            setActionContent(opinion.actionContent || '');
                            setActionPhotoPreview(opinion.actionPhotos?.[0] || null);
                            setOfficerSignature(opinion.officerSignature || null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition"
                        >
                          조치내용 수정
                        </button>
                      )}

                      <select
                        value={opinion.status}
                        onChange={e => updateOpinionStatus(opinion.id, e.target.value as OpinionStatus)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 text-xs font-bold focus:outline-none"
                      >
                        <option value="접수">접수</option>
                        <option value="확인중">확인중</option>
                        <option value="조치중">조치중</option>
                        <option value="조치완료">조치완료</option>
                        <option value="반영불가">반영불가</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`'${opinion.title}' 제보를 삭제하시겠습니까?`)) {
                          deleteWorkerOpinion(opinion.id);
                        }
                      }}
                      className="p-1.5 text-slate-800 hover:text-rose-600 transition"
                      title="제보 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Action Resolution Modal */}
      {selectedOpinionForAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                <ShieldCheck className="w-5 h-5 text-[#FF4B3E]" />
                <span>현장 조치결과 및 서명 등록</span>
              </div>
              <button
                onClick={() => setSelectedOpinionForAction(null)}
                className="text-slate-800 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedOpinionForAction.title}</div>
              <div className="text-slate-800">장소: {selectedOpinionForAction.studioName} | 제보자: {selectedOpinionForAction.authorName}</div>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">현장 조치 내용 및 개선 결과 *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="위험요인 제거 및 현장 안전조치 결과를 상세히 작성해 주세요"
                  value={actionContent}
                  onChange={e => setActionContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-xs focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">조치 담당 안전관리자 *</label>
                <input
                  type="text"
                  required
                  value={actionOfficer}
                  onChange={e => setActionOfficer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold text-xs focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">조치 후 현장 사진 (선택)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleActionPhotoUpload}
                  className="w-full text-xs text-slate-800 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FF4B3E]/15 file:text-[#FF4B3E] hover:file:bg-blue-100"
                />
                {actionPhotoPreview && (
                  <img
                    src={actionPhotoPreview}
                    alt="조치 사진"
                    className="mt-2 h-24 rounded-xl border border-slate-200 object-cover"
                  />
                )}
              </div>

              <div className="pt-2 border-t border-slate-200">
                <SignaturePad
                  title="안전관리 책임자 자필 승인 서명 (필수)"
                  placeholderText="조치 결과를 확인하고 자필 서명해 주세요"
                  onChange={data => setOfficerSignature(data)}
                  height={110}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs rounded-xl shadow-md shadow-[#FF4B3E]/30 transition"
                >
                  조치완료 등록 및 저장
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOpinionForAction(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Text Edit Modal */}
      {showEditNoticeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-black text-base text-slate-900">모바일 안내 문구 편집</span>
              <button onClick={() => setShowEditNoticeModal(false)} className="text-slate-800 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">상단 제목</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={e => setNoticeTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">부제목</label>
                <input
                  type="text"
                  value={noticeSub}
                  onChange={e => setNoticeSub(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">상세 안내 본문</label>
                <textarea
                  rows={5}
                  value={noticeBody}
                  onChange={e => setNoticeBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setShowEditNoticeModal(false);
                alert('모바일 안내 문구가 성공적으로 업데이트되었습니다.');
              }}
              className="w-full py-2.5 bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs rounded-xl shadow transition"
            >
              저장 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
