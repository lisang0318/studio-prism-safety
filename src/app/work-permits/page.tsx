'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Trash2,
  AlertTriangle,
  Flame,
  Building,
  Calendar,
  X,
  QrCode,
  Download,
  Copy,
  Check,
  Edit3,
  ExternalLink,
  ShieldAlert,
  HardHat,
  FileText,
  Smartphone,
  Laptop,
  Globe,
  Tag
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSafety } from '@/context/SafetyContext';
import { WorkPermit, PermitStatus, BroadcastWorkType, RiskLevel, WorkPermitTemplate } from '@/types';

function WorkPermitsContent() {
  const searchParams = useSearchParams();
  const {
    workPermits,
    addWorkPermit,
    updatePermitStatus,
    approveWorkPermit,
    deleteWorkPermit,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    serverIp,
    tunnelUrl
  } = useSafety();

  const [activeTab, setActiveTab] = useState<'templates' | 'submissions'>('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('전체');
  const [studioFilter, setStudioFilter] = useState<string>('전체');

  const [origin, setOrigin] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkPermitTemplate | null>(null);
  const [showEditGuideModal, setShowEditGuideModal] = useState(false);
  const [selectedPermitForPdf, setSelectedPermitForPdf] = useState<WorkPermit | null>(null);
  const [qrMode, setQrMode] = useState<'tunnel' | 'ip' | 'local'>('tunnel');

  // Guide text in right card
  const [guideTitle, setGuideTitle] = useState('접근 및 작업 허가 QR');
  const [guideText, setGuideText] = useState(
    '본 사업장은 안전작업 허가제 시행 구역입니다.\n작업 전 반드시 QR코드를 스캔하여 허가서를 제출하고 승인을 받은 후 작업을 시작해 주시기 바랍니다.'
  );

  // New Template Form State
  const [newTemplateForm, setNewTemplateForm] = useState({
    title: '',
    workType: '',
    riskLevel: '고위험' as RiskLevel,
    description: '',
    hazards: '작업 중 부주의로 인한 안전사고, 안전통제선 미준수',
    safetyMeasures: '작업 전 특별안전교육 및 TBM 실시, 안전관리 수칙 준수',
    requiredPPE: ['안전모', '안전화']
  });

  // Edit Template Form State
  const [editTemplateForm, setEditTemplateForm] = useState({
    title: '',
    workType: '',
    riskLevel: '고위험' as RiskLevel,
    description: '',
    hazards: '',
    safetyMeasures: '',
    requiredPPE: [] as string[]
  });

  const availablePPEList = ['안전모', '안전화', '안전대(하네스)', '방염복', '보안경', '방진마스크', '방독마스크', '절연장갑', '절연안전화', '무전기', '야광조끼', '귀마개'];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
    if (searchParams.get('tab') === 'submissions') {
      setActiveTab('submissions');
    }
  }, [searchParams]);

  // Determine base domain based on selected mode
  const isCloudDomain = typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
  const cloudOrigin = (typeof window !== 'undefined' && isCloudDomain) ? window.location.origin : 'https://studio-prism-safety.onrender.com';

  let baseDomain = isCloudDomain ? cloudOrigin : (tunnelUrl || 'https://studio-prism-safety.onrender.com');
  if (!isCloudDomain) {
    if (qrMode === 'ip') {
      baseDomain = serverIp ? `http://${serverIp}:3000` : 'http://10.210.115.120:3000';
    } else if (qrMode === 'local') {
      baseDomain = origin || 'http://localhost:3000';
    }
  }
  const qrApplyUrl = `${baseDomain}/work-permit-apply`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrApplyUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('permit-qr-svg');
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
        downloadLink.download = '스튜디오프리즘_안전작업허가_접근QR.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTogglePPE = (ppe: string) => {
    setNewTemplateForm(prev => {
      const exists = prev.requiredPPE.includes(ppe);
      return {
        ...prev,
        requiredPPE: exists
          ? prev.requiredPPE.filter(item => item !== ppe)
          : [...prev.requiredPPE, ppe]
      };
    });
  };

  const handleCreateTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateForm.title || !newTemplateForm.workType) {
      alert('양식명과 신규 작업유형 명칭을 입력해 주세요.');
      return;
    }

    const hazardsArray = newTemplateForm.hazards
      .split(/,|\n/)
      .map(s => s.trim())
      .filter(Boolean);

    const measuresArray = newTemplateForm.safetyMeasures
      .split(/,|\n/)
      .map(s => s.trim())
      .filter(Boolean);

    addTemplate({
      title: newTemplateForm.title,
      workType: newTemplateForm.workType,
      riskLevel: newTemplateForm.riskLevel,
      description: newTemplateForm.description || `${newTemplateForm.workType} 작업 시 안전점검 양식`,
      hazards: hazardsArray.length > 0 ? hazardsArray : ['작업 중 안전사고 위험'],
      safetyMeasures: measuresArray.length > 0 ? measuresArray : ['안전수칙 준수 및 안전장구 착용'],
      requiredPPE: newTemplateForm.requiredPPE.length > 0 ? newTemplateForm.requiredPPE : ['안전모', '안전화']
    });

    setShowCreateModal(false);
    setNewTemplateForm({
      title: '',
      workType: '',
      riskLevel: '고위험',
      description: '',
      hazards: '작업 중 부주의로 인한 안전사고, 안전통제선 미준수',
      safetyMeasures: '작업 전 특별안전교육 및 TBM 실시, 안전관리 수칙 준수',
      requiredPPE: ['안전모', '안전화']
    });

    alert('신규 작업유형 허가서 양식이 성공적으로 추가되었습니다!\n모바일 QR 신청창에서도 즉시 선택할 수 있습니다.');
  };

  const handleOpenEditTemplateModal = (tmpl: WorkPermitTemplate) => {
    setEditingTemplate(tmpl);
    setEditTemplateForm({
      title: tmpl.title,
      workType: tmpl.workType,
      riskLevel: tmpl.riskLevel,
      description: tmpl.description || '',
      hazards: tmpl.hazards.join('\n'),
      safetyMeasures: tmpl.safetyMeasures.join('\n'),
      requiredPPE: [...tmpl.requiredPPE]
    });
    setShowEditTemplateModal(true);
  };

  const handleToggleEditPPE = (ppe: string) => {
    setEditTemplateForm(prev => ({
      ...prev,
      requiredPPE: prev.requiredPPE.includes(ppe)
        ? prev.requiredPPE.filter(p => p !== ppe)
        : [...prev.requiredPPE, ppe]
    }));
  };

  const handleEditTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    if (!editTemplateForm.title.trim() || !editTemplateForm.workType.trim()) {
      alert('양식 제목과 작업유형 명칭을 입력해 주세요.');
      return;
    }

    const hazardsArray = editTemplateForm.hazards
      .split(/[\n,]/)
      .map(s => s.trim())
      .filter(Boolean);

    const measuresArray = editTemplateForm.safetyMeasures
      .split(/[\n,]/)
      .map(s => s.trim())
      .filter(Boolean);

    updateTemplate(editingTemplate.id, {
      title: editTemplateForm.title.trim(),
      workType: editTemplateForm.workType.trim(),
      riskLevel: editTemplateForm.riskLevel,
      description: editTemplateForm.description.trim(),
      hazards: hazardsArray.length > 0 ? hazardsArray : ['작업 중 안전사고 위험'],
      safetyMeasures: measuresArray.length > 0 ? measuresArray : ['안전수칙 준수 및 안전장구 착용'],
      requiredPPE: editTemplateForm.requiredPPE.length > 0 ? editTemplateForm.requiredPPE : ['안전모', '안전화']
    });

    setShowEditTemplateModal(false);
    setEditingTemplate(null);
    alert(`'${editTemplateForm.title}' 양식이 성공적으로 수정되었습니다.\n모바일 신청창에도 수정 내용이 즉시 반영됩니다.`);
  };

  const filteredPermits = workPermits.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.permitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.productionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.managerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '전체' || p.status === statusFilter;
    const matchStudio = studioFilter === '전체' || p.studioName.includes(studioFilter);
    return matchSearch && matchStatus && matchStudio;
  });

  const getStatusBadge = (status: PermitStatus) => {
    switch (status) {
      case '승인완료':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">승인완료</span>;
      case '작업진행중':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FF4B3E]/150/20 text-blue-700 border border-[#FF4B3E]/30 animate-pulse">작업진행중</span>;
      case '승인대기':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 border border-amber-500/30">승인대기</span>;
      case '작업완료':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-700">작업완료</span>;
      case '반려':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-700 border border-rose-500/30">반려됨</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const pendingCount = workPermits.filter(p => p.status === '승인대기').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="no-print pb-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <FileCheck2 className="w-7 h-7 text-[#FF4B3E]" />
          안전작업 허가서 관리
        </h1>
        <p className="text-xs sm:text-sm text-slate-800 mt-1">
          작업허가서 양식·접근 QR을 관리하고 제출된 내역을 확인합니다. 외부 작업자는 사이트 로그인 없이 QR로만 신청하고 서명합니다.
        </p>

        {/* 2 Main Top Tabs matching Screenshot */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition border ${
              activeTab === 'submissions'
                ? 'bg-[#FF4B3E]/15 text-[#FF4B3E] border-[#FF4B3E]/30 shadow-xs'
                : 'bg-white text-slate-800 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>허가서 제출 내역</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                {pendingCount}건 대기
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition border ${
              activeTab === 'templates'
                ? 'bg-[#FF4B3E]/15 text-[#FF4B3E] border-[#FF4B3E]/30 shadow-xs'
                : 'bg-white text-slate-800 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#FF4B3E]" />
            <span>허가서 양식·접근 QR</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PERMIT TEMPLATES & ACCESS QR                                       */}
      {/* ========================================================================= */}
      {activeTab === 'templates' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">허가서 양식·접근 QR ({templates.length}종 등록됨)</h2>
              <p className="text-xs text-slate-800 mt-0.5">
                원하는 신규 작업유형을 자유롭게 추가할 수 있으며, 외부 작업자가 스캔할 모바일 접근 QR에 즉시 반영됩니다.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white text-xs font-black shadow-md shadow-[#FF4B3E]/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ 새 작업유형 및 양식 추가</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Registered Form Templates List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map(tmpl => (
                  <div
                    key={tmpl.id}
                    className={`border rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition ${
                      tmpl.isCustom ? 'bg-indigo-950/30 border-indigo-700/60 hover:border-indigo-500' : 'bg-slate-100 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                          tmpl.riskLevel === '고위험' ? 'bg-rose-500/20 text-rose-700 border border-rose-500/30' :
                          tmpl.riskLevel === '중위험' ? 'bg-amber-500/20 text-amber-700 border border-amber-500/30' :
                          'bg-[#FF4B3E]/150/20 text-blue-700 border border-[#FF4B3E]/30'
                        }`}>
                          {tmpl.riskLevel}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditTemplateModal(tmpl)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-700 text-sky-400 hover:text-slate-900 rounded-lg text-[10px] font-bold border border-slate-200 flex items-center gap-1 transition"
                            title="양식 내용 수정"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>수정</span>
                          </button>
                          {tmpl.isCustom ? (
                            <button
                              onClick={() => {
                                if (confirm(`'${tmpl.title}' 양식을 삭제하시겠습니까?`)) {
                                  deleteTemplate(tmpl.id);
                                }
                              }}
                              className="p-1 text-slate-800 hover:text-rose-700 transition"
                              title="양식 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <h3 className="text-sm font-black text-slate-900">{tmpl.title}</h3>
                      <div className="text-[11px] text-sky-400 font-bold flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>작업유형: {tmpl.workType}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed line-clamp-2">
                        {tmpl.description}
                      </p>

                      <div className="space-y-1 pt-2 border-t border-slate-200 text-[11px]">
                        <div className="text-rose-700 font-medium line-clamp-1">
                          ● 주요위험: {tmpl.hazards.join(', ')}
                        </div>
                        <div className="text-emerald-700 font-medium line-clamp-1">
                          ● 안전조치: {tmpl.safetyMeasures.join(', ')}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {tmpl.requiredPPE.map((p, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-50 text-sky-300 rounded border border-slate-200">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <Link
                        href={`/work-permit-apply?template=${tmpl.id}`}
                        target="_blank"
                        className="w-full text-center py-2 rounded-xl bg-[#FF4B3E]/15 hover:bg-[#FF4B3E] text-[#FF4B3E] hover:text-white font-bold text-xs transition border border-[#FF4B3E]/30"
                      >
                        이 양식으로 모바일 신청창 열기
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Access QR Code Card */}
            <div className="space-y-4">
              <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-between text-center space-y-6">
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-800">
                    <span className="font-bold">외부 작업자 접근 QR</span>
                    <button
                      onClick={() => setShowEditGuideModal(true)}
                      className="text-slate-800 hover:text-slate-900 flex items-center gap-1 text-[11px]"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                      편집
                    </button>
                  </div>

                  {/* QR Target Mode Selector */}
                  <div className="p-1 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-3 gap-1 text-[10px]">
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

                  {/* High Quality QR SVG */}
                  <div className="bg-white p-5 rounded-3xl border-4 border-slate-200 shadow-2xl inline-block mx-auto">
                    <QRCodeSVG
                      id="permit-qr-svg"
                      value={qrApplyUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
                      <span>{guideTitle}</span>
                      <button onClick={() => setShowEditGuideModal(true)} className="text-slate-800 hover:text-sky-400">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </h3>
                    <p className="text-xs text-slate-800 mt-2 leading-relaxed whitespace-pre-line px-2">
                      {guideText}
                    </p>
                  </div>

                  {/* URL copy box */}
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between gap-2 text-left">
                    <div className="truncate text-[11px] font-mono text-sky-300 select-all pl-2">
                      {qrApplyUrl}
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1 shrink-0 transition"
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? '복사됨' : '복사'}</span>
                    </button>
                  </div>
                </div>

                {/* Buttons: Save & Print */}
                <div className="w-full space-y-2 pt-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadQR}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-700 text-slate-800 border border-slate-200 font-bold text-xs transition"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>저장 (PNG)</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-700 text-slate-800 border border-slate-200 font-bold text-xs transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-700" />
                      <span>인쇄</span>
                    </button>
                  </div>

                  <Link
                    href="/work-permit-apply"
                    target="_blank"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs shadow-lg shadow-[#FF4B3E]/30 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>작업자 전용 모바일 신청창 열기</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUBMISSIONS LIST TABLE                                              */}
      {/* ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h2 className="text-xl font-black text-slate-900">허가서 제출 내역</h2>
              <p className="text-xs text-slate-800 mt-0.5">
                모바일 QR로 작업자가 제출한 허가서 및 자필 서약 서명을 확인하고 승인합니다.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="작업명, 허가번호, 책임자, 업체명 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#FF4B3E]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs overflow-x-auto max-w-full">
                {['전체', '승인대기', '승인완료', '작업진행중', '작업완료'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                      statusFilter === status
                        ? 'bg-[#FF4B3E] text-white shadow-xs'
                        : 'text-slate-800 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <select
                value={studioFilter}
                onChange={e => setStudioFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-bold"
              >
                <option value="전체">모든 스튜디오</option>
                <option value="탄현">탄현 스튜디오</option>
                <option value="일산">일산 대형세트</option>
                <option value="문경">문경 오픈세트</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
                <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">작업 종류</th>
                    <th className="px-5 py-4">작업 및 촬영 일시</th>
                    <th className="px-5 py-4">작업명 / 업체명</th>
                    <th className="px-5 py-4">작업책임자 (자필서명)</th>
                    <th className="px-5 py-4">제출 일시</th>
                    <th className="px-5 py-4 text-center">상태</th>
                    <th className="px-5 py-4 text-right">관리·승인</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-medium">
                  {filteredPermits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-slate-800 font-bold">
                        기록이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredPermits.map(permit => (
                      <tr key={permit.id} className="hover:bg-slate-100/50 transition group">
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            permit.riskLevel === '고위험' ? 'bg-rose-500/20 text-rose-700 border border-rose-500/30' :
                            permit.riskLevel === '중위험' ? 'bg-amber-500/20 text-amber-700 border border-amber-500/30' :
                            'bg-[#FF4B3E]/150/20 text-blue-700 border border-[#FF4B3E]/30'
                          }`}>
                            {permit.workType}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px]">
                          <div className="font-bold text-slate-900">{permit.startDate.slice(0, 16)}</div>
                          <div className="text-slate-800">~ {permit.endDate.slice(11, 16)}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">{permit.title}</div>
                          <div className="text-slate-800 text-xs mt-0.5">{permit.studioName} · {permit.contractorName} ({permit.workerCount}명)</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-800">{permit.managerName}</div>
                          <div className="text-slate-800 text-[11px] font-mono">{permit.managerContact}</div>
                          {permit.managerSignature && (
                            <span className="text-[10px] text-emerald-700 font-bold">● 자필 서약 완료</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-800 font-mono text-[11px]">
                          {permit.createdAt}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {getStatusBadge(permit.status)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedPermitForPdf(permit)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-700 text-sky-400 hover:text-slate-900 border border-slate-200 font-bold text-xs flex items-center gap-1 transition"
                              title="PDF 정식 서류 미리보기"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                            <Link
                              href={`/work-permits/${permit.id}`}
                              className="px-3 py-1.5 rounded-lg bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1 shadow-md transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{permit.status === '승인대기' ? '자필 승인하기' : '상세·QR'}</span>
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm('이상욱 안전관리 책임자 권한으로 이 허가서를 영구 삭제하시겠습니까?')) {
                                  deleteWorkPermit(permit.id);
                                }
                              }}
                              className="p-1.5 text-slate-800 hover:text-rose-700 transition"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Guide Text Modal */}
      {showEditGuideModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-black text-slate-900">접근 QR 안내 문구 편집</h3>
              <button onClick={() => setShowEditGuideModal(false)} className="text-slate-800 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">제목</label>
                <input
                  type="text"
                  value={guideTitle}
                  onChange={e => setGuideTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">안내 본문 내용</label>
                <textarea
                  rows={4}
                  value={guideText}
                  onChange={e => setGuideText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditGuideModal(false)}
                  className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black"
                >
                  적용 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Custom Work Type & Template */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  새 작업유형 및 허가서 양식 등록
                </h3>
                <p className="text-xs text-slate-800 mt-0.5">
                  직접 정의한 작업유형과 안전수칙이 모바일 QR 신청서의 선택지에 영구 추가됩니다.
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-800 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">양식 제목 (표시명) *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 수중 촬영 및 대형 수영장 세트 작업허가서"
                    value={newTemplateForm.title}
                    onChange={e => setNewTemplateForm({ ...newTemplateForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">위험 등급 *</label>
                  <select
                    value={newTemplateForm.riskLevel}
                    onChange={e => setNewTemplateForm({ ...newTemplateForm, riskLevel: e.target.value as RiskLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                  >
                    <option value="고위험">🔥 고위험</option>
                    <option value="중위험">⚠️ 중위험</option>
                    <option value="저위험">ℹ️ 저위험</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-sky-400 mb-1">새 작업유형 명칭 (시스템 분류명) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 수중 촬영·수영장 세트 또는 크레인 카메라·와이어캠"
                  value={newTemplateForm.workType}
                  onChange={e => setNewTemplateForm({ ...newTemplateForm, workType: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-600/50 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">양식 상세 설명 (선택)</label>
                <textarea
                  rows={2}
                  placeholder="작업 내용 및 적용 범위에 대한 설명을 간략히 적어 주세요."
                  value={newTemplateForm.description}
                  onChange={e => setNewTemplateForm({ ...newTemplateForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-rose-700 mb-1">주요 위험요인 (쉼표 또는 줄바꿈으로 구분)</label>
                  <textarea
                    rows={3}
                    placeholder="예: 수중 감전 위험, 저체온증 발생, 구명장비 미비"
                    value={newTemplateForm.hazards}
                    onChange={e => setNewTemplateForm({ ...newTemplateForm, hazards: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-700 mb-1">필수 준수 안전조치사항 (쉼표 또는 줄바꿈으로 구분)</label>
                  <textarea
                    rows={3}
                    placeholder="예: 수중 안전요원 2명 상주, 수중 조명 누전차단기 시험, 온수 샤워실 확보"
                    value={newTemplateForm.safetyMeasures}
                    onChange={e => setNewTemplateForm({ ...newTemplateForm, safetyMeasures: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
              </div>

              {/* PPE Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">필수 착용 개인보호구 선택</label>
                <div className="flex flex-wrap gap-1.5">
                  {availablePPEList.map(ppe => {
                    const isSelected = newTemplateForm.requiredPPE.includes(ppe);
                    return (
                      <button
                        key={ppe}
                        type="button"
                        onClick={() => handleTogglePPE(ppe)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#FF4B3E] text-white shadow-md'
                            : 'bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : null}
                        <span>{ppe}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black shadow-lg shadow-[#FF4B3E]/30"
                >
                  신규 작업유형 및 양식 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditTemplateModal && editingTemplate && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-sky-400" />
                  <span>작업허가서 양식 내용 수정</span>
                </h3>
                <div className="text-xs text-slate-800 mt-0.5">
                  양식의 위험 등급, 유해위험요인, 안전조치사항 및 필수 보호구를 수정합니다.
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditTemplateModal(false);
                  setEditingTemplate(null);
                }}
                className="text-slate-800 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditTemplateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">양식 제목 (표시명) *</label>
                  <input
                    type="text"
                    required
                    placeholder="양식 제목을 입력하세요"
                    value={editTemplateForm.title}
                    onChange={e => setEditTemplateForm({ ...editTemplateForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">위험 등급 *</label>
                  <select
                    value={editTemplateForm.riskLevel}
                    onChange={e => setEditTemplateForm({ ...editTemplateForm, riskLevel: e.target.value as RiskLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                  >
                    <option value="고위험">🔥 고위험</option>
                    <option value="중위험">⚠️ 중위험</option>
                    <option value="저위험">ℹ️ 저위험</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-sky-400 mb-1">작업유형 명칭 (시스템 분류명) *</label>
                <input
                  type="text"
                  required
                  placeholder="작업유형 분류명을 입력하세요"
                  value={editTemplateForm.workType}
                  onChange={e => setEditTemplateForm({ ...editTemplateForm, workType: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-600/50 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">양식 상세 설명 (선택)</label>
                <textarea
                  rows={2}
                  placeholder="작업 내용 및 적용 범위에 대한 설명"
                  value={editTemplateForm.description}
                  onChange={e => setEditTemplateForm({ ...editTemplateForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-rose-700 mb-1">주요 위험요인 (줄바꿈 또는 쉼표 구분)</label>
                  <textarea
                    rows={4}
                    placeholder="위험요인을 입력하세요"
                    value={editTemplateForm.hazards}
                    onChange={e => setEditTemplateForm({ ...editTemplateForm, hazards: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-700 mb-1">필수 준수 안전조치사항 (줄바꿈 또는 쉼표 구분)</label>
                  <textarea
                    rows={4}
                    placeholder="필수 준수 조치사항을 입력하세요"
                    value={editTemplateForm.safetyMeasures}
                    onChange={e => setEditTemplateForm({ ...editTemplateForm, safetyMeasures: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
              </div>

              {/* PPE Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">필수 착용 개인보호구 선택</label>
                <div className="flex flex-wrap gap-1.5">
                  {availablePPEList.map(ppe => {
                    const isSelected = editTemplateForm.requiredPPE.includes(ppe);
                    return (
                      <button
                        key={ppe}
                        type="button"
                        onClick={() => handleToggleEditPPE(ppe)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#FF4B3E] text-white shadow-md'
                            : 'bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : null}
                        <span>{ppe}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTemplateModal(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black shadow-lg shadow-[#FF4B3E]/30"
                >
                  수정사항 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Fullscreen PDF Document Modal */}
      {selectedPermitForPdf && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 my-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <FileText className="w-5 h-5 text-sky-400" />
                <span>정식 안전작업허가서 (PDF 미리보기)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>인쇄 / PDF 저장</span>
                </button>
                <button
                  onClick={() => setSelectedPermitForPdf(null)}
                  className="p-1.5 text-slate-800 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-300 text-xs space-y-4">
              {/* Header with Top-Right Dual Approval Box */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-slate-900 gap-4">
                <div>
                  <div className="text-[10px] font-black tracking-widest text-slate-800 uppercase">STUDIO PRISM SAFETY WORK PERMIT</div>
                  <h2 className="text-2xl font-black text-slate-900">안 전 작 업 허 가 서</h2>
                  <div className="text-xs font-mono font-bold text-blue-800 mt-0.5">{selectedPermitForPdf.permitNumber}</div>
                </div>

                {/* Top-Right Dual Signature Box */}
                <div className="border-2 border-slate-900 rounded-xl overflow-hidden text-center text-[10px] shrink-0 bg-white shadow-sm">
                  <table className="text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-900 text-[11px]">
                        <th className="px-4 py-1.5 border-r border-slate-900 w-28">제출자 (제작진)</th>
                        <th className="px-4 py-1.5 w-28">승인자 (안전관리자)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="h-16 border-b border-slate-300">
                        <td className="px-2 py-1 border-r border-slate-900 align-middle bg-slate-50">
                          {selectedPermitForPdf.managerSignature ? (
                            <div className="flex flex-col items-center justify-center">
                              <img src={selectedPermitForPdf.managerSignature} alt="제출자 서명" className="h-10 object-contain" />
                              <span className="text-[9px] text-slate-800 font-bold">{selectedPermitForPdf.managerName}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-800 font-bold">{selectedPermitForPdf.managerName}</span>
                          )}
                        </td>
                        <td className="px-2 py-1 align-middle bg-slate-50">
                          {selectedPermitForPdf.officerSignature ? (
                            <div className="flex flex-col items-center justify-center">
                              <img src={selectedPermitForPdf.officerSignature} alt="승인 서명" className="h-10 object-contain" />
                              <span className="text-[9px] text-emerald-700 font-bold">이상욱(인)</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-bold">[승인 대기중]</span>
                          )}
                        </td>
                      </tr>
                      <tr className="text-[9px] text-slate-800 font-mono bg-slate-100/60">
                        <td className="py-0.5 border-r border-slate-900">{selectedPermitForPdf.createdAt.slice(0, 10)}</td>
                        <td className="py-0.5">{selectedPermitForPdf.approvedAt ? selectedPermitForPdf.approvedAt.slice(0, 10) : '승인 대기'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Details Table */}
              <table className="w-full text-xs text-left border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">작업명</th>
                    <td className="p-2 font-black text-slate-900" colSpan={3}>{selectedPermitForPdf.title}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">작품명</th>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{selectedPermitForPdf.productionName}</td>
                    <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">작업장소</th>
                    <td className="p-2 font-bold text-slate-900">{selectedPermitForPdf.studioName}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">시공업체</th>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{selectedPermitForPdf.contractorName}</td>
                    <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">책임자</th>
                    <td className="p-2 font-bold text-slate-900">{selectedPermitForPdf.managerName} ({selectedPermitForPdf.managerContact})</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">작업인원</th>
                    <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{selectedPermitForPdf.workerCount}명</td>
                    <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">작업일시</th>
                    <td className="p-2 font-mono font-bold text-blue-900">
                      {selectedPermitForPdf.startDate} ~ {selectedPermitForPdf.endDate}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">작업유형</th>
                    <td className="p-2 font-bold text-slate-900" colSpan={3}>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold mr-1.5">
                        [{selectedPermitForPdf.riskLevel}]
                      </span>
                      {selectedPermitForPdf.workType}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Hazards and Measures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="font-black text-rose-800 block mb-1">● 주요 위험요인</span>
                  <ul className="space-y-0.5 text-rose-950 font-medium">
                    {selectedPermitForPdf.hazards.map((h, idx) => (
                      <li key={idx}>- {h}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="font-black text-emerald-800 block mb-1">● 현장 필수 안전조치사항</span>
                  <ul className="space-y-0.5 text-emerald-950 font-medium">
                    {selectedPermitForPdf.safetyMeasures.map((m, idx) => (
                      <li key={idx}>- {m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PPE */}
              <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-xl flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-700 text-[11px]">필수 착용 보호구:</span>
                {selectedPermitForPdf.requiredPPE.map((ppe, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-800">
                    ✓ {ppe}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-800 font-medium space-y-0.5">
                <div>스튜디오프리즘 안전관리단 | 이상욱 안전관리 책임자 (010-6670-3534)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkPermitsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-800 font-bold">로딩 중...</div>}>
      <WorkPermitsContent />
    </Suspense>
  );
}
