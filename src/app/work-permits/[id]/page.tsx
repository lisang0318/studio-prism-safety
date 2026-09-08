'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileCheck2,
  ArrowLeft,
  Printer,
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Shield,
  Clock,
  Building,
  User,
  Phone,
  HardHat,
  Share2,
  PenTool,
  X,
  FileText,
  Download,
  Calendar,
  Tag
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSafety } from '@/context/SafetyContext';
import { PermitStatus } from '@/types';
import SignaturePad from '@/components/common/SignaturePad';

export default function WorkPermitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { workPermits, approveWorkPermit, rejectWorkPermit, updatePermitStatus } = useSafety();

  const permitId = params.id as string;
  const permit = workPermits.find(p => p.id === permitId);

  const [origin, setOrigin] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [officerSignature, setOfficerSignature] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!permit) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-900 mb-2">허가서를 찾을 수 없습니다.</h2>
        <Link href="/work-permits" className="text-blue-700 hover:underline text-sm font-bold">
          ← 허가서 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const qrUrl = `${origin}/qr-permit/${permit.id}`;

  const handlePrint = () => {
    window.print();
  };

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerSignature && !permit.officerSignature) {
      alert('안전관리 책임자 자필 승인 서명을 작성해 주세요.');
      return;
    }

    approveWorkPermit(
      permit.id,
      '이상욱 안전관리 책임자',
      '이상욱(인)',
      officerSignature || permit.officerSignature
    );

    setShowApproveModal(false);
    alert('안전작업허가서가 이상욱 안전관리 책임자의 자필 서명과 함께 승인되었습니다.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action Bar (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/work-permits?tab=submissions"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-600">{permit.permitNumber}</span>
              <span className="text-xs text-slate-800">|</span>
              <span className="text-xs font-bold text-slate-800">{permit.studioName}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">{permit.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {permit.status === '승인대기' && (
            <>
              <button
                onClick={() => setShowApproveModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>자필 서명 승인하기</span>
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>반려</span>
              </button>
            </>
          )}

          {permit.status === '승인완료' && (
            <button
              onClick={() => updatePermitStatus(permit.id, '작업진행중')}
              className="px-4 py-2.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1.5 transition"
            >
              <Clock className="w-4 h-4" />
              <span>작업 시작 처리</span>
            </button>
          )}

          {permit.status === '작업진행중' && (
            <button
              onClick={() => updatePermitStatus(permit.id, '작업완료')}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>작업 완료 처리</span>
            </button>
          )}

          <button
            onClick={() => setShowPdfModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#FF4B3E]/20 hover:bg-[#FF4B3E] text-blue-800 hover:text-white border border-[#FF4B3E]/30 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>PDF 정식 서류 보기</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-700 text-slate-800 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>A4 인쇄 / PDF 저장</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OFFICIAL A4 DOCUMENT SHEET (With Top-Right Dual Approval Signature Boxes)  */}
      {/* ========================================================================= */}
      <div className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border-4 border-slate-300 print:border-none print:p-0 print:shadow-none print-container">
        {/* Document Header & Top-Right Dual Approval Box */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-slate-900">
          <div>
            <div className="text-xs font-black tracking-widest text-slate-800 uppercase">
              STUDIO PRISM SAFETY WORK PERMIT
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              안 전 작 업 허 가 서
            </h1>
            <div className="text-xs font-mono font-bold text-[#FF4B3E] mt-1 flex items-center gap-2">
              <span>허가번호: {permit.permitNumber}</span>
              <span>·</span>
              <span className={`px-2 py-0.5 rounded font-black ${
                permit.status === '승인완료' ? 'bg-emerald-100 text-emerald-800' :
                permit.status === '승인대기' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {permit.status}
              </span>
            </div>
          </div>

          {/* Top-Right Dual Signature Approval Table */}
          <div className="shrink-0 border-2 border-slate-900 rounded-xl overflow-hidden shadow-sm bg-white">
            <table className="text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-900 text-[11px]">
                  <th className="px-5 py-1.5 border-r border-slate-900 w-32">제출자 (제작진)</th>
                  <th className="px-5 py-1.5 w-32">승인자 (안전관리자)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-20 border-b border-slate-300">
                  {/* Submitter (Worker/Production Team) Signature Box */}
                  <td className="px-2 py-1 border-r border-slate-900 align-middle bg-slate-50/50">
                    {permit.managerSignature ? (
                      <div className="flex flex-col items-center justify-center">
                        <img src={permit.managerSignature} alt="제출자 자필 서명" className="h-12 object-contain" />
                        <span className="text-[10px] text-slate-800 font-bold">{permit.managerName}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-800 font-medium">{permit.managerName}<br />(서명)</div>
                    )}
                  </td>

                  {/* Approver (Safety Manager) Signature Box */}
                  <td className="px-2 py-1 align-middle bg-slate-50/50">
                    {permit.officerSignature ? (
                      <div className="flex flex-col items-center justify-center">
                        <img src={permit.officerSignature} alt="안전관리 책임자 승인 서명" className="h-12 object-contain" />
                        <span className="text-[10px] text-emerald-700 font-bold">이상욱(인)</span>
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold text-amber-600 py-2">
                        {permit.status === '승인대기' ? '[승인 대기중]' : '이상욱(인)'}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="text-[10px] text-slate-800 font-mono bg-slate-100/60">
                  <td className="py-1 border-r border-slate-900">{permit.createdAt.slice(0, 10)}</td>
                  <td className="py-1">{permit.approvedAt ? permit.approvedAt.slice(0, 10) : '승인 대기'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 1: Overview Table */}
        <div className="mt-6 space-y-2">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF4B3E]"></span>
            1. 기본 작업 및 촬영 개요
          </div>
          <table className="w-full text-xs text-left border border-slate-300">
            <tbody>
              <tr className="border-b border-slate-300">
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">작업명</th>
                <td className="p-2.5 font-black text-slate-900" colSpan={3}>{permit.title}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">작품 / 프로그램</th>
                <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">{permit.productionName}</td>
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">작업 / 촬영 장소</th>
                <td className="p-2.5 font-bold text-slate-900">{permit.studioName}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">작업 외주업체</th>
                <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">{permit.contractorName}</td>
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">현장 작업책임자</th>
                <td className="p-2.5 font-bold text-slate-900">{permit.managerName} ({permit.managerContact})</td>
              </tr>
              <tr className="border-b border-slate-300">
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">작업 인원</th>
                <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">{permit.workerCount}명</td>
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">작업 / 촬영 일시</th>
                <td className="p-2.5 font-mono font-bold text-blue-900">
                  {permit.startDate} ~ {permit.endDate}
                </td>
              </tr>
              {permit.weather && (
                <tr className="border-b border-slate-300">
                  <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">현장 기상 / 기온</th>
                  <td className="p-2.5 font-bold text-slate-900" colSpan={3}>
                    {permit.weather} {permit.temperature ? `(${permit.temperature}℃)` : ''}
                  </td>
                </tr>
              )}
              <tr>
                <th className="bg-slate-100 p-2.5 font-bold text-slate-700 w-28 border-r border-slate-300">작업 유형·등급</th>
                <td className="p-2.5 font-bold text-slate-900" colSpan={3}>
                  <span className={`px-2 py-0.5 rounded font-black mr-2 text-xs ${
                    permit.riskLevel === '고위험' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-blue-100 text-blue-800'
                  }`}>
                    [{permit.riskLevel}] {permit.workType}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Hazards and Safety Measures */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-rose-300 rounded-xl p-3.5 bg-rose-50/50">
            <span className="font-black text-rose-800 text-xs block mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              확인된 주요 유해위험요인
            </span>
            <ul className="text-xs text-rose-950 space-y-1 pl-2 font-medium">
              {permit.hazards.map((h, idx) => (
                <li key={idx}>● {h}</li>
              ))}
            </ul>
          </div>

          <div className="border border-emerald-300 rounded-xl p-3.5 bg-emerald-50/50">
            <span className="font-black text-emerald-800 text-xs block mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              현장 필수 준수 안전조치사항
            </span>
            <ul className="text-xs text-emerald-950 space-y-1 pl-2 font-medium">
              {permit.safetyMeasures.map((m, idx) => (
                <li key={idx}>● {m}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 3: PPE */}
        <div className="mt-5 p-3 rounded-xl bg-slate-100 border border-slate-300">
          <span className="text-xs font-black text-slate-800 block mb-1.5 flex items-center gap-1">
            <HardHat className="w-3.5 h-3.5 text-[#FF4B3E]" />
            필수 착용 개인보호구 (100% 착용 의무)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {permit.requiredPPE.map((ppe, i) => (
              <span key={i} className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800">
                ✓ {ppe}
              </span>
            ))}
          </div>
        </div>

        {/* Section 4: Safety Checklist Table */}
        <div className="mt-6 space-y-2">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF4B3E]"></span>
            2. 작업 전 안전점검 체크리스트 결과
          </div>
          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700">
              <tr>
                <th className="p-2 border-r border-slate-300 w-24">구분</th>
                <th className="p-2 border-r border-slate-300">점검 항목</th>
                <th className="p-2 text-center w-20">점검결과</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {permit.checklists.map(c => (
                <tr key={c.id}>
                  <td className="p-2 font-bold text-slate-800 bg-slate-50 border-r border-slate-300">{c.category}</td>
                  <td className="p-2 text-slate-800 font-medium border-r border-slate-300">{c.item}</td>
                  <td className="p-2 text-center font-bold text-emerald-700">
                    {c.checked ? '✓ 적합' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Guarantee Statement & QR Badge */}
        <div className="mt-8 pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed max-w-lg">
            <p className="font-bold text-slate-900">
              본 작업은 산업안전보건법 및 스튜디오프리즘 안전관리규정에 따라 적법하게 승인된 안전작업허가서입니다.
            </p>
            <p className="text-[11px] text-slate-800">
              * 작업 중 안전수칙 미준수 또는 돌발 위험 발생 시 즉시 작업을 중지하고 안전관리자에게 보고하여야 합니다.
            </p>
            <div className="text-[11px] text-slate-800 font-bold pt-1">
              이상욱 안전관리 책임자 직통: 010-6670-3534 | 응급 119
            </div>
          </div>

          <div className="text-center bg-slate-50 p-3 rounded-2xl border border-slate-300 shrink-0">
            <QRCodeSVG value={qrUrl} size={90} level="H" includeMargin={false} />
            <span className="text-[9px] font-mono font-bold text-slate-800 block mt-1">
              스마트폰 진위확인 QR
            </span>
          </div>
        </div>
      </div>

      {/* Approve Modal with Signature Pad */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">안전작업허가서 승인 & 책임자 자필 서명</h3>
                <div className="text-xs text-sky-400 font-mono mt-0.5">{permit.permitNumber}</div>
              </div>
              <button onClick={() => setShowApproveModal(false)} className="text-slate-800 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-800">작업명:</span>
                  <span className="font-bold text-slate-900">{permit.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-800">시공업체 / 책임자:</span>
                  <span className="text-slate-800 font-bold">{permit.contractorName} / {permit.managerName}</span>
                </div>
                {permit.managerSignature && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-800">제작진(작업자) 제출 자필 서명:</span>
                    <div className="bg-white px-2 py-0.5 rounded border border-slate-200">
                      <img src={permit.managerSignature} alt="작업자 서명" className="h-6 object-contain" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <SignaturePad
                  title="이상욱 안전관리 책임자 자필 승인 서명 (필수)"
                  placeholderText="여기에 안전관리 책임자 자필 서명을 작성해 주세요"
                  onChange={data => setOfficerSignature(data)}
                  height={120}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-600/30"
                >
                  자필 서명 승인 확정
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-black text-slate-900">안전작업허가 반려</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-800 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-rose-700 mb-1">반려 사유 입력 *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="예: 소화기 미비치 및 방염포 시공 두께 부족으로 인한 보완 요청"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!rejectReason) {
                      alert('반려 사유를 입력해 주세요.');
                      return;
                    }
                    rejectWorkPermit(permit.id, rejectReason);
                    setShowRejectModal(false);
                    alert('허가서가 반려 처리되었습니다.');
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black"
                >
                  반려 확정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen PDF Document Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 my-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                <FileText className="w-5 h-5 text-sky-400" />
                <span>정식 안전작업허가서 PDF 미리보기</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs flex items-center gap-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>인쇄 / PDF 저장</span>
                </button>
                <button onClick={() => setShowPdfModal(false)} className="p-1.5 text-slate-800 hover:text-slate-900 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="bg-white text-slate-900 rounded-2xl p-8 border border-slate-300 text-xs space-y-4">
                <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">안 전 작 업 허 가 서</h2>
                    <div className="text-xs font-mono font-bold text-blue-800 mt-0.5">{permit.permitNumber}</div>
                  </div>
                  <div className="border border-slate-900 rounded-lg overflow-hidden text-center text-[10px]">
                    <div className="grid grid-cols-2 bg-slate-100 font-bold border-b border-slate-900">
                      <span className="px-3 py-1 border-r border-slate-900">제출자 (제작진)</span>
                      <span className="px-3 py-1">승인자 (안전관리자)</span>
                    </div>
                    <div className="grid grid-cols-2 h-14 items-center">
                      <div className="border-r border-slate-900 px-2">
                        {permit.managerSignature ? (
                          <img src={permit.managerSignature} alt="제작진 서명" className="h-8 mx-auto object-contain" />
                        ) : (
                          <span>{permit.managerName}</span>
                        )}
                      </div>
                      <div className="px-2">
                        {permit.officerSignature ? (
                          <img src={permit.officerSignature} alt="승인 서명" className="h-8 mx-auto object-contain" />
                        ) : (
                          <span className="text-amber-600 font-bold">[승인대기]</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border border-slate-200 p-3 rounded-lg">
                  <div><strong>작업명:</strong> {permit.title}</div>
                  <div><strong>작업장소:</strong> {permit.studioName}</div>
                  <div><strong>시공업체:</strong> {permit.contractorName}</div>
                  <div><strong>책임자:</strong> {permit.managerName} ({permit.managerContact})</div>
                  <div className="col-span-2 font-mono text-blue-900">
                    <strong>작업일시:</strong> {permit.startDate} ~ {permit.endDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
