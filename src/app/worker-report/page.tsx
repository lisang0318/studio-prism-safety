'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquareWarning,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Send,
  ShieldCheck,
  PenTool,
  FileText,
  Printer,
  X,
  MapPin,
  User,
  Phone
} from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';
import { OpinionType } from '@/types';
import SignaturePad from '@/components/common/SignaturePad';

function WorkerReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addWorkerOpinion, programs } = useSafety();

  const [studioName, setStudioName] = useState('');
  const [workTitle, setWorkTitle] = useState('');
  const [opinionType, setOpinionType] = useState<OpinionType>('위험요인');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorContact, setAuthorContact] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [workerSignature, setWorkerSignature] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    const s = searchParams.get('studio');
    const w = searchParams.get('work');
    if (s) setStudioName(decodeURIComponent(s));
    if (w) setWorkTitle(decodeURIComponent(w));
  }, [searchParams]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(reader.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setPhotoPreview(compressed);
      } catch (err) {
        console.error('Photo compression error:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !studioName || !authorName.trim() || !authorContact.trim()) {
      alert('필수 입력 항목(현장 장소, 제보 제목, 상세 내용, 제보자 성명, 연락처)을 모두 입력해 주세요.');
      return;
    }
    if (!workerSignature) {
      alert('근로자 자필 서명을 패드에 작성해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newOp = await addWorkerOpinion({
        studioName,
        workTitle: workTitle || '예능 제작현장',
        opinionType,
        title,
        content,
        authorName: authorName.trim(),
        authorContact: authorContact.trim(),
        photos: photoPreview ? [photoPreview] : [],
        workerSignature: workerSignature || undefined
      });

      setSubmittedNumber(newOp?.opinionNumber || 'VOICE-접수완료');
      setIsSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      alert('제보 전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // SUBMISSION SUCCESS VIEW (Bright Clean White Theme)
  // =========================================================================
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">현장 위험 제보 접수 완료</h2>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-[#FF4B3E] font-bold">
            접수 번호: {submittedNumber}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            제보해주신 예능 제작현장 안전 위험사항이 <strong>이상욱 안전관리 책임자</strong>에게 실시간으로 전달되었습니다. 신속히 현장을 점검하고 조치하겠습니다.
          </p>

          {workerSignature && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center max-w-[200px] mx-auto">
              <span className="text-[10px] text-slate-500 block font-bold mb-1">제출된 근로자 자필 서명</span>
              <img src={workerSignature} alt="근로자 자필 서명" className="h-12 mx-auto object-contain" />
            </div>
          )}

          <div className="pt-3 space-y-2">
            <button
              onClick={() => setShowPdfModal(true)}
              className="w-full py-3.5 rounded-2xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-xs shadow-md shadow-[#FF4B3E]/25 flex items-center justify-center gap-1.5 transition"
            >
              <FileText className="w-4 h-4" />
              <span>제보 접수증 PDF 미리보기 / 저장</span>
            </button>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setTitle('');
                setContent('');
                setPhotoPreview(null);
                setWorkerSignature(null);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition"
            >
              추가 제보 작성하기
            </button>
          </div>
        </div>

        {/* PDF Preview Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-6 my-6 shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <FileText className="w-4 h-4 text-[#FF4B3E]" />
                  <span>근로자 위험 제보 접수증 (A4)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PDF 저장 / 인쇄</span>
                  </button>
                  <button
                    onClick={() => setShowPdfModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* A4 Sheet Content */}
              <div className="flex-1 overflow-y-auto bg-white text-slate-900 rounded-2xl p-6 border border-slate-300 text-xs space-y-4">
                <div className="text-center pb-3 border-b-2 border-slate-900">
                  <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase">STUDIO PRISM WORKER VOICE</div>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">예능 제작현장 안전 위험의견 접수증</h2>
                  <div className="text-xs font-mono font-bold text-[#FF4B3E] mt-0.5">
                    접수번호: {submittedNumber} | 일시: {new Date().toISOString().replace('T', ' ').slice(0, 16)}
                  </div>
                </div>

                <table className="w-full text-xs text-left border border-slate-400">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">제보 유형</th>
                      <td className="p-2 font-black text-slate-900 border-r border-slate-300">{opinionType}</td>
                      <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">촬영 장소</th>
                      <td className="p-2 font-bold text-slate-900">{studioName}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">제보자</th>
                      <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{authorName} ({authorContact})</td>
                      <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">진행 상태</th>
                      <td className="p-2 font-bold text-amber-700">접수완료 (확인중)</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">제보 제목</th>
                      <td className="p-2 font-black text-slate-900" colSpan={3}>{title}</td>
                    </tr>
                    <tr>
                      <th className="bg-slate-100 p-2 font-bold text-slate-700 w-24 border-r border-slate-300">제보 내용</th>
                      <td className="p-2 text-slate-900 whitespace-pre-line leading-relaxed" colSpan={3}>
                        {content}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {photoPreview && (
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">● 첨부된 현장 위험 사진:</span>
                    <img src={photoPreview} alt="현장 사진" className="max-h-48 rounded-xl border border-slate-300 object-cover" />
                  </div>
                )}

                {workerSignature && (
                  <div className="pt-2 flex justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block mb-1">제보자 자필 확인:</span>
                      <img src={workerSignature} alt="서명" className="h-10 ml-auto object-contain border-b border-slate-400" />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500 font-bold">
                  스튜디오프리즘 안전관리단 | 안전보건 총괄책임: 이상욱 (010-6670-3534)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // NORMAL FORM VIEW (Studio Prism Bright White & Red Brand Theme)
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
            방송제작 현장 근로자 의견청취·위험제보
          </h1>
          <p className="text-xs text-rose-100 mt-1">
            스튜디오 녹화, 야외 로케이션, 무대·세트 설치 등 방송제작 현장의 안전 위험요소 및 개선의견을 제보해 주시면 즉시 점검 후 조치합니다.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs">
          {/* 1. Opinion Type Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              1. 제보 유형 선택 *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['위험요인', '불편사항', '개선의견', '안전시설 요청', '작업방법 개선', '기타'] as OpinionType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOpinionType(type)}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs border transition ${
                    opinionType === type
                      ? 'bg-[#FF4B3E] border-[#FF4B3E] text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Studio / Shooting Location (Variety Specific Placeholder) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              2. 위험 발생 세트장 / 장소 *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="예: 상암 프리즘타워 3스튜디오, 강화 야외경기장, 탄현 세트장, 도심 로케이션"
                value={studioName}
                onChange={e => setStudioName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-xs focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Program or Work Title (Variety Specific Placeholder + Quick Chips) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">3. 관련 작품 / 프로그램명 (선택)</label>
              {programs && programs.length > 0 && (
                <span className="text-[10px] text-[#FF4B3E] font-bold">등록 프로그램 바로가기</span>
              )}
            </div>
            <input
              type="text"
              placeholder="작품 또는 프로그램명을 입력하세요 (예: [골 때리는 그녀들], [런닝맨], [우리들의 발라드], [틈만나면,])"
              value={workTitle}
              onChange={e => setWorkTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-xs font-bold focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
            />
            {programs && programs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {programs.map(prog => (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() => setWorkTitle(prog.title)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                      workTitle === prog.title
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

          {/* 4. Title (Variety Specific Placeholder) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              4. 위험 제보 제목 *
            </label>
            <input
              type="text"
              required
              placeholder="예: 방청객 이동 통로 조명 케이블 걸림 위험, 야외 게임 세트 구조물 흔들림"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 text-xs font-bold focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
            />
          </div>

          {/* 5. Detailed Description (Variety Specific Placeholder) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              5. 위험 내용 및 개선 요청 사항 *
            </label>
            <textarea
              rows={3}
              required
              placeholder="예능 녹화 중 출연자/방청객 이동 동선 및 게임 세트, 고소 조명 등 위험 상황을 구체적으로 적어 주세요"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 text-xs focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
            />
          </div>

          {/* 6. Photo Upload */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              6. 현장 사진 첨부 (선택)
            </label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#FF4B3E] rounded-2xl cursor-pointer bg-slate-50 transition">
              <Camera className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-[11px] text-slate-600 font-bold">스마트폰 카메라로 촬영 또는 갤러리 선택</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            {photoPreview && (
              <div className="mt-2 relative inline-block">
                <img src={photoPreview} alt="미리보기" className="h-28 rounded-xl border border-slate-300 object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs shadow"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* 7. Submitter Info */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">제보자 성명 *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동 (스태프)"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-900 placeholder-slate-400 text-xs font-bold focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">연락처 *</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="예: 010-1234-5678"
                  value={authorContact}
                  onChange={e => setAuthorContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-900 placeholder-slate-400 text-xs font-mono focus:border-[#FF4B3E] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 8. Signature Pad */}
          <div className="pt-2 border-t border-slate-200">
            <SignaturePad
              title="제보자 자필 서명 (필수)"
              placeholderText="손가락 또는 터치펜으로 서명해 주세요"
              onChange={data => setWorkerSignature(data)}
              height={100}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black text-sm rounded-2xl shadow-lg shadow-[#FF4B3E]/30 transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>위험 제보 접수하기</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WorkerReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 text-slate-500 flex items-center justify-center font-bold">로딩 중...</div>}>
      <WorkerReportContent />
    </Suspense>
  );
}
