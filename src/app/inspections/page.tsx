'use client';

import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  X
} from 'lucide-react';
import { useSafety } from '@/context/SafetyContext';
import { SafetyInspectionItem } from '@/types';

export default function InspectionsPage() {
  const { inspections, addSafetyInspection } = useSafety();

  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState('스튜디오 A (탄현 1세트)');
  const [productionName, setProductionName] = useState('SBS 드라마 [열혈사제2]');
  const [inspectorName, setInspectorName] = useState('이상욱 안전관리 책임자');
  const [correctiveActions, setCorrectiveActions] = useState('');

  // 19 Broadcast Stage Safety Inspection Items
  const initialItems: SafetyInspectionItem[] = [
    { id: '1', category: '통로 및 피난', title: '비상구 및 통행로 확보', description: '비상구 앞 적재물 유무 및 유도등 점등 상태', result: '양호' },
    { id: '2', category: '통로 및 피난', title: '작업구역 구획 및 바리케이드', description: '출입금지 테이프 및 위험구역 식별 표지', result: '양호' },
    { id: '3', category: '추락 및 전도', title: '고소작업 안전대 체결', description: '트러스 및 2m 이상 고소작업 시 안전하네스 이중 체결', result: '양호' },
    { id: '4', category: '추락 및 전도', title: 'A형 사다리 안전수칙', description: '최상단 발판 작업 금지 및 2인 1조 작업 여부', result: '양호' },
    { id: '5', category: '추락 및 전도', title: '이동식 비계 및 작업발판', description: '바퀴 브레이크 고정 및 안전난간대 설치 상태', result: '양호' },
    { id: '6', category: '낙하 및 비산', title: '공구 낙하방지끈 체결', description: '상부 작업 시 수공구/전동공구 안전고리 체결', result: '양호' },
    { id: '7', category: '낙하 및 비산', title: '세트 상부 부재 고정 상태', description: '조명기구, 스피커, 백드롭 와이어 결속 안전율', result: '양호' },
    { id: '8', category: '전기 및 조명', title: '바닥 배선 케이블 프로텍터', description: '통로 횡단 케이블 보호 덮개 및 램프 설치', result: '양호' },
    { id: '9', category: '전기 및 조명', title: '임시 분전함 누전차단기', description: 'ELB 정상 작동 및 접지선 체결 상태', result: '양호' },
    { id: '10', category: '소방 및 화기', title: '소화기 적정 비치', description: 'ABC 소화기 충약 압력 및 20m 간격 배치', result: '양호' },
    { id: '11', category: '소방 및 화기', title: '특수효과 연화·화기 안전조치', description: '방염포 시공, 소방서 신고필증, 화재감시자 상주', result: '양호' },
    { id: '12', category: '중량물 및 장비', title: '체인호이스트 및 리깅 하중', description: '트러스 허용 정격하중 초과 여부 점검', result: '양호' },
    { id: '13', category: '중량물 및 장비', title: '지게차 및 고소작업차', description: '신호수 배치, 후진 경보기, 작업반경 통제', result: '양호' },
    { id: '14', category: '전동 공구', title: '목공 톱 및 타카 방호장치', description: '원형톱 톱날 덮개 및 반발예방장치', result: '양호' },
    { id: '15', category: '보호구', title: '작업자 개인보호구 착용', description: '안전모, 안전화, 보안경, 방진마스크 착용', result: '양호' },
    { id: '16', category: '현장 환경', title: '조도 및 환기 상태', description: '야간 작업 조도 300 Lux 이상 및 스모크 배기팬 가동', result: '양호' },
    { id: '17', category: '정리정돈', title: '폐목재 및 못 제거', description: '세트 해체 후 돌출 못 구부림 및 폐기물 반출', result: '양호' },
    { id: '18', category: '보건 및 위생', title: '음용수 및 휴게공간', description: '온·냉수 비치 및 작업자 의무 휴식시간 준수', result: '양호' },
    { id: '19', category: '비상연락', title: '비상연락망 현장 게시', description: '종합상황실, 관할 소방서, 병원 연락처 부착', result: '양호' }
  ];

  const [items, setItems] = useState<SafetyInspectionItem[]>(initialItems);

  const handleItemResultChange = (id: string, result: '양호' | '개선필요' | '불량' | '해당없음') => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, result } : it)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasDefects = items.some(i => i.result === '불량');
    const hasImprovements = items.some(i => i.result === '개선필요');
    const overallResult = hasDefects ? '부적합' : hasImprovements ? '조건부적합' : '적합';

    addSafetyInspection({
      studioName: selectedStudio,
      productionName,
      inspectorName,
      inspectionDate: new Date().toISOString().slice(0, 10),
      items,
      overallResult,
      correctiveActions: correctiveActions || (overallResult === '적합' ? '특이사항 없음' : '현장 즉시 시정 조치 지시'),
      photos: []
    });

    setShowNewModal(false);
    alert('현장 안전점검표가 등록되었습니다.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-emerald-600" />
            현장 안전점검표 관리
          </h1>
          <p className="text-sm text-slate-800 mt-1">
            방송 세트장 19개 법정 및 사내 안전점검 항목을 모바일/PC에서 실시간 순회 점검하고 시정조치를 관리합니다.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>신규 안전점검표 작성</span>
        </button>
      </div>

      {/* Inspections History List */}
      <div className="space-y-4">
        {inspections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
            <ClipboardCheck className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-slate-900">등록된 현장 안전점검표가 없습니다</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              상단의 [신규 안전점검표 작성] 버튼을 눌러 스튜디오 점검 결과를 기록하세요.
            </p>
          </div>
        ) : (
          inspections.map(insp => {
            const goodCount = insp.items.filter(i => i.result === '양호').length;
            const needCount = insp.items.filter(i => i.result === '개선필요').length;
            const badCount = insp.items.filter(i => i.result === '불량').length;

            return (
              <div key={insp.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sky-600 font-bold text-xs">{insp.inspectionNumber}</span>
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-xs font-bold text-slate-700">{insp.inspectionDate}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      {insp.studioName} - {insp.productionName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        양호 {goodCount}
                      </span>
                      {needCount > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200">
                          개선필요 {needCount}
                        </span>
                      )}
                      {badCount > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          불량 {badCount}
                        </span>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      insp.overallResult === '적합' ? 'bg-emerald-600 text-white' :
                      insp.overallResult === '조건부적합' ? 'bg-amber-500 text-slate-950 font-bold' :
                      'bg-rose-600 text-white'
                    }`}>
                      {insp.overallResult}
                    </span>
                  </div>
                </div>

                {/* Items overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {insp.items.map(item => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        item.result === '양호' ? 'bg-slate-50 border-slate-200 text-slate-700' :
                        item.result === '개선필요' ? 'bg-amber-50 border-amber-300 text-amber-800' :
                        item.result === '불량' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                        'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="font-medium line-clamp-1">{item.title}</span>
                      <span className="font-bold text-[11px] shrink-0 ml-2">{item.result}</span>
                    </div>
                  ))}
                </div>

                {insp.correctiveActions && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-800 font-bold block mb-1">지적 및 시정조치 내용:</span>
                    <p className="text-slate-800">{insp.correctiveActions}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Inspection Checklist Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 text-slate-800 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-6 h-6 text-emerald-600" />
                  방송 세트장 19대 안전점검표 작성
                </h2>
                <p className="text-xs text-slate-800 mt-0.5">
                  현장 순회 점검 시 각 항목별로 터치하여 상태를 기록하세요.
                </p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-slate-800 hover:text-slate-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Top basic info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">점검 대상 스튜디오 *</label>
                  <select
                    value={selectedStudio}
                    onChange={e => setSelectedStudio(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="스튜디오 A (탄현 1세트)">스튜디오 A (탄현 1세트)</option>
                    <option value="스튜디오 B (탄현 2세트)">스튜디오 B (탄현 2세트)</option>
                    <option value="스튜디오 C (일산 대형세트)">스튜디오 C (일산 대형세트)</option>
                    <option value="야외 오픈세트 (문경)">야외 오픈세트 (문경)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">프로그램명</label>
                  <input
                    type="text"
                    value={productionName}
                    onChange={e => setProductionName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">점검자 성명</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={e => setInspectorName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* 19 Checklist Grid */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                <h3 className="font-black text-slate-900 text-sm">점검 항목 평가 (19개)</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                            {item.category}
                          </span>
                          <span className="font-bold text-slate-900">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-700">{item.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {(['양호', '개선필요', '불량', '해당없음'] as const).map(res => (
                          <button
                            key={res}
                            type="button"
                            onClick={() => handleItemResultChange(item.id, res)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs border transition ${
                              item.result === res
                                ? res === '양호' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : res === '개선필요' ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                                : res === '불량' ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                : 'bg-slate-300 text-slate-900 border-slate-400'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">지적사항 및 즉시 시정조치 내용</label>
                <textarea
                  rows={2}
                  placeholder="특이사항이나 현장 조치 내용을 입력하세요."
                  value={correctiveActions}
                  onChange={e => setCorrectiveActions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-600/20"
                >
                  점검표 완료 및 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
