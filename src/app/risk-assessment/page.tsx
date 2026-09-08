'use client';

import React, { useState } from 'react';
import { ShieldAlert, Plus, Filter, Search, CheckCircle2, AlertTriangle, Flame, ArrowRight } from 'lucide-react';
import { RiskAssessmentItem } from '@/types';

export default function RiskAssessmentPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const riskDB: RiskAssessmentItem[] = [
    {
      id: 'r1',
      jobCategory: '야외 경기장 세트·조명타워 (골 때리는 그녀들)',
      workStep: '야외 경기장 잔디보호재 시공, 조명타워 4점 지지 결속 및 펜스 안전매트 설치',
      hazardFactor: '폭염/한파 온열·한냉 질환, 선수 격렬한 운동 중 충돌 및 조명타워 전도',
      riskSeverity: 4,
      riskProbability: 3,
      riskScore: 12,
      currentMeasures: '잔디 보호재 및 안전매트 부분 시공',
      improvementMeasures: '경기장 전면 펜스 충격완화 매트 100% 시공, 야외 그늘막·식수대 상시 비치, 조명타워 와이어 지지 강화, 구급차 현장 대기',
      manager: '이상욱 책임자',
      dueDate: '2026-09-02',
      isCompleted: true
    },
    {
      id: 'r2',
      jobCategory: '도심·야외 로케이션 미션작업 (런닝맨)',
      workStep: '도심 도로점용 이동 촬영 및 에어바운스/미션 임시 구조물 설치',
      hazardFactor: '차량 통행 도로 교통사고, 군중 밀집에 따른 통제선 붕괴 및 고소 미션 추락',
      riskSeverity: 4,
      riskProbability: 4,
      riskScore: 16,
      currentMeasures: '안전요원 4명 배치',
      improvementMeasures: '관할 경찰서 도로점용 허가 득, 모범운전자 교통통제선 구축, 군중통제 펜스 설치, 에어바운스 6점 앵커 와이어 결속',
      manager: '이상욱 책임자',
      dueDate: '2026-09-02',
      isCompleted: true
    },
    {
      id: 'r3',
      jobCategory: '무대 트러스 리깅·특수효과 (우리들의 발라드 / 인기가요)',
      workStep: '상암 스튜디오 12m 상부 트러스 조명 리깅 및 화약/불꽃 특수효과 연출',
      hazardFactor: '고소 작업 중 추락, 호이스트 양중 중 고중량 낙하, 화약 연출 시 화재 및 질식',
      riskSeverity: 5,
      riskProbability: 3,
      riskScore: 15,
      currentMeasures: '기본 안전대 착용 및 소화기 4대 배치',
      improvementMeasures: '2점식 하네스 생명줄 2중 체결, 하부 10m 접근 금지 구획, 방염포 3중 시공 및 소화기 8대 전진 배치, 소방서 사전 신고',
      manager: '이상욱 책임자',
      dueDate: '2026-09-02',
      isCompleted: true
    },
    {
      id: 'r4',
      jobCategory: '실내 스튜디오 및 로케이션 세팅 (틈만나면 / 동상이몽 / 미우새 / 비서진)',
      workStep: '일반 주거지/상가 로케이션 실내 촬영 장비 세팅 및 이동식 조명 스탠드 운용',
      hazardFactor: '실내 협소 공간 자재 운반 중 협착, 바닥 노출 케이블 발걸림 전도, 조명 스탠드 전도',
      riskSeverity: 3,
      riskProbability: 4,
      riskScore: 12,
      currentMeasures: '바닥 테이핑 마감',
      improvementMeasures: '바닥 전선 황색 고무 프로텍터(몰드) 100% 매립 시공, 조명 스탠드 샌드백(15kg) 3점 고정, 2인 1조 운반 준수',
      manager: '이상욱 책임자',
      dueDate: '2026-09-02',
      isCompleted: true
    },
    {
      id: 'r5',
      jobCategory: '임시전력·대형 발전차 배선 (예능 야외녹화 공통)',
      workStep: '300kW 발전차 연계 전원 포설 및 야외 임시 분전반 연결',
      hazardFactor: '고압 전원선 누전 및 감전, 발전차 엔진 과열 및 유류 화재',
      riskSeverity: 4,
      riskProbability: 3,
      riskScore: 12,
      currentMeasures: '차단기 육안 확인',
      improvementMeasures: '중하중 케이블 프로텍터 시공, ELB 누전차단기 감도 30mA 동작 시험, 접지봉 시공 및 유류용 소화기 2대 배치',
      manager: '이상욱 책임자',
      dueDate: '2026-09-02',
      isCompleted: true
    }
  ];

  const categories = [
    '전체',
    '야외 경기장 세트·조명타워 (골 때리는 그녀들)',
    '도심·야외 로케이션 미션작업 (런닝맨)',
    '무대 트러스 리깅·특수효과 (우리들의 발라드 / 인기가요)',
    '실내 스튜디오 및 로케이션 세팅 (틈만나면 / 동상이몽 / 미우새 / 비서진)',
    '임시전력·대형 발전차 배선 (예능 야외녹화 공통)'
  ];

  const filteredDB = riskDB.filter(r => selectedCategory === '전체' || r.jobCategory === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-indigo-400" />
            방송제작 공종별 위험성평가 관리
          </h1>
          <p className="text-sm text-slate-800 mt-1">
            방송 촬영 및 세트 제작 15대 고위험 공종에 대한 위험요인, 위험도(빈도×강도), 추가 개선대책을 수립·관리합니다.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl font-bold transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Risk Assessment Cards */}
      <div className="space-y-4">
        {filteredDB.map(risk => {
          const isVeryHigh = risk.riskScore >= 12;
          return (
            <div key={risk.id} className="bg-slate-100 border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-indigo-400">[{risk.jobCategory}]</span>
                  <h3 className="text-lg font-black text-white mt-0.5">{risk.workStep}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="text-slate-800">위험도 점수: </span>
                    <span className={`font-black text-sm px-2 py-0.5 rounded ${
                      isVeryHigh ? 'bg-rose-500/20 text-rose-700 border border-rose-500/30' : 'bg-amber-500/20 text-amber-700'
                    }`}>
                      {risk.riskScore}점 (강도 {risk.riskSeverity} × 빈도 {risk.riskProbability})
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    risk.isCompleted ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-700'
                  }`}>
                    {risk.isCompleted ? '개선완료' : '개선진행중'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-rose-700 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 유해·위험요인
                  </div>
                  <p className="text-slate-700 leading-relaxed">{risk.hazardFactor}</p>
                  <div className="mt-2 text-[11px] text-slate-800">
                    현재 안전조치: {risk.currentMeasures}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-emerald-700 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 필수 추가 감소대책
                  </div>
                  <p className="text-slate-800 leading-relaxed">{risk.improvementMeasures}</p>
                  <div className="mt-2 text-[11px] text-slate-800 flex justify-between">
                    <span>담당자: {risk.manager}</span>
                    <span>개선기한: {risk.dueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
